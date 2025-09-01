import { DismissBannerRequestDto, OwnerSetupRequestDto } from '@n8n/api-types';
import { Logger } from '@n8n/backend-common';
import {
	AuthenticatedRequest,
	ProjectRelationRepository,
	ProjectRepository,
	SettingsRepository,
	SharedWorkflowRepository,
	TenantRepository,
	UserRepository,
} from '@n8n/db';
import { Body, GlobalScope, Post, RestController } from '@n8n/decorators';
import { Response } from 'express';

import { AuthService } from '@/auth/auth.service';
import config from '@/config';
import { BadRequestError } from '@/errors/response-errors/bad-request.error';
import { EventService } from '@/events/event.service';
import { validateEntity } from '@/generic-helpers';
import { PostHogClient } from '@/posthog';
import { BannerService } from '@/services/banner.service';
import { PasswordUtility } from '@/services/password.utility';
import { UserService } from '@/services/user.service';
import { Container } from '@n8n/di';
import { ExternalHooks } from '@/external-hooks';

@RestController('/owner')
export class OwnerController {
	constructor(
		private readonly logger: Logger,
		private readonly eventService: EventService,
		private readonly settingsRepository: SettingsRepository,
		private readonly authService: AuthService,
		private readonly bannerService: BannerService,
		private readonly userService: UserService,
		private readonly passwordUtility: PasswordUtility,
		private readonly postHog: PostHogClient,
		private readonly userRepository: UserRepository,
		private readonly externalHooks: ExternalHooks,
	) {}

	/**
	 * Promote a shell into the owner of the n8n instance,
	 * and enable `isInstanceOwnerSetUp` setting.
	 */
	// @Post('/setup', { skipAuth: true })
	// async setupOwner(req: AuthenticatedRequest, res: Response, @Body payload: OwnerSetupRequestDto) {
	// 	const { email, firstName, lastName, password } = payload;

	// 	if (config.getEnv('userManagement.isInstanceOwnerSetUp')) {
	// 		this.logger.debug(
	// 			'Request to claim instance ownership failed because instance owner already exists',
	// 		);
	// 		throw new BadRequestError('Instance owner already setup');
	// 	}

	// 	let owner = await this.userRepository.findOneOrFail({
	// 		where: { role: 'global:owner' },
	// 	});
	// 	owner.email = email;
	// 	owner.firstName = firstName;
	// 	owner.lastName = lastName;
	// 	owner.password = await this.passwordUtility.hash(password);
	// 	owner.tenantId = '3926b251-1aac-41a5-a0bf-b25fa2ba2222';
	// 	// TODO: move XSS validation out into the DTO class
	// 	await validateEntity(owner);

	// 	owner = await this.userRepository.save(owner, { transaction: false });

	// 	this.logger.info('Owner was set up successfully');

	// 	await this.settingsRepository.update(
	// 		{ key: 'userManagement.isInstanceOwnerSetUp' },
	// 		{ value: JSON.stringify(true) },
	// 	);

	// 	config.set('userManagement.isInstanceOwnerSetUp', true);

	// 	this.logger.debug('Setting isInstanceOwnerSetUp updated successfully');

	// 	this.authService.issueCookie(res, owner, req.authInfo?.usedMfa ?? false, req.browserId);

	// 	this.eventService.emit('instance-owner-setup', { userId: owner.id });

	// 	return await this.userService.toPublic(owner, { posthog: this.postHog, withScopes: true });
	// }
	// Tumhara code (already verified)
	@Post('/setup', { skipAuth: true })
	async setupOwner(req: AuthenticatedRequest, res: Response, @Body payload: OwnerSetupRequestDto) {
		const { email, firstName, lastName, password, businessName } = payload;

		if (!email || !firstName || !lastName || !password || !businessName) {
			this.logger.debug('Request to set up owner failed because of missing fields in payload', {
				payload,
			});
			throw new BadRequestError('Missing fields in payload');
		}

		const tenantRepo = Container.get(TenantRepository);
		const existingTenant = await tenantRepo.findOne({ where: { name: businessName } });
		if (existingTenant) {
			this.logger.debug('Request to set up owner failed because tenant name already exists', {
				businessName,
			});
			throw new BadRequestError('Business name already taken');
		}

		const existingUser = await this.userRepository.findOne({ where: { email } });
		if (existingUser) {
			this.logger.debug('Request to set up owner failed because email already exists', { email });
			throw new BadRequestError('Email already registered');
		}

		const tenant = tenantRepo.create({ name: businessName });
		const savedTenant = await tenantRepo.save(tenant);
		this.logger.debug('Created tenant', { tenantId: savedTenant.id });

		const userRepo = Container.get(UserRepository);
		const { user: savedUser, project: savedPersonalProject } = await userRepo.createUserWithProject(
			{
				email,
				firstName,
				lastName,
				password: await this.passwordUtility.hash(password),
				role: 'global:owner',
			},
			undefined,
			savedTenant.id,
		);
		this.logger.debug('Created user with personal project', {
			userId: savedUser.id,
			projectId: savedPersonalProject.id,
			tenantId: savedTenant.id,
		});

		const projectRepo = Container.get(ProjectRepository);
		const teamProject = projectRepo.create({
			name: `Team Project for ${businessName}`,
			type: 'team',
			tenantId: savedTenant.id,
		});
		const savedTeamProject = await projectRepo.save(teamProject);
		this.logger.debug('Created team project', {
			projectId: savedTeamProject.id,
			tenantId: savedTenant.id,
		});

		const projectRelationRepo = Container.get(ProjectRelationRepository);
		const teamProjectRelation = projectRelationRepo.create({
			projectId: savedTeamProject.id,
			userId: savedUser.id,
			role: 'project:admin',
			project: savedTeamProject,
			user: savedUser,
		});
		await projectRelationRepo.save(teamProjectRelation);
		this.logger.debug(
			`Assigned user ${savedUser.id} as project:admin for team project ${savedTeamProject.id}`,
		);

		this.authService.issueCookie(res, savedUser, false, req.browserId);

		this.eventService.emit('user-signed-up', {
			user: savedUser,
			userType: 'email',
			wasDisabledLdapUser: false,
		});

		const publicUser = await this.userService.toPublic(savedUser, {
			posthog: this.postHog,
			withScopes: true,
		});

		await this.externalHooks.run('user.created', [publicUser]);

		this.eventService.emit('tenant-owner-setup', {
			userId: savedUser.id,
			tenantId: savedTenant.id,
		});

		return { user: publicUser, tenantId: savedTenant.id };
	}
	@Post('/dismiss-banner')
	@GlobalScope('banner:dismiss')
	async dismissBanner(
		_req: AuthenticatedRequest,
		_res: Response,
		@Body payload: DismissBannerRequestDto,
	) {
		const bannerName = payload.banner;
		if (!bannerName) return;
		await this.bannerService.dismissBanner(bannerName);
	}
}
