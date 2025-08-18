import { Service } from '@n8n/di';
import { Logger } from '@n8n/backend-common';
import { TenantRepository, Tenant } from '@n8n/db';

@Service()
export class TenantService {
	constructor(
		private readonly tenantRepository: TenantRepository,
		private readonly logger: Logger,
	) { }

	async createTenant(data: Partial<Tenant>) {
		const tenant = this.tenantRepository.create(data);
		return await this.tenantRepository.save(tenant);
	}

	async updateTenant(id: string, data: Partial<Tenant>) {
		await this.tenantRepository.update(id, data);
		return await this.tenantRepository.findOneBy({ id });
	}

	async getTenantById(id: string) {
		return await this.tenantRepository.findOne({ where: { id }, relations: ['users'] });
	}

	async getAllTenants() {
		return await this.tenantRepository.find({ relations: ['users'] });
	}

	async deleteTenant(id: string) {
		return await this.tenantRepository.delete({ id });
	}
}
