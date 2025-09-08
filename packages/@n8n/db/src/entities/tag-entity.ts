import { Column, Entity, Index, ManyToMany, OneToMany, ManyToOne, JoinColumn } from '@n8n/typeorm';
import { IsString, Length } from 'class-validator';

import { WithTimestampsAndStringId } from './abstract-entity';
import type { FolderTagMapping } from './folder-tag-mapping';
import type { WorkflowEntity } from './workflow-entity';
import type { WorkflowTagMapping } from './workflow-tag-mapping';
import { Tenant } from './tenant';

@Entity()
export class TagEntity extends WithTimestampsAndStringId {
	@Column({ length: 24 })
	@Index({ unique: true })
	@IsString({ message: 'Tag name must be of type string.' })
	@Length(1, 24, { message: 'Tag name must be $constraint1 to $constraint2 characters long.' })
	name: string;

	@ManyToMany('WorkflowEntity', 'tags')
	workflows: WorkflowEntity[];

	@OneToMany('WorkflowTagMapping', 'tags')
	workflowMappings: WorkflowTagMapping[];

	@OneToMany('FolderTagMapping', 'tags')
	folderMappings: FolderTagMapping[];

	// 👇 Add tenant relation
	@Column({ name: 'tenant_id', type: 'uuid', nullable: true })
	tenantId: string | null;

	@ManyToOne(
		() => Tenant,
		(tenant) => tenant.tags,
		{ onDelete: 'CASCADE' },
	)
	@JoinColumn({ name: 'tenant_id' })
	tenant: Tenant;
}
