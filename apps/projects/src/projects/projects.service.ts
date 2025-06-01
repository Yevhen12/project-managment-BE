import { INVITE_STATUSES } from './../../../../libs/shared/src/constants/enums';
import {
  CreateProjectDto,
  HandleInviteDto,
  InviteEntity,
  InviteRepositoryInterface,
  PROJECT_ROLES,
  ProjectEntity,
  ProjectRepositoryInterface,
  RemoveTeamMemberDto,
  SendInviteDto,
  SprintRepositoryInterface,
  TeamMemberEntity,
  TeamMemberRepositoryInterface,
  UpdateTeamMemberRoleDto,
  USERS_SERVICE,
} from '@/shared';
import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AnalyticsService } from '../analytics/alalyticsService';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject('ProjectRepositoryInterface')
    private readonly projectRepository: ProjectRepositoryInterface,
    @Inject('TeamMemberRepositoryInterface')
    private readonly teamMemberRepository: TeamMemberRepositoryInterface,
    @Inject('InviteRepositiryInterface')
    private readonly inviteRepositiry: InviteRepositoryInterface,
    @Inject('SprintRepositiryInterface')
    private readonly sprintRepository: SprintRepositoryInterface,
    @Inject(USERS_SERVICE) private readonly usersService: ClientProxy,
    private readonly analyticsService: AnalyticsService,
  ) {}
  async getProjectById(id: string, userId: string): Promise<any> {
    const project = await this.projectRepository.findByCondition({
      where: { id },
      relations: ['teamMembers', 'teamMembers.user', 'sprints', 'tasks'],
    });

    if (!project) {
      throw new RpcException(new NotFoundException('Project not found'));
    }

    const activeSprint = project.sprints.find((s) => s.isActive);

    const member = project.teamMembers.find((m) => m.userId === userId);

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      currentSprint: activeSprint || null,
      teamMembers: project.teamMembers,
      myRole: member?.role || null,
    };
  }

  async createProject(data: CreateProjectDto, creatorId: string): Promise<any> {
    const project = await this.projectRepository.save({
      name: data.name,
      description: data.description,
    });

    const membership = await this.teamMemberRepository.save({
      project,
      userId: creatorId,
      role: PROJECT_ROLES.ADMIN,
    });

    const fullProject = await this.projectRepository.findByCondition({
      where: { id: project.id },
      relations: ['teamMembers', 'teamMembers.user', 'sprints'],
    });

    const activeSprint = fullProject.sprints.find((s) => s.isActive);
    const teamMembers = fullProject.teamMembers.map((tm) => ({
      id: tm.id,
      user: {
        id: tm.user.id,
        firstName: tm.user.firstName,
        lastName: tm.user.lastName,
        email: tm.user.email,
      },
      role: tm.role,
    }));

    return {
      id: fullProject.id,
      name: fullProject.name,
      description: fullProject.description,
      teamMembers,
      currentSprint: activeSprint
        ? {
            id: activeSprint.id,
            name: activeSprint.name,
            startDate: activeSprint.startDate,
            endDate: activeSprint.endDate,
          }
        : null,
      myRole: membership.role,
    };
  }

  async getAllProjects(): Promise<ProjectEntity[]> {
    return this.projectRepository.findAll({
      order: { createdAt: 'DESC' },
    });
  }

  async getUserProjects(userId: string): Promise<any[]> {
    const memberships = await this.teamMemberRepository.findAll({
      where: { userId },
      relations: [
        'project',
        'project.teamMembers',
        'project.teamMembers.user',
        'project.sprints',
      ],
    });

    return memberships.map((membership) => {
      const project = membership.project;
      const activeSprint = project.sprints.find((s) => s.isActive);
      const teamMembers = project.teamMembers.map((tm) => ({
        id: tm.id,
        user: {
          id: tm.user.id,
          firstName: tm.user.firstName,
          lastName: tm.user.lastName,
          email: tm.user.email,
        },
        role: tm.role,
      }));

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        teamMembers,
        currentSprint: activeSprint
          ? {
              id: activeSprint.id,
              name: activeSprint.name,
              startDate: activeSprint.startDate,
              endDate: activeSprint.endDate,
            }
          : null,
        myRole: membership.role,
      };
    });
  }

  async sendInvite(dto: SendInviteDto): Promise<InviteEntity> {
    const { projectId, email, senderId, role } = dto;

    try {
      const user = await firstValueFrom(
        this.usersService.send({ cmd: 'find-by-email' }, { email }),
      );

      if (!user) {
        throw new RpcException(
          new NotFoundException(`User with email ${email} not found`),
        );
      }

      const isSenderInProject = await this.teamMemberRepository.findByCondition(
        {
          where: {
            userId: senderId,
            project: {
              id: projectId,
            },
          },
        },
      );

      if (!isSenderInProject) {
        throw new RpcException(
          new ForbiddenException('You are not a member of this project'),
        );
      }

      const existing = await this.inviteRepositiry.findByCondition({
        where: { email, projectId, status: INVITE_STATUSES.PENDING },
      });

      if (existing) {
        throw new RpcException(new ConflictException('Invite already exists'));
      }

      const invite = this.inviteRepositiry.create({
        email,
        projectId,
        role,
        sentBy: senderId,
        status: INVITE_STATUSES.PENDING,
        createdAt: new Date(),
      });

      return this.inviteRepositiry.save(invite);
    } catch (error) {
      throw error instanceof RpcException ? error : new RpcException(error);
    }
  }

  async getAllInvites(): Promise<InviteEntity[]> {
    return this.inviteRepositiry.findAll({
      relations: ['project'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUserInvites(userId: string): Promise<InviteEntity[]> {
    const user = await firstValueFrom(
      this.usersService.send({ cmd: 'get-user' }, { id: userId }),
    );

    if (!user || !user.email) {
      throw new RpcException(new NotFoundException('User not found'));
    }

    const invites = await this.inviteRepositiry.findAll({
      where: { email: user.email },
      relations: ['project'],
      order: { createdAt: 'DESC' },
    });

    return invites;
  }

  async approveInvite({
    inviteId,
    userId,
  }: HandleInviteDto): Promise<InviteEntity> {
    try {
      const invite = await this.inviteRepositiry.findByCondition({
        where: { id: inviteId },
        relations: ['project'],
      });

      if (!invite) throw new NotFoundException('Invite not found');
      if (invite.status !== INVITE_STATUSES.PENDING) {
        throw new ConflictException('Invite already processed');
      }

      invite.status = INVITE_STATUSES.ACCEPTED;
      await this.inviteRepositiry.save(invite);

      await this.teamMemberRepository.save({
        userId,
        project: invite.project,
        role: invite.role as PROJECT_ROLES,
      });

      return invite;
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error : new Error('Internal error'),
      );
    }
  }

  async declineInvite({
    inviteId,
    userId,
  }: HandleInviteDto): Promise<InviteEntity> {
    try {
      const invite = await this.inviteRepositiry.findOneById(inviteId);

      if (!invite) throw new NotFoundException('Invite not found');
      if (invite.status !== INVITE_STATUSES.PENDING) {
        throw new ConflictException('Invite already processed');
      }

      invite.status = INVITE_STATUSES.DECLINED;
      return this.inviteRepositiry.save(invite);
    } catch (error) {
      throw new RpcException(
        error instanceof Error ? error : new Error('Internal error'),
      );
    }
  }

  async getPendingInvitesForUser(userId: string): Promise<any[]> {
    const user = await firstValueFrom(
      this.usersService.send({ cmd: 'get-user' }, { id: userId }),
    );

    if (!user || !user.email) {
      throw new RpcException(new NotFoundException('User not found'));
    }

    const invites = await this.inviteRepositiry.findAll({
      where: {
        email: user.email,
        status: INVITE_STATUSES.PENDING,
      },
      relations: ['project'],
      order: { createdAt: 'DESC' },
    });

    const result = await Promise.all(
      invites.map(async (invite) => {
        const [team, activeSprint, sender] = await Promise.all([
          this.teamMemberRepository.findAll({
            where: { project: { id: invite.project.id } },
          }),
          this.sprintRepository.findByCondition({
            where: {
              project: { id: invite.project.id },
              isActive: true,
            },
          }),
          firstValueFrom(
            this.usersService.send({ cmd: 'get-user' }, { id: invite.sentBy }),
          ),
        ]);

        return {
          id: invite.id,
          role: invite.role,
          status: invite.status,
          createdAt: invite.createdAt,
          projectId: invite.project.id,
          project: {
            id: invite.project.id,
            name: invite.project.name,
            description: invite.project.description,
            createdAt: invite.project.createdAt,
          },
          teamSize: team.length,
          currentSprint: activeSprint?.name || null,
          createdBy: {
            name: `${sender.firstName} ${sender.lastName}`,
            email: sender.email,
          },
        };
      }),
    );

    return result;
  }

  async updateTeamMemberRole(
    dto: UpdateTeamMemberRoleDto,
  ): Promise<TeamMemberEntity> {
    const { userId, projectId, newRole } = dto;
    const member = await this.teamMemberRepository.findByCondition({
      where: {
        userId,
        project: { id: projectId },
      },
      relations: ['project'],
    });

    if (!member) {
      throw new RpcException(new NotFoundException('Team member not found'));
    }

    member.role = newRole;

    return await this.teamMemberRepository.save(member);
  }

  async removeTeamMember(
    dto: RemoveTeamMemberDto,
  ): Promise<{ success: boolean }> {
    const { userId, projectId } = dto;

    const member = await this.teamMemberRepository.findByCondition({
      where: {
        userId,
        project: { id: projectId },
      },
      relations: ['project'],
    });

    if (!member) {
      throw new RpcException(new NotFoundException('Team member not found'));
    }

    await this.teamMemberRepository.remove(member);
    return { success: true };
  }

  async getProjectTeamMembers(projectId: string): Promise<TeamMemberEntity[]> {
    try {
      return await this.teamMemberRepository.findAll({
        where: {
          project: {
            id: projectId,
          },
        },
        relations: ['project', 'user'],
      });
    } catch (error) {
      console.log('error', error);
      throw new RpcException({
        message: 'Internal error',
      });
    }
  }
  async getAnalytics(projectId: string, userId: string) {
    const member = await this.teamMemberRepository.findByCondition({
      where: { userId, project: { id: projectId } },
      relations: ['project'],
    });

    if (!member) {
      throw new RpcException(
        new ForbiddenException('Not a member of this project'),
      );
    }

    if (member.role === PROJECT_ROLES.ADMIN) {
      return this.analyticsService.getAdminAnalytics(projectId);
    }

    return this.analyticsService.getDeveloperAnalytics(projectId, userId);
  }
}
