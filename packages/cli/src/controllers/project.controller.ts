// import { CreateProjectDto, DeleteProjectDto, UpdateProjectDto } from '@n8n/api-types';
// import type { Project } from '@n8n/db';
// import { AuthenticatedRequest, ProjectRepository } from '@n8n/db';
// import {
// 	Get,
// 	Post,
// 	GlobalScope,
// 	RestController,
// 	Licensed,
// 	Patch,
// 	ProjectScope,
// 	Delete,
// 	Body,
// 	Param,
// 	Query,
// } from '@n8n/decorators';
// import { combineScopes, getRoleScopes, hasGlobalScope } from '@n8n/permissions';
// import type { Scope } from '@n8n/permissions';
// // eslint-disable-next-line n8n-local-rules/misplaced-n8n-typeorm-import
// import { In, Not } from '@n8n/typeorm';
// import { Response } from 'express';

// import { BadRequestError } from '@/errors/response-errors/bad-request.error';
// import { NotFoundError } from '@/errors/response-errors/not-found.error';
// import { EventService } from '@/events/event.service';
// import type { ProjectRequest } from '@/requests';
// import {
// 	ProjectService,
// 	TeamProjectOverQuotaError,
// 	UnlicensedProjectRoleError,
// } from '@/services/project.service.ee';
// import { UserManagementMailer } from '@/user-management/email';

// @RestController('/projects')
// export class ProjectController {
// 	constructor(
// 		private readonly projectsService: ProjectService,
// 		private readonly projectRepository: ProjectRepository,
// 		private readonly eventService: EventService,
// 		private readonly userManagementMailer: UserManagementMailer,
// 	) {}

// 	@Get('/')
// 	async getAllProjects(req: AuthenticatedRequest): Promise<Project[]> {
// 		return await this.projectsService.getAccessibleProjects(req.user);
// 	}

// 	@Get('/count')
// 	async getProjectCounts() {
// 		return await this.projectsService.getProjectCounts();
// 	}

// 	@Post('/')
// 	@GlobalScope('project:create')
// 	// Using admin as all plans that contain projects should allow admins at the very least
// 	@Licensed('feat:projectRole:admin')
// 	async createProject(req: AuthenticatedRequest, _res: Response, @Body payload: CreateProjectDto) {
// 		try {
// 			const project = await this.projectsService.createTeamProject(req.user, payload);

// 			this.eventService.emit('team-project-created', {
// 				userId: req.user.id,
// 				role: req.user.role,
// 			});

// 			return {
// 				...project,
// 				role: 'project:admin',
// 				scopes: [
// 					...combineScopes({
// 						global: getRoleScopes(req.user.role),
// 						project: getRoleScopes('project:admin'),
// 					}),
// 				],
// 			};
// 		} catch (e) {
// 			if (e instanceof TeamProjectOverQuotaError) {
// 				throw new BadRequestError(e.message);
// 			}
// 			throw e;
// 		}
// 	}

// 	@Get('/my-projects')
// 	async getMyProjects(
// 		req: AuthenticatedRequest,
// 		_res: Response,
// 	): Promise<ProjectRequest.GetMyProjectsResponse> {
// 		const relations = await this.projectsService.getProjectRelationsForUser(req.user);
// 		console.log(req.user,"user___________")
// 		const otherTeamProject = hasGlobalScope(req.user, 'project:read')
// 			? await this.projectRepository.findBy({
// 					type: 'team',
// 					id: Not(In(relations.map((pr) => pr.projectId))),
// 				})
// 			: [];

// 		const results: ProjectRequest.GetMyProjectsResponse = [];

// 		for (const pr of relations) {
// 			const result: ProjectRequest.GetMyProjectsResponse[number] = Object.assign(
// 				this.projectRepository.create(pr.project),
// 				{ role: pr.role, scopes: [] },
// 			);

