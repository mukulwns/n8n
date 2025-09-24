import { CredentialsRepository, WorkflowRepository } from '@n8n/db';
import { Service } from '@n8n/di';
import { Like } from '@n8n/typeorm';

@Service()
export class NamingService {
	getUniqueCredentialName(requestedName: string) {
		throw new Error('Method not implemented.');
	}
	constructor(
		private readonly workflowRepository: WorkflowRepository,
		private readonly credentialsRepository: CredentialsRepository,
	) {}

	async getUniqueWorkflowName(requestedName: string, tenantId: string) {
		return await this.getUniqueName(requestedName, 'workflow', tenantId);
	}

	private async getUniqueName(
		requestedName: string,
		entity: 'workflow' | 'credential',
		tenantId: string,
	) {
		const repository = entity === 'workflow' ? this.workflowRepository : this.credentialsRepository;

		// Query workflows filtered by tenantId
		const found = await repository.find({
			where: {
				name: Like(`${requestedName}%`),
				tenant_id: tenantId,
			},
			select: ['name'],
		});

		if (found.length === 0) return requestedName;

		if (found.length === 1 && found[0].name === requestedName) {
			return `${requestedName} 2`;
		}

		const maxSuffix = found.reduce((max, { name }) => {
			const match = name.match(new RegExp(`^${requestedName}(?: (\\d+))?$`));
			if (!match) return max;

			const numSuffix = match[1] ? parseInt(match[1], 10) : 1;
			return Math.max(max, numSuffix);
		}, 1);

		return `${requestedName} ${maxSuffix + 1}`;
	}
}
