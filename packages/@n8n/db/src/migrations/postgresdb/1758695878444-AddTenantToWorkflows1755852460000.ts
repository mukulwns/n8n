import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class AddTenantToWorkflows1755852460000 implements ReversibleMigration {
	async up({ schemaBuilder: { addColumns, addForeignKey, column } }: MigrationContext) {
		// Add the tenant_id column
		await addColumns('workflow_entity', [column('tenant_id').uuid.default('NULL')]);

		// Add FK: workflows.tenant_id -> tenant.id
		await addForeignKey('workflow_entity', 'tenant_id', ['tenant', 'id']);
	}

	async down({ schemaBuilder: { dropForeignKey, dropColumns } }: MigrationContext) {
		// Remove FK first
		await dropForeignKey('workflow_entity', 'tenant_id', ['tenant', 'id']);
		// Remove column
		await dropColumns('workflow_entity', ['tenant_id']);
	}
}
