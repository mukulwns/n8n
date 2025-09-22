import type { TagEntity } from '@n8n/db';
import { TagRepository } from '@n8n/db';
import { Container } from '@n8n/di';
// eslint-disable-next-line n8n-local-rules/misplaced-n8n-typeorm-import
import type { FindManyOptions } from '@n8n/typeorm';
import type express from 'express';

import { TagService } from '@/services/tag.service';

import type { TagRequest } from '../../../types';
import {
	apiKeyHasScopeWithGlobalScopeFallback,
	validCursor,
} from '../../shared/middlewares/global.middleware';
import { encodeNextCursor } from '../../shared/services/pagination.service';
import { BadRequestError } from '@/errors/response-errors/bad-request.error';

export = {
	createTag: [
		apiKeyHasScopeWithGlobalScopeFallback({ scope: 'tag:create' }),
		async (req: TagRequest.Create, res: express.Response): Promise<express.Response> => {
			const { name } = req.body;
			const tenantId = req.user?.tenantId;
			if (!tenantId) {
				throw new BadRequestError('Tenant ID missing for user');
			}

			const newTag = Container.get(TagService).toEntity({ name: name.trim(), tenantId });

			try {
				const createdTag = await Container.get(TagService).save(newTag, 'create');
				return res.status(201).json(createdTag);
			} catch (error) {
				return res.status(409).json({ message: 'Tag already exists' });
			}
		},
	],
	updateTag: [
		apiKeyHasScopeWithGlobalScopeFallback({ scope: 'tag:update' }),
		async (req: TagRequest.Update, res: express.Response): Promise<express.Response> => {
			const { id } = req.params;
			const { name } = req.body;
			const tenantId = req.user?.tenantId;
			if (!tenantId) {
				throw new BadRequestError('Tenant ID missing for user');
			}

			try {
				await Container.get(TagService).getById(id, tenantId);
			} catch (error) {
				return res.status(404).json({ message: 'Not Found' });
			}

			const updateTag = Container.get(TagService).toEntity({ id, name: name.trim(), tenantId });

			try {
				const updatedTag = await Container.get(TagService).save(updateTag, 'update');
				return res.json(updatedTag);
			} catch (error) {
				return res.status(409).json({ message: 'Tag already exists' });
			}
		},
	],
	deleteTag: [
		apiKeyHasScopeWithGlobalScopeFallback({ scope: 'tag:delete' }),
		async (req: TagRequest.Delete, res: express.Response): Promise<express.Response> => {
			const { id } = req.params;
			const tenantId = req.user?.tenantId;
			if (!tenantId) {
				throw new BadRequestError('Tenant ID missing for user');
			}

			let tag;
			try {
				tag = await Container.get(TagService).getById(id, tenantId);
			} catch (error) {
				return res.status(404).json({ message: 'Not Found' });
			}

			await Container.get(TagService).delete(id, tenantId);
			return res.json(tag);
		},
	],
	getTags: [
		apiKeyHasScopeWithGlobalScopeFallback({ scope: 'tag:list' }),
		validCursor,
		async (req: TagRequest.GetAll, res: express.Response): Promise<express.Response> => {
			const { offset = 0, limit = 100 } = req.query;
			const tenantId = req.user?.tenantId;
			if (!tenantId) {
				throw new BadRequestError('Tenant ID missing for user');
			}

			const [tags, count] = await Container.get(TagRepository).findAndCount({
				where: { tenantId },
				skip: offset,
				take: limit,
			});

			return res.json({
				data: tags,
				nextCursor: encodeNextCursor({
					offset,
					limit,
					numberOfTotalRecords: count,
				}),
			});
		},
	],
	getTag: [
		apiKeyHasScopeWithGlobalScopeFallback({ scope: 'tag:read' }),
		async (req: TagRequest.Get, res: express.Response): Promise<express.Response> => {
			const { id } = req.params;
			const tenantId = req.user?.tenantId;
			if (!tenantId) {
				throw new BadRequestError('Tenant ID missing for user');
			}

			try {
				const tag = await Container.get(TagService).getById(id, tenantId);
				return res.json(tag);
			} catch (error) {
				return res.status(404).json({ message: 'Not Found' });
			}
		},
	],
};
