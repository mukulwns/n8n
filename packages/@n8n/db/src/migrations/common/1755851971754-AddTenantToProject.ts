import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class AddTenantToProject1724320000000 implements ReversibleMigration {
	async up({ schemaBuilder: { addColumns, addForeignKey, column } }: MigrationContext) {
		// Add the tenant_id column
		await addColumns('project', [column('tenant_id').uuid.default('NULL')]);

		// Add FK: project.tenant_id -> tenant.id
		await addForeignKey('project', 'tenant_id', ['tenant', 'id']);
	}

	async down({ schemaBuilder: { dropForeignKey, dropColumns } }: MigrationContext) {
		await dropForeignKey('project', 'tenant_id', ['tenant', 'id']);
		await dropColumns('project', ['tenant_id']);
	}
}
