// import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from '@n8n/typeorm';
// import { Tenant } from './tenant';

// @Entity('source_control_preferences')
// export class SourceControlPreferencesEntity {
// 	@PrimaryGeneratedColumn('uuid')
// 	id: string;

// 	@Column('boolean', { default: false })
// 	connected: boolean;

// 	@Column('text')
// 	repositoryUrl: string;

// 	@Column('text', { default: 'main' })
// 	branchName: string;

// 	@Column('boolean', { default: false })
// 	branchReadOnly: boolean;

// 	@Column('text', { nullable: true })
// 	branchColor: string;

// 	@Column('text', { nullable: true })
// 	publicKey?: string;

// 	@Column('boolean', { default: false })
// 	initRepo?: boolean;

// 	@Column('text', { nullable: true })
// 	keyGeneratorType?: string;

// 	// 🔑 tenant relationship
// 	@ManyToOne(() => Tenant, (tenant) => tenant.sourceControlPreferences, { nullable: false })
// 	@JoinColumn({ name: 'tenant_id' })
// 	tenant: Tenant;

// 	@Column({ name: 'tenant_id', type: 'uuid' })
// 	tenantId: string;
// }
