import { Service } from '@n8n/di';
import type { EntityManager } from '@n8n/typeorm';
import { DataSource, Repository } from '@n8n/typeorm';

import { Project } from '../entities';

@Service()
export class ProjectRepository extends Repository<Project> {
	constructor(dataSource: DataSource) {
		super(Project, dataSource.manager);
	}

	async getPersonalProjectForUser(userId: string, entityManager?: EntityManager) {
		const em = entityManager ?? this.manager;

		return await em.findOne(Project, {
			where: { type: 'personal', projectRelations: { userId, role: 'project:personalOwner' } },
		});
	}

	async getPersonalProjectForUserOrFail(userId: string, entityManager?: EntityManager) {
		const em = entityManager ?? this.manager;

		return await em.findOneOrFail(Project, {
			where: { type: 'personal', projectRelations: { userId, role: 'project:personalOwner' } },
		});
	}

	async getAccessibleProjects(userId: string, tenantId: string): Promise<Project[]> {
		if (!tenantId) {
			throw new Error('Tenant ID missing');
		}
		return await this.find({
			where: [
				{
					type: 'personal',
					tenantId,
					projectRelations: { userId, role: 'project:personalOwner' },
				},
				{
					type: 'team',
					tenantId,
					projectRelations: { userId },
				},
			],
			relations: ['projectRelations'],
		});
	}

	async getProjectCounts(tenantId?: string) {
		const where = tenantId ? { tenantId } : {};
		return {
			personal: await this.count({ where: { type: 'personal', ...where } }),
			team: await this.count({ where: { type: 'team', ...where } }),
		};
	}
}
