import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from '@n8n/typeorm';
import { InstalledPackages } from './installed-packages';
import { Tenant } from './tenant';

@Entity()
export class InstalledNodes {
	@Column()
	name: string;

	@PrimaryColumn()
	type: string;

	@Column()
	latestVersion: number;

	@ManyToOne(
		() => InstalledPackages,
		(pkg) => pkg.installedNodes,
		{
			onDelete: 'CASCADE',
		},
	)
	@JoinColumn({ name: 'package', referencedColumnName: 'packageName' })
	package: InstalledPackages;

	// 👇 Add tenant relation
	@Column({ name: 'tenant_id', type: 'uuid', nullable: true })
	tenantId: string | null;

	@ManyToOne(
		() => Tenant,
		(tenant) => tenant.installedNodes,
		{
			onDelete: 'CASCADE',
		},
	)
	@JoinColumn({ name: 'tenant_id' })
	tenant: Tenant;
}
