import { Z } from "zod-class";
import { tenantNameSchema, tenantDomainSchema } from "../../schemas/tenant.schema";

// DTO for Create Tenant
export class CreateTenantDto extends Z.class({
	name: tenantNameSchema,
	domain: tenantDomainSchema.optional(),
}) {
	// You can add a helper method to serialize the DTO
	toJSON() {
		return {
			name: this.name,
			domain: this.domain,
		};
	}
}

// DTO for Update Tenant
export class UpdateTenantDto extends Z.class({
	name: tenantNameSchema.optional(),
	domain: tenantDomainSchema.optional(),
}) {
	toJSON() {
		return {
			name: this.name,
			domain: this.domain,
		};
	}
}
