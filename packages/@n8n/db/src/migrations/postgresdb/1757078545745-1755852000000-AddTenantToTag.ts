import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class AddTenantToTag1755851971760 implements ReversibleMigration {
	async up({ schemaBuilder: { addColumns, addForeignKey, column } }: MigrationContext) {
		// Add the tenant_id column
		await addColumns('tag_entity', [column('tenant_id').uuid.default('NULL')]);

		// Add FK: tag_entity.tenant_id -> tenant.id
		await addForeignKey('tag_entity', 'tenant_id', ['tenant', 'id']);
	}

	async down({ schemaBuilder: { dropForeignKey, dropColumns } }: MigrationContext) {
		await dropForeignKey('tag_entity', 'tenant_id', ['tenant', 'id']);
		await dropColumns('tag_entity', ['tenant_id']);
	}
}
