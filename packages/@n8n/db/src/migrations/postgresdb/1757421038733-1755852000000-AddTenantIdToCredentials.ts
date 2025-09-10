import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class AddTenantToCredentials1755852500000 implements ReversibleMigration {
	async up({ schemaBuilder: { addColumns, addForeignKey, column } }: MigrationContext) {
		// Add the tenant_id column
		await addColumns('credentials_entity', [column('tenant_id').uuid.default('NULL')]);

		// Add FK: credentials_entity.tenant_id -> tenant.id
		await addForeignKey('credentials_entity', 'tenant_id', ['tenant', 'id']);
	}

	async down({ schemaBuilder: { dropForeignKey, dropColumns } }: MigrationContext) {
		// Drop FK first
		await dropForeignKey('credentials_entity', 'tenant_id', ['tenant', 'id']);
		// Drop column
		await dropColumns('credentials_entity', ['tenant_id']);
	}
}
