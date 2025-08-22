import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from '@n8n/typeorm';

import { WithTimestampsAndStringId } from './abstract-entity';
import type { ProjectRelation } from './project-relation';
import type { SharedCredentials } from './shared-credentials';
import type { SharedWorkflow } from './shared-workflow';
import { Tenant } from './tenant';
// import { Tenant } from './tenant';

@Entity()
export class Project extends WithTimestampsAndStringId {
	@Column({ length: 255 })
	name: string;

	@Column({ type: 'varchar', length: 36 })
	type: 'personal' | 'team';

	@Column({ type: 'json', nullable: true })
	icon: { type: 'emoji' | 'icon'; value: string } | null;

	@Column({ type: 'varchar', length: 512, nullable: true })
	description: string | null;

	@OneToMany('ProjectRelation', 'project')
	projectRelations: ProjectRelation[];

	@OneToMany('SharedCredentials', 'project')
	sharedCredentials: SharedCredentials[];

	@OneToMany('SharedWorkflow', 'project')
	sharedWorkflows: SharedWorkflow[];
	@Column({ name: 'tenant_id', type: 'uuid', nullable: true })
	tenantId: string;

	@ManyToOne(
		() => Tenant,
		(tenant) => tenant.projects,
	)
	@JoinColumn({ name: 'tenant_id' }) // ensures FK uses tenant_id
	tenant: Tenant;
}
