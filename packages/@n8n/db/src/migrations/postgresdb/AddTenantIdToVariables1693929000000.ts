import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class AddTenantIdToVariables1693929000000 implements ReversibleMigration {
	async up({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(`
			ALTER TABLE ${tablePrefix}variables
			ADD COLUMN tenant_id uuid NULL,
			ADD CONSTRAINT ${tablePrefix}variables_tenant_id_fkey
				FOREIGN KEY (tenant_id) REFERENCES ${tablePrefix}tenant(id) ON DELETE SET NULL;
		`);
	}

	async down({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(`
			ALTER TABLE ${tablePrefix}variables
			DROP CONSTRAINT ${tablePrefix}variables_tenant_id_fkey,
			DROP COLUMN tenant_id;
		`);
	}
}
