import { RestController, Get, Post, Patch, Delete, Body, Param, GlobalScope } from '@n8n/decorators';
import { TenantRepository } from '@n8n/db';
import { AuthenticatedRequest } from '@n8n/db';
import { NotFoundError } from '@/errors/response-errors/not-found.error';

@RestController('/tenants')
export class TenantController {
	constructor(private readonly tenantRepository: TenantRepository) { }

	@Get('/')
	@GlobalScope('tenant:list')
	async listTenants() {
		return await this.tenantRepository.find();
	}

	@Get('/:id')
	// @GlobalScope('tenant:view')
	async getTenant(@Param('id') id: string) {
		const tenant = await this.tenantRepository.findOne({ where: { id } });
		if (!tenant) throw new NotFoundError('Tenant not found');
		return tenant;
	}

	@Post('/')
	@GlobalScope('tenant:create')
	async createTenant(@Body body: { name: string; domain?: string }) {
		const tenant = this.tenantRepository.create(body);
		return await this.tenantRepository.save(tenant);
	}

	@Patch('/:id')
	@GlobalScope('tenant:update')
	async updateTenant(@Param('id') id: string, @Body body: Partial<{ name: string; domain?: string }>) {
		await this.tenantRepository.update({ id }, body);
		const updated = await this.tenantRepository.findOne({ where: { id } });
		if (!updated) throw new NotFoundError('Tenant not found after update');
		return updated;
	}

	@Delete('/:id')
	@GlobalScope('tenant:delete')
	async deleteTenant(@Param('id') id: string) {
		const tenant = await this.tenantRepository.findOne({ where: { id } });
		if (!tenant) throw new NotFoundError('Tenant not found');
		await this.tenantRepository.remove(tenant);
		return { success: true };
	}
}
