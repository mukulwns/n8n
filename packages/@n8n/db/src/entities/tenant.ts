import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from '@n8n/typeorm';
import { User } from './user';
import { Project } from './project';
import { TagEntity } from './tag-entity';
import { Variables } from './variables';
import { CredentialsEntity } from './credentials-entity';
import { EventDestinations } from './event-destinations';
import { InstalledNodes } from './installed-nodes';
import { InstalledPackages } from './installed-packages';
// import { SourceControlPreferencesEntity } from './source-control-preferences';

@Entity()
export class Tenant {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'varchar', length: 255 })
	name: string;

	@Column({ type: 'varchar', length: 255, nullable: true })
	domain: string | null;

	// ---------------------------------------------
	// Relations
	// ---------------------------------------------

	// 🔹 Relation with Users
	@OneToMany(
		() => User,
		(user) => user.tenant,
	)
	users: User[];

	// 🔹 Relation with Projects
	@OneToMany(
		() => Project,
		(project) => project.tenant,
	)
	projects: Project[];

	// 🔹 Relation with Tags
	@OneToMany(
		() => TagEntity,
		(tag) => tag.tenant,
	)
	tags: TagEntity[];

	// 🔹 Relation with Variables
	@OneToMany(
		() => Variables,
		(variable) => variable.tenant,
	)
	variables: Variables[];

	// 🔹 Relation with Credentials
	@OneToMany(
		() => CredentialsEntity,
		(credential) => credential.tenant,
	)
	credentials: CredentialsEntity[];

	// 🔹 Relation with Event Destinations
	@OneToMany(
		() => EventDestinations,
		(dest) => dest.tenant,
	)
	eventDestinations: EventDestinations[];

	// 🔹 Uncomment if Source Control Preferences are reintroduced
	// @OneToMany(() => SourceControlPreferencesEntity, (scp) => scp.tenant)
	// sourceControlPreferences: SourceControlPreferencesEntity[];
	@OneToMany(
		() => InstalledNodes,
		(node) => node.tenant,
	)
	installedNodes: InstalledNodes[];
	@OneToMany(
		() => InstalledPackages,
		(pkg) => pkg.tenant,
	)
	installedPackages: InstalledPackages[];
}
