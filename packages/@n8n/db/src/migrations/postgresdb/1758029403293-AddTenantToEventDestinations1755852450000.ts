import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class AddTenantToEventDestinations1755852450000 implements ReversibleMigration {
	async up({ schemaBuilder: { addColumns, addForeignKey, column } }: MigrationContext) {
		// Add the tenant_id column
		await addColumns('event_destinations', [column('tenant_id').uuid.default('NULL')]);

		// Add FK: event_destinations.tenant_id -> tenant.id
		await addForeignKey('event_destinations', 'tenant_id', ['tenant', 'id']);
	}

	async down({ schemaBuilder: { dropForeignKey, dropColumns } }: MigrationContext) {
		// Remove FK first
		await dropForeignKey('event_destinations', 'tenant_id', ['tenant', 'id']);
		// Remove column
		await dropColumns('event_destinations', ['tenant_id']);
	}
}
