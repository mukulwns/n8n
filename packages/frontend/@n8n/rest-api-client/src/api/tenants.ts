import type { IRestApiContext } from '../types';
import { makeRestApiRequest } from '../utils';

// DTOs for tenants
export interface Tenant {
	id: string;
	name: string;
	domain?: string;
	createdAt: string;
	updatedAt: string;
}

export type TenantCreatePayload = {
	name: string;
	domain?: string;
};

export type TenantUpdatePayload = {
	name?: string;
	domain?: string;
};

// API Calls

export async function getTenants(context: IRestApiContext): Promise<Tenant[]> {
	return await makeRestApiRequest(context, 'GET', '/tenants');
}

export async function getTenantById(context: IRestApiContext, id: string): Promise<Tenant> {
	return await makeRestApiRequest(context, 'GET', `/tenants/${id}`);
}

export async function createTenant(
	context: IRestApiContext,
	payload: TenantCreatePayload,
): Promise<Tenant> {
	return await makeRestApiRequest(context, 'POST', '/tenants', payload);
}

export async function updateTenant(
	context: IRestApiContext,
	id: string,
	payload: TenantUpdatePayload,
): Promise<Tenant> {
	return await makeRestApiRequest(context, 'PATCH', `/tenants/${id}`, payload);
}

export async function deleteTenant(context: IRestApiContext, id: string): Promise<void> {
	await makeRestApiRequest(context, 'DELETE', `/tenants/${id}`);
}
