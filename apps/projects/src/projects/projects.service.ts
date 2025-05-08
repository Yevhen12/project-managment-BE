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

@Injectable()
export class ProjectsService {
  constructor(
    @Inject('ProjectRepositoryInterface')
    private readonly projectRepository: ProjectRepositoryInterface,
    @Inject('TeamMemberRepositoryInterface')
    private readonly teamMemberRepository: TeamMemberRepositoryInterface,
    @Inject('InviteRepositiryInterface')
    private readonly inviteRepositiry: InviteRepositoryInterface,
    @Inject(USERS_SERVICE) private readonly usersService: ClientProxy,
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
      role: PROJECT_ROLES.ADMIN,
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

  async getPendingInvitesForUser(userId: string): Promise<InviteEntity[]> {
    const user = await firstValueFrom(
      this.usersService.send({ cmd: 'get-user' }, { id: userId }),
    );

    if (!user || !user.email) {
      throw new RpcException(new NotFoundException('User not found'));
    }

    return this.inviteRepositiry.findAll({
      where: {
        email: user.email,
        status: INVITE_STATUSES.PENDING,
      },
      relations: ['project'],
      order: { createdAt: 'DESC' },
    });
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
      console.log('projectId', projectId);
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
}
