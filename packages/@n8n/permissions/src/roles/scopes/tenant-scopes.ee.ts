// tenant-scopes.ee.ts

import type { Scope } from '../../types.ee';

export const TENANT_OWNER_SCOPES: Scope[] = [
	// Tenant itself
	'tenant:read',
	'tenant:update',
	'tenant:delete',

	// User management
	'user:create',
	'user:update',
	'user:delete',
	'user:list',
	'user:read',

	// Workflows
	'workflow:create',
	'workflow:read',
	'workflow:update',
	'workflow:delete',
	'workflow:list',
	'workflow:share',
	'workflow:execute',
	'workflow:move',
	'workflow:share', // ✅ required for sharing API

	// Credentials
	'credential:create',
	'credential:read',
	'credential:update',
	'credential:delete',
	'credential:list',
	'credential:share',
	'credential:move',

	// Projects / Folders
	'project:create',
	'project:read',
	'project:update',
	'project:delete',
	'project:list',
	'folder:create',
	'folder:read',
	'folder:update',
	'folder:delete',
	'folder:list',
	'folder:move',

	// Tags & Variables
	'tag:create',
	'tag:read',
	'tag:update',
	'tag:delete',
	'tag:list',
	'variable:create',
	'variable:read',
	'variable:update',
	'variable:delete',
	'variable:list',
];

export const TENANT_ADMIN_SCOPES: Scope[] = [
	// Same as Owner except cannot delete tenant
	'tenant:read',
	'tenant:update',

	// Users
	'user:create',
	'user:update',
	'user:delete',
	'user:list',
	'user:read',

	// Workflows
	'workflow:create',
	'workflow:read',
	'workflow:update',
	'workflow:delete',
	'workflow:list',
	'workflow:share',
	'workflow:execute',
	'workflow:move',
	'workflow:share', // ✅ allow admins to share

	// Credentials
	'credential:create',
	'credential:read',
	'credential:update',
	'credential:delete',
	'credential:list',
	'credential:share',
	'credential:move',

	// Projects / Folders
	'project:create',
	'project:read',
	'project:update',
	'project:list',
	'folder:create',
	'folder:read',
	'folder:update',
	'folder:delete',
	'folder:list',
	'folder:move',

	// Tags & Variables
	'tag:create',
	'tag:read',
	'tag:update',
	'tag:delete',
	'tag:list',
	'variable:create',
	'variable:read',
	'variable:update',
	'variable:delete',
	'variable:list',
];

export const TENANT_MEMBER_SCOPES: Scope[] = [
	// No tenant/user management

	// Workflows
	'workflow:list',
	'workflow:read',
	'workflow:create',
	'workflow:update',
	'workflow:execute',
	'workflow:share', // 👈 add this

	// Credentials
	'credential:list',
	'credential:read',
	'credential:create', // optional — you can remove if you want admins only
	'credential:update',

	// Projects / Folders (limited)
	'project:list',
	'project:read',
	'folder:list',
	'folder:read',

	// Tags & Variables (mostly read)
	'tag:list',
	'tag:read',
	'variable:list',
	'variable:read',
];
