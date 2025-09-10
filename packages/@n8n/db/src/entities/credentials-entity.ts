import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from '@n8n/typeorm';
import { IsObject, IsString, Length } from 'class-validator';

import { WithTimestampsAndStringId } from './abstract-entity';
import type { SharedCredentials } from './shared-credentials';
import type { ICredentialsDb } from './types-db';
import { Tenant } from './tenant';

@Entity()
export class CredentialsEntity extends WithTimestampsAndStringId implements ICredentialsDb {
	@Column({ length: 128 })
	@IsString({ message: 'Credential `name` must be of type string.' })
	@Length(3, 128, {
		message: 'Credential name must be $constraint1 to $constraint2 characters long.',
	})
	name: string;

	@Column('text')
	@IsObject()
	data: string;

	@Index()
	@IsString({ message: 'Credential `type` must be of type string.' })
	@Column({
		length: 128,
	})
	type: string;

	@OneToMany('SharedCredentials', 'credentials')
	shared: SharedCredentials[];

	/**
	 * Tenant relation for multi-tenancy
	 */
	@ManyToOne(
		() => Tenant,
		(tenant) => tenant.credentials,
		{ nullable: false },
	)
	@JoinColumn({ name: 'tenant_id' })
	tenant: Tenant;

	// Keep tenantId for easy filtering
	@Column({ name: 'tenant_id', type: 'uuid' })
	tenantId: string;

	@Column({ default: false })
	isManaged: boolean;

	toJSON() {
		const { shared, ...rest } = this;
		return rest;
	}
}
