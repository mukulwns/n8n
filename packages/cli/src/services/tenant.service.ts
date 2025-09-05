import { Service } from '@n8n/di';
import { Logger } from '@n8n/backend-common';
import { TenantRepository, Tenant } from '@n8n/db';

@Service()
export class TenantService {
	constructor(
		private readonly tenantRepository: TenantRepository,
		private readonly logger: Logger,
	) {}

	/**
	 * Create a tenant
	 * If users are provided, only their IDs will be linked.
	 */
	async createTenant(data: Partial<Tenant>) {
		const tenant = this.tenantRepository.create({
			...data,
			users: data.users?.map((u) => ({ id: u.id })) as any, // ✅ fix for relation
		});
		return await this.tenantRepository.save(tenant);
	}

	/**
	 * Update tenant details
	 * If users are provided, only their IDs will be linked.
	 */
	async updateTenant(id: string, data: Partial<Tenant>) {
		const updateData = {
			...data,
			users: data.users?.map((u) => ({ id: u.id })) as any, // ✅ fix for relation
		};
		await this.tenantRepository.update(id, updateData);
		return await this.tenantRepository.findOneBy({ id });
	}

	/**
	 * Get a tenant by ID with related users
	 */
	async getTenantById(id: string) {
		return await this.tenantRepository.findOne({
			where: { id },
			relations: ['users'],
		});
	}

	/**
	 * Get all tenants with related users
	 */
	async getAllTenants() {
		return await this.tenantRepository.find({
			relations: ['users'],
		});
	}

	/**
	 * Delete tenant by ID
	 */
	async deleteTenant(id: string) {
		return await this.tenantRepository.delete({ id });
	}
}
