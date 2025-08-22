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

	@OneToMany(
		() => User,
		(user) => user.tenant,
	)
	users: User[];
	@OneToMany(
		() => Project,
		(project) => project.tenant,
	)
	projects: Project[];
}
