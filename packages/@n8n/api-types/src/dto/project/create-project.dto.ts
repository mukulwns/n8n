import { Z } from 'zod-class';
import { z } from 'zod';

import { projectIconSchema, projectNameSchema } from '../../schemas/project.schema';

export class CreateProjectDto extends Z.class({
	name: projectNameSchema,
	icon: projectIconSchema.optional(),
	tenantId: z.string().optional(),
}) {}
