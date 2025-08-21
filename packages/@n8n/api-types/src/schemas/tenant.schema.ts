import { z } from "zod";

export const tenantNameSchema = z.string().min(1).max(255);
export const tenantDomainSchema = z.string().url().max(255);
