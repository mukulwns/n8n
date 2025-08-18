import type { MigrationContext, ReversibleMigration } from '../migration-types';

export class CreateTenantTable1692000000000 implements ReversibleMigration {
	async up({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(`
			CREATE TABLE IF NOT EXISTS ${tablePrefix}tenant (
				id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
				name VARCHAR(100) NOT NULL,
				domain VARCHAR(150),
				plan VARCHAR(50),
				"isActive" BOOLEAN DEFAULT true,
				"createdAt" TIMESTAMP NOT NULL DEFAULT now(),
				"updatedAt" TIMESTAMP NOT NULL DEFAULT now()
			)
		`);
	}

	async down({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(`DROP TABLE ${tablePrefix}tenant`);
	}
}