// 			if (result.scopes) {
// 				result.scopes.push(
// 					...combineScopes({
// 						global: getRoleScopes(req.user.role),
// 						project: getRoleScopes(pr.role),
// 					}),
// 				);
// 			}

// 			results.push(result);
// 		}

// 		for (const project of otherTeamProject) {
// 			const result: ProjectRequest.GetMyProjectsResponse[number] = Object.assign(
// 				this.projectRepository.create(project),
// 				{
// 					// If the user has the global `project:read` scope then they may not
// 					// own this relationship in that case we use the global user role
// 					// instead of the relation role, which is for another user.
// 					role: req.user.role,
// 					scopes: [],
// 				},
// 			);

// 			if (result.scopes) {
// 				result.scopes.push(...combineScopes({ global: getRoleScopes(req.user.role) }));
// 			}

// 			results.push(result);
// 		}

// 		// Deduplicate and sort scopes
// 		for (const result of results) {
// 			if (result.scopes) {
// 				result.scopes = [...new Set(result.scopes)].sort();
// 			}
// 		}

// 		return results;
// 	}

// 	@Get('/personal')
// 	async getPersonalProject(req: AuthenticatedRequest) {
// 		const project = await this.projectsService.getPersonalProject(req.user);
// 		if (!project) {
// 			throw new NotFoundError('Could not find a personal project for this user');
// 		}
// 		const scopes: Scope[] = [
// 			...combineScopes({
// 				global: getRoleScopes(req.user.role),
// 				project: getRoleScopes('project:personalOwner'),
// 			}),
// 		];
// 		return {
// 			...project,
// 			scopes,
// 		};
// 	}

// 	@Get('/:projectId')
// 	@ProjectScope('project:read')
// 	async getProject(
// 		req: AuthenticatedRequest,
// 		_res: Response,
// 		@Param('projectId') projectId: string,
// 	): Promise<ProjectRequest.ProjectWithRelations> {
// 		const [{ id, name, icon, type, description }, relations] = await Promise.all([
// 			this.projectsService.getProject(projectId),
// 			this.projectsService.getProjectRelations(projectId),
// 		]);
// 		const myRelation = relations.find((r) => r.userId === req.user.id);

// 		return {
// 			id,
// 			name,
// 			icon,
// 			type,
// 			description,
// 			relations: relations.map((r) => ({
// 				id: r.user.id,
// 				email: r.user.email,
// 				firstName: r.user.firstName,
// 				lastName: r.user.lastName,
// 				role: r.role,
// 			})),
// 			scopes: [
// 				...combineScopes({
// 					global: getRoleScopes(req.user.role),
// 					...(myRelation ? { project: getRoleScopes(myRelation.role) } : {}),
// 				}),
// 			],
// 		};
// 	}

// 	@Patch('/:projectId')
// 	@ProjectScope('project:update')
// 	async updateProject(
// 		req: AuthenticatedRequest,
// 		_res: Response,
// 		@Body payload: UpdateProjectDto,
// 		@Param('projectId') projectId: string,
// 	) {
// 		const { name, icon, relations, description } = payload;
// 		if (name || icon || description) {
// 			await this.projectsService.updateProject(projectId, { name, icon, description });
// 		}
// 		if (relations) {
// 			try {
// 				const { project, newRelations } = await this.projectsService.syncProjectRelations(
// 					projectId,
// 					relations,
// 				);

// 				// Send email notifications to new sharees
// 				await this.userManagementMailer.notifyProjectShared({
// 					sharer: req.user,
// 					newSharees: newRelations,
// 					project: { id: project.id, name: project.name },
// 				});
// 			} catch (e) {
// 				if (e instanceof UnlicensedProjectRoleError) {
// 					throw new BadRequestError(e.message);
// 				}
// 				throw e;
// 			}

// 			this.eventService.emit('team-project-updated', {
// 				userId: req.user.id,
// 				role: req.user.role,
// 				members: relations,
// 				projectId,
// 			});
// 		}
// 	}

