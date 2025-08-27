import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class AddTenantIdToSettings1756127909134 implements ReversibleMigration {
	async up({ schemaBuilder: { addColumns, column } }: MigrationContext) {
		// Add tenant_id column to settings (nullable)
		await addColumns('settings', [column('tenant_id').uuid.default('NULL')]);
	}

	async down({ schemaBuilder: { dropColumns } }: MigrationContext) {
		// Remove tenant_id column
		await dropColumns('settings', ['tenant_id']);
	}
}
