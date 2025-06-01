import {
  ProjectRepositoryInterface,
  TeamMemberRepositoryInterface,
  InviteRepositoryInterface,
  TaskRepositoryInterface,
  WorkLogRepositoryInterface,
  CommentRepositoryInterface,
  USERS_SERVICE,
  SprintEntity,
  SprintRepositoryInterface,
  stripTime,
} from '@/shared';
import { CreateSprintDto } from '@/shared/dtos/projects/CreateSprint.dto';
import { UpdateSprintDto } from '@/shared/dtos/projects/UpdateSprint.dto';
import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';

@Injectable()
export class SprintService {
  constructor(
    @Inject('ProjectRepositoryInterface')
    private readonly projectRepository: ProjectRepositoryInterface,
    @Inject('TeamMemberRepositoryInterface')
    private readonly teamMemberRepository: TeamMemberRepositoryInterface,
    @Inject('InviteRepositiryInterface')
    private readonly inviteRepositiry: InviteRepositoryInterface,
    @Inject('TaskRepositiryInterface')
    private readonly taskRepository: TaskRepositoryInterface,
    @Inject('WorkLogRepositiryInterface')
    private readonly workLogRepository: WorkLogRepositoryInterface,
    @Inject('CommentRepositiryInterface')
    private readonly commentRepository: CommentRepositoryInterface,
    @Inject('SprintRepositiryInterface')
    private readonly sprintRepository: SprintRepositoryInterface,
    @Inject(USERS_SERVICE) private readonly usersService: ClientProxy,
  ) {}
  async createSprint(
    dto: CreateSprintDto & { taskIds?: string[] },
  ): Promise<SprintEntity> {
    const { name, startDate, endDate, projectId, taskIds = [] } = dto;

    const project = await this.projectRepository.findOneById(projectId);
    if (!project) {
      throw new RpcException(new NotFoundException('Project not found'));
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new RpcException(new BadRequestException('Invalid date format'));
    }

    if (start >= end) {
      throw new RpcException(
        new BadRequestException('Start date must be before end date'),
      );
    }

    const existingActive = await this.sprintRepository.findByCondition({
      where: {
        project: { id: projectId },
        isActive: true,
      },
    });

    if (existingActive) {
      throw new RpcException(
        new ConflictException(
          'Active sprint already exists. Complete it before creating a new one.',
        ),
      );
    }

    const sprint = this.sprintRepository.create({
      name,
      startDate: start,
      endDate: end,
      isActive: true,
      project,
    });

    const createdSprint = await this.sprintRepository.save(sprint);

    if (taskIds.length > 0) {
      await this.taskRepository.updateMany(taskIds, { sprint: createdSprint });
    }

    return createdSprint;
  }

  async checkAndExpireActiveSprint(projectId: string): Promise<void> {
    const sprint = await this.sprintRepository.findByCondition({
      where: {
        project: { id: projectId },
        isActive: true,
      },
    });

    if (!sprint) return;

    const today = stripTime(new Date());
    const sprintEnd = stripTime(new Date(sprint.endDate));

    if (sprintEnd < today) {
      sprint.isActive = false;
      sprint.completedAt = new Date();
      await this.sprintRepository.save(sprint);
    }
  }
  async getAllSprintsForProject(projectId: string): Promise<SprintEntity[]> {
    await this.checkAndExpireActiveSprint(projectId);

    return this.sprintRepository.findAll({
      where: { project: { id: projectId } },
      relations: ['tasks', 'tasks.assignee', 'tasks.reporter', 'tasks.labels'],
      order: { startDate: 'ASC' },
    });
  }

  async getActiveSprint(projectId: string): Promise<SprintEntity | null> {
    await this.checkAndExpireActiveSprint(projectId);

    return this.sprintRepository.findByCondition({
      where: {
        project: { id: projectId },
        isActive: true,
      },
      relations: ['tasks', 'tasks.assignee', 'tasks.reporter', 'tasks.labels'],
    });
  }

  async getArchivedSprints(projectId: string): Promise<SprintEntity[]> {
    return this.sprintRepository.findAll({
      where: {
        project: { id: projectId },
        isActive: false,
      },
      relations: ['tasks', 'tasks.assignee', 'tasks.reporter', 'tasks.labels'],
      order: {
        completedAt: 'DESC',
      },
    });
  }

  async updateSprint(
    sprintId: string,
    dto: UpdateSprintDto,
  ): Promise<SprintEntity> {
    const sprint = await this.sprintRepository.findOneById(sprintId);
    if (!sprint) {
      throw new RpcException(new NotFoundException('Sprint not found'));
    }

    if (
      dto.startDate &&
      dto.endDate &&
      new Date(dto.endDate) < new Date(dto.startDate)
    ) {
      throw new RpcException(
        new BadRequestException('End date cannot be before start date'),
      );
    }

    if (dto.startDate && new Date(dto.startDate) < new Date()) {
      throw new RpcException(
        new BadRequestException('Start date cannot be in the past'),
      );
    }

    Object.assign(sprint, {
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : sprint.startDate,
      endDate: dto.endDate ? new Date(dto.endDate) : sprint.endDate,
    });

    return this.sprintRepository.save(sprint);
  }

  async completeSprintManually(sprintId: string): Promise<SprintEntity> {
    const sprint = await this.sprintRepository.findOneById(sprintId);

    if (!sprint) {
      throw new RpcException(new NotFoundException('Sprint not found'));
    }

    if (!sprint.isActive) {
      throw new RpcException(
        new ConflictException('Sprint is already completed'),
      );
    }

    sprint.isActive = false;
    sprint.forcedFinished = true;
    sprint.completedAt = new Date();

    return this.sprintRepository.save(sprint);
  }
}
