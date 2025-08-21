import { RestController, Get, Post, Patch, Delete, Body, Param, GlobalScope } from '@n8n/decorators';
import { AuthenticatedRequest, TenantRepository } from '@n8n/db';
import { NotFoundError } from '@/errors/response-errors/not-found.error';
import { CreateTenantDto } from '@n8n/api-types';

@RestController('/tenants')
export class TenantController {
	constructor(private readonly tenantRepository: TenantRepository) { }

	@Get('/', { skipAuth: true })
	// @GlobalScope('tenant:list')
	async listTenants() {
		return await this.tenantRepository.find();
	}

	@Get('/:id', { skipAuth: true })
	// @GlobalScope('tenant:view')
	async getTenant(@Param('id') id: string) {
		const tenant = await this.tenantRepository.findOne({ where: { id } });
		if (!tenant) throw new NotFoundError('Tenant not found');
		return tenant;
	}

	@Post("/", { skipAuth: true })
	async createTenant(req: AuthenticatedRequest, _res: Response, @Body payload: CreateTenantDto) {
		console.log('Payload DTO:', payload); // Already parsed body
		console.log('Payload Name:', payload.name); // Access directly
		const tenant = this.tenantRepository.create({
			name: payload.name,
			domain: payload.domain ?? null,
		});

		return await this.tenantRepository.save(tenant);
	}


	@Patch('/:id', { skipAuth: true })
	// @GlobalScope('tenant:update')
	async updateTenant(@Param('id') id: string, @Body body: Partial<{ name: string; domain?: string }>) {
		await this.tenantRepository.update({ id }, body);
		const updated = await this.tenantRepository.findOne({ where: { id } });
		if (!updated) throw new NotFoundError('Tenant not found after update');
		return updated;
	}

	@Delete('/:id', { skipAuth: true })
	// @GlobalScope('tenant:delete')
	async deleteTenant(@Param('id') id: string) {
		const tenant = await this.tenantRepository.findOne({ where: { id } });
		if (!tenant) throw new NotFoundError('Tenant not found');
		await this.tenantRepository.remove(tenant);
		return { success: true };
	}
}
