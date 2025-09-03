import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class AddTenantForeignKeyToUsers1692200000000 implements ReversibleMigration {
	async up({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(`
      ALTER TABLE "${tablePrefix}user"
      ADD CONSTRAINT "FK_${tablePrefix}user_tenant"
      FOREIGN KEY ("tenantId") REFERENCES ${tablePrefix}tenant(id)
      ON DELETE CASCADE
    `);
	}

	async down({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(`
      ALTER TABLE "${tablePrefix}user"
      DROP CONSTRAINT "FK_${tablePrefix}user_tenant"
    `);
	}
}
