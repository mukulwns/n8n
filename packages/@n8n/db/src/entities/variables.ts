import { Column, Entity, ManyToOne, JoinColumn } from '@n8n/typeorm';

import { WithStringId } from './abstract-entity';
import { Tenant } from './tenant';

@Entity()
export class Variables extends WithStringId {
	@Column('text')
	key: string;

	@Column('text', { default: 'string' })
	type: string;

	@Column('text')
	value: string;

	@ManyToOne(
		() => Tenant,
		(tenant) => tenant.variables,
	)

	@JoinColumn({ name: 'tenant_id' })
	tenant?: Tenant;

	@Column({ name: 'tenant_id', type: 'uuid', nullable: true })
	tenantId?: string | null;
}
