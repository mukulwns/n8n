import { Service } from '@n8n/di';
import type { EntityManager, DeepPartial } from '@n8n/typeorm';
import { In, Not, Repository, DataSource } from '@n8n/typeorm';
import { Tenant } from '../entities';


@Service()
export class TenantRepository extends Repository<Tenant> {
	constructor(dataSource: DataSource) {
		super(Tenant, dataSource.manager);
	}

	async findManyByIds(tenantIds: string[]) {
		return await this.find({
			where: { id: In(tenantIds) },
		});
	}

	async getByIds(transaction: EntityManager, ids: string[]) {
		return await transaction.find(Tenant, { where: { id: In(ids) } });
	}

	async findByName(name: string) {
		return await this.findOne({ where: { name } });
	}

	async deleteMany(tenantIds: string[]) {
		return await this.delete({ id: In(tenantIds) });
	}

	async deleteAllExcept(tenant: Tenant) {
		await this.delete({ id: Not(tenant.id) });
	}
}