// 	@Delete('/:projectId')
// 	@ProjectScope('project:delete')
// 	async deleteProject(
// 		req: AuthenticatedRequest,
// 		_res: Response,
// 		@Query query: DeleteProjectDto,
// 		@Param('projectId') projectId: string,
// 	) {
// 		await this.projectsService.deleteProject(req.user, projectId, {
// 			migrateToProject: query.transferId,
// 		});

// 		this.eventService.emit('team-project-deleted', {
// 			userId: req.user.id,
// 			role: req.user.role,
// 			projectId,
// 			removalType: query.transferId !== undefined ? 'transfer' : 'delete',
// 			targetProjectId: query.transferId,
// 		});
// 	}
// }
import { CreateProjectDto, DeleteProjectDto, UpdateProjectDto } from '@n8n/api-types';
import type { Project } from '@n8n/db';
import { AuthenticatedRequest, ProjectRepository } from '@n8n/db';
import {
	Get,
	Post,
	GlobalScope,
	RestController,
	Licensed,
	Patch,
	ProjectScope,
	Delete,
	Body,
	Param,
	Query,
} from '@n8n/decorators';
import { combineScopes, getRoleScopes, hasGlobalScope } from '@n8n/permissions';
import type { Scope } from '@n8n/permissions';
import { In, Not } from '@n8n/typeorm';
import { Response } from 'express';
import { Logger } from '@n8n/backend-common';
import { BadRequestError } from '@/errors/response-errors/bad-request.error';
import { NotFoundError } from '@/errors/response-errors/not-found.error';
import { EventService } from '@/events/event.service';
import type { ProjectRequest } from '@/requests';
import {
	ProjectService,
	TeamProjectOverQuotaError,
	UnlicensedProjectRoleError,
} from '@/services/project.service.ee';
import { UserManagementMailer } from '@/user-management/email';

@RestController('/projects')
export class ProjectController {
	constructor(
		private readonly logger: Logger,
		private readonly projectsService: ProjectService,
		private readonly projectRepository: ProjectRepository,
		private readonly eventService: EventService,
		private readonly userManagementMailer: UserManagementMailer,
	) {}

	@Get('/')
	async getAllProjects(req: AuthenticatedRequest): Promise<Project[]> {
		if (!req.tenantId) {
			this.logger.debug('Tenant ID missing in request');
			throw new BadRequestError('Tenant ID missing in JWT');
		}
		const projects = await this.projectsService.getAccessibleProjects(req.user, req.tenantId);
		this.logger.debug('Retrieved projects', { count: projects.length, tenantId: req.tenantId });
		return projects;
	}

	@Get('/count')
	async getProjectCounts(req: AuthenticatedRequest) {
		if (!req.tenantId) {
			this.logger.debug('Tenant ID missing in request');
			throw new BadRequestError('Tenant ID missing in JWT');
		}
		const counts = await this.projectsService.getProjectCounts(req.tenantId);
		this.logger.debug('Retrieved project counts', { counts, tenantId: req.tenantId });
		return counts;
	}

	@Post('/')
	@GlobalScope('project:create')
	@Licensed('feat:projectRole:admin')
	async createProject(req: AuthenticatedRequest, _res: Response, @Body payload: CreateProjectDto) {
		if (!req.tenantId) {
			this.logger.debug('Tenant ID missing in request');
			throw new BadRequestError('Tenant ID missing in JWT');
		}
		try {
			const project = await this.projectsService.createTeamProject(req.user, {
				...payload,
				tenantId: req.tenantId,
			});
			this.logger.debug('Created project', { projectId: project.id, tenantId: req.tenantId });

			this.eventService.emit('team-project-created', {
				userId: req.user.id,
				role: req.user.role,
				tenantId: req.tenantId,
			});

			return {
				...project,
				role: 'project:admin',
				scopes: [
					...combineScopes({
						global: getRoleScopes(req.user.role),
						project: getRoleScopes('project:admin'),
					}),
				],
			};
		} catch (e) {
			if (e instanceof TeamProjectOverQuotaError) {
				this.logger.debug('Project creation failed due to quota', { tenantId: req.tenantId });
				throw new BadRequestError(e.message);
			}
			this.logger.error('Failed to create project', {
				error: (e as Error).message,
				tenantId: req.tenantId,
			});
			throw e;
		}
	}

