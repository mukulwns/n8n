import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class AddTenantToSharedCredentials1755852600000 implements ReversibleMigration {
	async up({ schemaBuilder: { addColumns, addForeignKey, column } }: MigrationContext) {
		// Add tenant_id column
		await addColumns('shared_credentials', [column('tenant_id').uuid.default('NULL')]);

		// Add FK: shared_credentials.tenant_id -> tenant.id
		await addForeignKey('shared_credentials', 'tenant_id', ['tenant', 'id']);
	}

	async down({ schemaBuilder: { dropForeignKey, dropColumns } }: MigrationContext) {
		// Drop FK first
		await dropForeignKey('shared_credentials', 'tenant_id', ['tenant', 'id']);
		// Drop column
		await dropColumns('shared_credentials', ['tenant_id']);
	}
}
