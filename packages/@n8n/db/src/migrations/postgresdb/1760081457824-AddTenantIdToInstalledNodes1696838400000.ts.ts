import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class AddTenantIdToInstalledNodes1696838400000 implements ReversibleMigration {
	async up({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(`
			ALTER TABLE ${tablePrefix}installed_nodes
			ADD COLUMN tenant_id uuid NULL,
			ADD CONSTRAINT ${tablePrefix}installed_nodes_tenant_id_fkey
				FOREIGN KEY (tenant_id) REFERENCES ${tablePrefix}tenant(id) ON DELETE SET NULL;
		`);
	}

	async down({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(`
			ALTER TABLE ${tablePrefix}installed_nodes
			DROP CONSTRAINT ${tablePrefix}installed_nodes_tenant_id_fkey,
			DROP COLUMN tenant_id;
		`);
	}
}