	@Get('/my-projects')
	async getMyProjects(
		req: AuthenticatedRequest,
		_res: Response,
	): Promise<ProjectRequest.GetMyProjectsResponse> {
		if (!req.tenantId) {
			this.logger.debug('Tenant ID missing in request');
			throw new BadRequestError('Tenant ID missing in JWT');
		}
		const relations = await this.projectsService.getProjectRelationsForUser(req.user);
		const otherTeamProject = hasGlobalScope(req.user, 'project:read')
			? await this.projectRepository.findBy({
					type: 'team',
					tenantId: req.tenantId,
					id: Not(In(relations.map((pr) => pr.projectId))),
				})
			: [];

		const results: ProjectRequest.GetMyProjectsResponse = [];

		for (const pr of relations) {
			const result: ProjectRequest.GetMyProjectsResponse[number] = Object.assign(
				this.projectRepository.create(pr.project),
				{ role: pr.role, scopes: [] },
			);

			if (result.scopes) {
				result.scopes.push(
					...combineScopes({
						global: getRoleScopes(req.user.role),
						project: getRoleScopes(pr.role),
					}),
				);
			}

			results.push(result);
		}

		for (const project of otherTeamProject) {
			const result: ProjectRequest.GetMyProjectsResponse[number] = Object.assign(
				this.projectRepository.create(project),
				{
					role: req.user.role,
					scopes: [],
				},
			);

			if (result.scopes) {
				result.scopes.push(...combineScopes({ global: getRoleScopes(req.user.role) }));
			}

			results.push(result);
		}

		// Deduplicate and sort scopes
		for (const result of results) {
			if (result.scopes) {
				result.scopes = [...new Set(result.scopes)].sort();
			}
		}

		this.logger.debug('Retrieved my projects', { count: results.length, tenantId: req.tenantId });
		return results;
	}

	@Get('/personal')
	async getPersonalProject(req: AuthenticatedRequest) {
		if (!req.tenantId) {
			this.logger.debug('Tenant ID missing in request');
			throw new BadRequestError('Tenant ID missing in JWT');
		}
		const project = await this.projectsService.getPersonalProject(req.user, req.tenantId);
		if (!project) {
			this.logger.debug('Personal project not found', {
				userId: req.user.id,
				tenantId: req.tenantId,
			});
			throw new NotFoundError('Could not find a personal project for this user');
		}
		const scopes: Scope[] = [
			...combineScopes({
				global: getRoleScopes(req.user.role),
				project: getRoleScopes('project:personalOwner'),
			}),
		];
		this.logger.debug('Retrieved personal project', {
			projectId: project.id,
			tenantId: req.tenantId,
		});
		return {
			...project,
			scopes,
		};
	}

	@Get('/:projectId')
	@ProjectScope('project:read')
	async getProject(
		req: AuthenticatedRequest,
		_res: Response,
		@Param('projectId') projectId: string,
	): Promise<ProjectRequest.ProjectWithRelations> {
		if (!req.tenantId) {
			this.logger.debug('Tenant ID missing in request');
			throw new BadRequestError('Tenant ID missing in JWT');
		}
		const [{ id, name, icon, type, description, tenantId }, relations] = await Promise.all([
			this.projectsService.getProject(projectId, req.tenantId),
			this.projectsService.getProjectRelations(projectId),
		]);
		if (tenantId !== req.tenantId) {
			this.logger.debug('Project does not belong to tenant', {
				projectId,
				tenantId,
				requestedTenantId: req.tenantId,
			});
			throw new NotFoundError('Project not found for this tenant');
		}
		const myRelation = relations.find((r) => r.userId === req.user.id);

		this.logger.debug('Retrieved project', { projectId, tenantId: req.tenantId });
		return {
			id,
			name,
			icon,
			type,
			description,
			relations: relations.map((r) => ({
				id: r.user.id,
				email: r.user.email,
				firstName: r.user.firstName,
				lastName: r.user.lastName,
				role: r.role,
			})),
			scopes: [
				...combineScopes({
					global: getRoleScopes(req.user.role),
					...(myRelation ? { project: getRoleScopes(myRelation.role) } : {}),
				}),
			],
		};
	}

