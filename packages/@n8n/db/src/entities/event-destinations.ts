import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from '@n8n/typeorm';
import { MessageEventBusDestinationOptions } from 'n8n-workflow';

import { JsonColumn, WithTimestamps } from './abstract-entity';
import { Tenant } from './tenant';

@Entity({ name: 'event_destinations' })
export class EventDestinations extends WithTimestamps {
	@PrimaryColumn('uuid')
	id: string;

	@JsonColumn()
	destination: MessageEventBusDestinationOptions;

	// 🔑 Add tenant relation
	@ManyToOne(
		() => Tenant,
		(tenant) => tenant.eventDestinations,
		{ nullable: false, onDelete: 'CASCADE' },
	)
	@JoinColumn({ name: 'tenant_id' })
	tenant: Tenant;

	@Column({ name: 'tenant_id', type: 'uuid' })
	tenantId: string;
}
