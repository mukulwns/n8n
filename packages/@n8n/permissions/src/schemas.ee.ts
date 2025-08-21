import { z } from 'zod';

export const roleNamespaceSchema = z.enum(['global', 'project', 'credential', 'workflow']);

export const globalRoleSchema = z.enum(['global:owner', 'global:admin', 'global:member']);

export const assignableGlobalRoleSchema = globalRoleSchema.exclude([
	'global:owner', // Owner cannot be changed
]);

export const personalRoleSchema = z.enum([
	'project:personalOwner', // personalOwner is only used for personal projects
]);

export const teamRoleSchema = z.enum(['project:admin', 'project:editor', 'project:viewer']);

export const projectRoleSchema = z.enum([...personalRoleSchema.options, ...teamRoleSchema.options]);

export const credentialSharingRoleSchema = z.enum(['credential:owner', 'credential:user']);

export const workflowSharingRoleSchema = z.enum(['workflow:owner', 'workflow:editor']);
export const tenantRoleSchema = z.enum([
	'tenant:owner',
	'tenant:admin',
	'tenant:member',
]);
export const assignableTenantRoleSchema = tenantRoleSchema.exclude([
	'tenant:owner', // Owner cannot be reassigned
]);

