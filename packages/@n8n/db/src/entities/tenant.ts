import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from '@n8n/typeorm';
import { User } from './user';
import { Project } from './project';

@Entity()
export class Tenant {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'varchar', length: 255 })
	name: string;

	@Column({ type: 'varchar', length: 255, nullable: true })
	domain: string | null;

	// @Column({ type: 'boolean', default: true })
	// showSetupOnFirstLoad: boolean;

	// Relation with User (via user.tenantId)
	@OneToMany(
		() => User,
		(user) => user.tenant,
	)
	users: User[];

	// Relation with Project (via project.tenantId)
	@OneToMany(
		() => Project,
		(project) => project.tenant,
	)
	projects: Project[];
}
