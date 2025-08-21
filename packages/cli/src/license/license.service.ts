import { LicenseState, Logger } from '@n8n/backend-common';
import type { User } from '@n8n/db';
import { WorkflowRepository } from '@n8n/db';
import { Service } from '@n8n/di';
import axios, { AxiosError } from 'axios';
import { ensureError } from 'n8n-workflow';

import { BadRequestError } from '@/errors/response-errors/bad-request.error';
import { EventService } from '@/events/event.service';
import { License } from '@/license';
import { UrlService } from '@/services/url.service';

type LicenseError = Error & { errorId?: keyof typeof LicenseErrors };

export const LicenseErrors = {
	SCHEMA_VALIDATION: 'Activation key is in the wrong format',
	RESERVATION_EXHAUSTED: 'Activation key has been used too many times',
	RESERVATION_EXPIRED: 'Activation key has expired',
	NOT_FOUND: 'Activation key not found',
	RESERVATION_CONFLICT: 'Activation key not found',
	RESERVATION_DUPLICATE: 'Activation key has already been used on this instance',
};

@Service()
export class LicenseService {
	constructor(
		private readonly logger: Logger,
		private readonly license: License,
		private readonly licenseState: LicenseState,
		private readonly workflowRepository: WorkflowRepository,
		private readonly urlService: UrlService,
		private readonly eventService: EventService,
	) { }

	// async getLicenseData() {
	// 	const triggerCount = await this.workflowRepository.getActiveTriggerCount();
	// 	const workflowsWithEvaluationsCount =
	// 		await this.workflowRepository.getWorkflowsWithEvaluationCount();
	// 	const mainPlan = this.license.getMainPlan();

	// 	return {
	// 		usage: {
	// 			activeWorkflowTriggers: {
	// 				value: triggerCount,
	// 				limit: this.license.getTriggerLimit(),
	// 				warningThreshold: 0.8,
	// 			},
	// 			workflowsHavingEvaluations: {
	// 				value: workflowsWithEvaluationsCount,
	// 				limit: this.licenseState.getMaxWorkflowsWithEvaluations(),
	// 			},
	// 		},
	// 		license: {
	// 			planId: mainPlan?.productId ?? '',
	// 			planName: this.license.getPlanName(),
	// 		},

	// 	};
	// }
	async getLicenseData() {
		// Skip actual workflow counts if not needed, or keep for tenant-specific reporting
		const triggerCount = await this.workflowRepository.getActiveTriggerCount();
		const workflowsWithEvaluationsCount = await this.workflowRepository.getWorkflowsWithEvaluationCount();

		return {
			usage: {
				activeWorkflowTriggers: {
					value: triggerCount,
					limit: -1, // Unlimited (matches UNLIMITED_LICENSE_QUOTA)
					warningThreshold: 1, // Disable warnings
				},
				workflowsHavingEvaluations: {
					value: workflowsWithEvaluationsCount,
					limit: -1, // Unlimited
				},
			},
			license: {
				planId: 'saas-unlimited', // Custom plan ID for your SaaS
				planName: 'SaaS Unlimited', // Custom plan name
			},
		};
	}
	// async requestEnterpriseTrial(user: User) {
	// 	await axios.post('https://enterprise.n8n.io/enterprise-trial', {
	// 		licenseType: 'enterprise',
	// 		firstName: user.firstName,
	// 		lastName: user.lastName,
	// 		email: user.email,
	// 		instanceUrl: this.urlService.getWebhookBaseUrl(),
	// 	});
	// }
	async requestEnterpriseTrial(user: User) {
		this.logger.info('Enterprise trial request bypassed for SaaS', { userId: user.id });
		// Optionally emit an event or update state
	}
	// async registerCommunityEdition({
	// 	userId,
	// 	email,
	// 	instanceId,
	// 	instanceUrl,
	// 	licenseType,
	// }: {
	// 	userId: User['id'];
	// 	email: string;
	// 	instanceId: string;
	// 	instanceUrl: string;
	// 	licenseType: string;
	// }): Promise<{ title: string; text: string }> {
	// 	try {
	// 		const {
	// 			data: { licenseKey, ...rest },
	// 		} = await axios.post<{ title: string; text: string; licenseKey: string }>(
	// 			'https://enterprise.n8n.io/community-registered',
	// 			{
	// 				email,
	// 				instanceId,
	// 				instanceUrl,
	// 				licenseType,
	// 			},
	// 		);
	// 		this.eventService.emit('license-community-plus-registered', { userId, email, licenseKey });
	// 		return rest;
	// 	} catch (e: unknown) {
	// 		if (e instanceof AxiosError) {
	// 			const error = e as AxiosError<{ message: string }>;
	// 			const errorMsg = error.response?.data?.message ?? e.message;
	// 			throw new BadRequestError('Failed to register community edition: ' + errorMsg);
	// 		} else {
	// 			this.logger.error('Failed to register community edition', { error: ensureError(e) });
	// 			throw new BadRequestError('Failed to register community edition');
	// 		}
	// 	}
	// }
	async registerCommunityEdition({
		userId,
		email,
		instanceId,
		instanceUrl,
		licenseType,
	}: {
		userId: User['id'];
		email: string;
		instanceId: string;
		instanceUrl: string;
		licenseType: string;
	}): Promise<{ title: string; text: string }> {
		this.logger.info('Community edition registration bypassed for SaaS', { userId, email });
		this.eventService.emit('license-community-plus-registered', { userId, email, licenseKey: 'saas-bypass' });
		return { title: 'SaaS License', text: 'License activated for SaaS' };
	}
	// getManagementJwt(): string {
	// 	return this.license.getManagementJwt();
	// }
	getManagementJwt(): string {
		return 'saas-bypass-jwt'; // Mock JWT or generate a static one
	}
	// async activateLicense(activationKey: string) {
	// 	try {
	// 		await this.license.activate(activationKey);
	// 	} catch (e) {
	// 		const message = this.mapErrorMessage(e as LicenseError, 'activate');
	// 		throw new BadRequestError(message);
	// 	}
	// }
	async activateLicense(activationKey: string) {
		this.logger.info('License activation bypassed for SaaS', { activationKey });
		this.licenseState.setActivated(true); // Hypothetical; already matches LicenseState
		// this.eventService.emit('license-activated', { success: true }); // Removed
	}
	// async renewLicense() {
	// 	if (this.license.getPlanName() === 'Community') return; // unlicensed, nothing to renew

	// 	try {
	// 		await this.license.renew();
	// 	} catch (e) {
	// 		const message = this.mapErrorMessage(e as LicenseError, 'renew');

	// 		this.eventService.emit('license-renewal-attempted', { success: false });
	// 		throw new BadRequestError(message);
	// 	}

	// 	this.eventService.emit('license-renewal-attempted', { success: true });
	// }
	async renewLicense() {
		// this.logger.info('License renewal bypassed for SaaS');
		this.eventService.emit('license-renewal-attempted', { success: true });
	}
	private mapErrorMessage(error: LicenseError, action: 'activate' | 'renew') {
		let message = error.errorId && LicenseErrors[error.errorId];
		if (!message) {
			message = `Failed to ${action} license: ${error.message}`;
			this.logger.error(message, { stack: error.stack ?? 'n/a' });
		}
		return message;
	}
}
