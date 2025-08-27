// packages/@n8n/db/src/entities/Settings.ts
import { Column, Entity, PrimaryColumn } from '@n8n/typeorm';

@Entity()
export class Settings {
	@PrimaryColumn()
	key: string;

	// NEW: scope settings per tenant (null = global)
	@Column({ name: 'tenant_id', nullable: true })
	tenantId?: string;

	@Column()
	value: string;

	@Column()
	loadOnStartup: boolean;
}
