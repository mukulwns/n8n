import { Column, Entity, JoinColumn, OneToMany, PrimaryColumn, ManyToOne } from '@n8n/typeorm';
import { WithTimestamps } from './abstract-entity';
import type { InstalledNodes } from './installed-nodes';
import { Tenant } from './tenant'; // 👈 Import Tenant entity

@Entity()
export class InstalledPackages extends WithTimestamps {
	@PrimaryColumn()
	packageName: string;

	@Column()
	installedVersion: string;

	@Column({ nullable: true })
	authorName?: string;

	@Column({ nullable: true })
	authorEmail?: string;

	@OneToMany('InstalledNodes', 'package')
	@JoinColumn({ referencedColumnName: 'package' })
	installedNodes: InstalledNodes[];

	// 👇 Add tenantId column for multi-tenant isolation
	@Column({ name: 'tenant_id', type: 'uuid', nullable: true })
	tenantId: string | null;

	// 👇 Add relation with Tenant entity
	@ManyToOne(
		() => Tenant,
		(tenant) => tenant.installedPackages,
		{ onDelete: 'CASCADE' },
	)
	@JoinColumn({ name: 'tenant_id' })
	tenant: Tenant;
}
