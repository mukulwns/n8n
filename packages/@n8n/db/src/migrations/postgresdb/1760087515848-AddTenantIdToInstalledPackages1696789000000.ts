import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class AddTenantIdToInstalledPackages1696789000000 implements ReversibleMigration {
	async up({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(`
      ALTER TABLE ${tablePrefix}installed_packages
      ADD COLUMN tenant_id uuid NULL,
      ADD CONSTRAINT ${tablePrefix}installed_packages_tenant_id_fkey
        FOREIGN KEY (tenant_id) REFERENCES ${tablePrefix}tenant(id) ON DELETE CASCADE;
    `);
	}

	async down({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(`
      ALTER TABLE ${tablePrefix}installed_packages
      DROP CONSTRAINT ${tablePrefix}installed_packages_tenant_id_fkey,
      DROP COLUMN tenant_id;
    `);
	}
}