	@Patch('/:projectId')
	@ProjectScope('project:update')
	async updateProject(
		req: AuthenticatedRequest,
		_res: Response,
		@Body payload: UpdateProjectDto,
		@Param('projectId') projectId: string,
	) {
		if (!req.tenantId) {
			this.logger.debug('Tenant ID missing in request');
			throw new BadRequestError('Tenant ID missing in JWT');
		}
		const { name, icon, relations, description } = payload;
		if (name || icon || description) {
			const project = await this.projectsService.getProject(projectId, req.tenantId);
			if (project.tenantId !== req.tenantId) {
				this.logger.debug('Project does not belong to tenant', {
					projectId,
					tenantId: project.tenantId,
					requestedTenantId: req.tenantId,
				});
				throw new NotFoundError('Project not found for this tenant');
			}
			await this.projectsService.updateProject(projectId, { name, icon, description });
			this.logger.debug('Updated project', { projectId, tenantId: req.tenantId });
		}
		if (relations) {
			try {
				const { project, newRelations } = await this.projectsService.syncProjectRelations(
					projectId,
					relations,
				);
				// if (project.tenantId !== req.tenantId) {
				// 	this.logger.debug('Project does not belong to tenant', { projectId, tenantId: project.tenantId, requestedTenantId: req.tenantId });
				// 	throw new NotFoundError('Project not found for this tenant');
				// }

				await this.userManagementMailer.notifyProjectShared({
					sharer: req.user,
					newSharees: newRelations,
					project: { id: project.id, name: project.name },
				});
				this.logger.debug('Synced project relations', { projectId, tenantId: req.tenantId });
			} catch (e) {
				if (e instanceof UnlicensedProjectRoleError) {
					this.logger.debug('Project update failed due to unlicensed role', {
						tenantId: req.tenantId,
					});
					throw new BadRequestError(e.message);
				}
				this.logger.error('Failed to update project relations', {
					error: (e as Error).message,
					tenantId: req.tenantId,
				});
				throw e;
			}

			this.eventService.emit('team-project-updated', {
				userId: req.user.id,
				role: req.user.role,
				members: relations,
				projectId,
				tenantId: req.tenantId,
			});
		}
	}

	@Delete('/:projectId')
	@ProjectScope('project:delete')
	async deleteProject(
		req: AuthenticatedRequest,
		_res: Response,
		@Query query: DeleteProjectDto,
		@Param('projectId') projectId: string,
	) {
		if (!req.tenantId) {
			this.logger.debug('Tenant ID missing in request');
			throw new BadRequestError('Tenant ID missing in JWT');
		}
		const project = await this.projectsService.getProject(projectId, req.tenantId);
		if (project.tenantId !== req.tenantId) {
			this.logger.debug('Project does not belong to tenant', {
				projectId,
				tenantId: project.tenantId,
				requestedTenantId: req.tenantId,
			});
			throw new NotFoundError('Project not found for this tenant');
		}
		await this.projectsService.deleteProject(req.user, projectId, {
			migrateToProject: query.transferId,
		});
		this.logger.debug('Deleted project', { projectId, tenantId: req.tenantId });

		this.eventService.emit('team-project-deleted', {
			userId: req.user.id,
			role: req.user.role,
			projectId,
			removalType: query.transferId !== undefined ? 'transfer' : 'delete',
			targetProjectId: query.transferId,
			tenantId: req.tenantId,
		});
	}
}
