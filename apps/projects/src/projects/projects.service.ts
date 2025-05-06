import {
  CreateProjectDto,
  ProjectEntity,
  ProjectRepositoryInterface,
  ProjectRole,
  TeamMemberRepositoryInterface,
} from '@/shared';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject('ProjectRepositoryInterface')
    private readonly projectRepository: ProjectRepositoryInterface,
    @Inject('TeamMemberRepositoryInterface')
    private readonly teamMemberRepository: TeamMemberRepositoryInterface,
  ) {}
  async getProjectById(id: string): Promise<ProjectEntity> {
    return await this.projectRepository.findOneById(id);
  }

  async createProject(
    data: CreateProjectDto,
    creatorId: string,
  ): Promise<ProjectEntity> {
    console.log('ON CREATE');
    const project = await this.projectRepository.save({
      name: data.name,
      description: data.description,
    });

    await this.teamMemberRepository.save({
      project,
      userId: creatorId,
      role: ProjectRole.ADMIN,
    });

    return project;
  }

  async getAllProjects(): Promise<ProjectEntity[]> {
    return this.projectRepository.findAll({
      order: { createdAt: 'DESC' },
    });
  }

  async getUserProjects(userId: string): Promise<ProjectEntity[]> {
    const memberships = await this.teamMemberRepository.findAll({
      where: { userId },
      relations: ['project'],
    });

    return memberships.map((m) => m.project);
  }
}
