import { Body, Patch, Post, RestController } from '@n8n/decorators';
import type { NpsSurveyState } from 'n8n-workflow';
import { Logger } from '@n8n/backend-common';

import { BadRequestError } from '@/errors/response-errors/bad-request.error';
import { NpsSurveyRequest } from '@/requests';
import { UserService } from '@/services/user.service';
import { AuthenticatedRequest, TenantRepository } from '@n8n/db';
import { Container } from '@n8n/di';

function getNpsSurveyState(state: unknown): NpsSurveyState | undefined {
	if (typeof state !== 'object' || state === null) {
		return;
	}
	if (!('lastShownAt' in state) || typeof state.lastShownAt !== 'number') {
		return;
	}
	if ('responded' in state && state.responded === true) {
		return {
			responded: true,
			lastShownAt: state.lastShownAt,
		};
	}

	if (
		'waitingForResponse' in state &&
		state.waitingForResponse === true &&
		'ignoredCount' in state &&
		typeof state.ignoredCount === 'number'
	) {
		return {
			waitingForResponse: true,
			ignoredCount: state.ignoredCount,
			lastShownAt: state.lastShownAt,
		};
	}

	return;
}
interface UpdateSettingsRequestDto {
	showSetupOnFirstLoad?: boolean;
}
@RestController('/user-settings')
export class UserSettingsController {
	constructor(
		private readonly userService: UserService,
		private readonly logger: Logger,
	) {}
	@Post('/update')
	async updateSettings(
		req: AuthenticatedRequest,
		res: Response,
		@Body payload: UpdateSettingsRequestDto,
	) {
		const { showSetupOnFirstLoad } = payload;
		const tenantId = req.tenantId;

		if (!tenantId) {
			this.logger.debug('Request to update settings failed because tenant ID is missing in JWT');
			throw new BadRequestError('Tenant ID missing in JWT');
		}

		if (showSetupOnFirstLoad === undefined) {
			this.logger.debug(
				'Request to update settings failed because showSetupOnFirstLoad is missing in payload',
			);
			throw new BadRequestError('Missing showSetupOnFirstLoad in payload');
		}

		const tenantRepo = Container.get(TenantRepository);
		const tenant = await tenantRepo.findOne({ where: { id: tenantId } });
		if (!tenant) {
			this.logger.debug(`Tenant with ID '${tenantId}' not found`);
			throw new BadRequestError(`Tenant with ID '${tenantId}' not found`);
		}

		await tenantRepo.update({ id: tenantId }, { showSetupOnFirstLoad });
		this.logger.debug(
			`Updated showSetupOnFirstLoad to ${showSetupOnFirstLoad} for tenant ${tenantId}`,
		);

		return { success: true };
	}
	@Patch('/nps-survey')
	async updateNpsSurvey(req: NpsSurveyRequest.NpsSurveyUpdate): Promise<void> {
		const state = getNpsSurveyState(req.body);
		if (!state) {
			throw new BadRequestError('Invalid nps survey state structure');
		}

		await this.userService.updateSettings(req.user.id, {
			npsSurvey: state,
		});
	}
}
