// src/saml/tenant-resolver.ts
import querystring from 'querystring';
import url from 'url';
import { AuthenticatedRequest } from '@n8n/db';

export const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000000'; // replace with your default tenant id

export function resolveTenantIdFromRequest(req: AuthenticatedRequest): string {
	// 1. If authenticated request with user
	// @ts-ignore
	if ((req as any).user?.tenantId) return (req as any).user.tenantId;

	// 2. Header
	const headerTenant = req.headers?.['x-tenant-id'] as string | undefined;
	if (headerTenant) return headerTenant;

	// 3. Try RelayState: sometimes RelayState includes a return url that has tenantId as query param
	// const relayState = (req.query?.RelayState || req.body?.RelayState) as string | undefined;
	// if (relayState) {
	// 	try {
	// 		const parsed = url.parse(relayState);
	// 		if (parsed.query) {
	// 			const parsedQuery = querystring.parse(parsed.query);
	// 			if (parsedQuery.tenantId && typeof parsedQuery.tenantId === 'string') {
	// 				return parsedQuery.tenantId;
	// 			}
	// 		}
	// 	} catch {
	// 		// ignore
	// 	}
	// }

	// 4. If RelayState not present, check req.query.redirect (your initSsoGet uses query.redirect)
	// const redirect = (req.query?.redirect ?? '') as string;
	// if (redirect) {
	// 	try {
	// 		const parsed = url.parse(redirect);
	// 		if (parsed.query) {
	// 			const parsedQuery = querystring.parse(parsed.query);
	// 			if (parsedQuery.tenantId && typeof parsedQuery.tenantId === 'string') {
	// 				return parsedQuery.tenantId;
	// 			}
	// 		}
	// 	} catch {
	// 		// ignore
	// 	}
	// }

	// 5. fallback
	return DEFAULT_TENANT_ID;
}
