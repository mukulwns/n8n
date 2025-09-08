import { CreateOrUpdateTagRequestDto, RetrieveTagQueryDto } from '@n8n/api-types';
import { AuthenticatedRequest } from '@n8n/db';
import {
	Delete,
	Get,
	Patch,
	Post,
	RestController,
	GlobalScope,
	Body,
	Param,
	Query,
} from '@n8n/decorators';
import { Response } from 'express';

import { TagService } from '@/services/tag.service';

@RestController('/tags')
export class TagsController {
	constructor(private readonly tagService: TagService) {}

	@Get('/')
	@GlobalScope('tag:list')
	async getAll(_req: AuthenticatedRequest, _res: Response, @Query query: RetrieveTagQueryDto) {
		const tenantId = _req.user?.tenantId ?? null;
		if (!tenantId) {
			throw new Error('Tenant ID is required');
		}
		return await this.tagService.getAll(tenantId, { withUsageCount: query.withUsageCount });
	}

	@Post('/')
	@GlobalScope('tag:create')
	async createTag(
		_req: AuthenticatedRequest,
		_res: Response,
		@Body payload: CreateOrUpdateTagRequestDto,
	) {
		const tenantId = _req.user?.tenantId ?? null;
		if (!tenantId) {
			throw new Error('Tenant ID is required');
		}
		const { name } = payload;

		const tag = this.tagService.toEntity({ name, tenantId });

		return await this.tagService.save(tag, 'create');
	}

	@Patch('/:id')
	@GlobalScope('tag:update')
	async updateTag(
		_req: AuthenticatedRequest,
		_res: Response,
		@Param('id') tagId: string,
		@Body payload: CreateOrUpdateTagRequestDto,
	) {
		const tenantId = _req.user?.tenantId ?? null;
		if (!tenantId) {
			throw new Error('Tenant ID is required');
		}
		const newTag = this.tagService.toEntity({ id: tagId, name: payload.name, tenantId });

		return await this.tagService.save(newTag, 'update');
	}

	@Delete('/:id')
	@GlobalScope('tag:delete')
	async deleteTag(_req: AuthenticatedRequest, _res: Response, @Param('id') tagId: string) {
		const tenantId = _req.user?.tenantId ?? null;
		if (!tenantId) {
			throw new Error('Tenant ID is required');
		}
		await this.tagService.delete(tagId, tenantId);
		return true;
	}
}
