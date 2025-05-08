import {
  PROJECT_SERVICE,
  AuthGuard,
  DEFAULT_ERROR,
  CreateProjectDto,
  User,
  SendInviteDto,
  RemoveTeamMemberDto,
  UpdateTeamMemberRoleDto,
} from '@/shared';
import {
  Controller,
  Inject,
  Get,
  UseGuards,
  Post,
  Body,
  Req,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RpcErrorToHttpException } from '../utils/rpc-exception.handler';

@Controller('projects')
export class ProjectController {
  constructor(
    @Inject(PROJECT_SERVICE) private readonly projectService: ClientProxy,
  ) {}

  @UseGuards(AuthGuard)
  @Get('getOne')
  async getProject() {
    console.log('ON GET PROJECT BY ID');
    const project = await firstValueFrom(
      this.projectService.send(
        {
          cmd: 'get-project',
        },
        {
          id: '119acd86-06ad-469b-8f15-a4e566c2d834',
        },
      ),
    );
    return {
      status: 200,
      data: project,
      message: 'Users recieved',
    };
  }

  @UseGuards(AuthGuard)
  @Post('')
  async createProject(@Body() dto: CreateProjectDto, @Req() req: any) {
    try {
      const project = await firstValueFrom(
        this.projectService.send(
          { cmd: 'create-project' },
          {
            creatorId: req.user.id,
            data: dto,
          },
        ),
      );
      return {
        status: 200,
        data: project,
        message: 'Project created',
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('all')
  async getAllProjects() {
    const projects = await firstValueFrom(
      this.projectService.send({ cmd: 'get-all-projects' }, {}),
    );

    return {
      status: 200,
      data: projects,
      message: 'All projects retrieved',
    };
  }

  @UseGuards(AuthGuard)
  @Get('my')
  async getMyProjects(@User('id') userId: string) {
    const projects = await firstValueFrom(
      this.projectService.send(
        { cmd: 'get-user-projects' },
        {
          userId,
        },
      ),
    );

    return {
      status: 200,
      data: projects,
      message: 'Your projects retrieved',
    };
  }

  @UseGuards(AuthGuard)
  @Post('send-invite')
  async sendInvite(
    @User('id') senderId: string,
    @Body() body: Omit<SendInviteDto, 'senderId'>,
  ) {
    try {
      const invite = await firstValueFrom(
        this.projectService.send({ cmd: 'send-invite' }, { ...body, senderId }),
      );

      return {
        status: 201,
        data: invite,
        message: 'Invite sent successfully',
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('invites')
  async getAllInvites() {
    try {
      const invites = await firstValueFrom(
        this.projectService.send({ cmd: 'get-all-invites' }, {}),
      );

      return {
        status: 200,
        data: invites,
        message: 'All invites retrieved',
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('invites/all/:userId')
  async getUserInvites(@Param('userId') userId: string) {
    try {
      const invites = await firstValueFrom(
        this.projectService.send({ cmd: 'get-user-invites' }, { userId }),
      );

      return {
        status: 200,
        data: invites,
        message: 'User invites retrieved',
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Patch('invites/approve/:inviteId')
  async approveInvite(
    @Param('inviteId') inviteId: string,
    @User('id') userId: string,
  ) {
    try {
      const invite = await firstValueFrom(
        this.projectService.send(
          { cmd: 'approve-invite' },
          { inviteId, userId },
        ),
      );

      return {
        status: 200,
        data: invite,
        message: 'Invite approved',
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Patch('invites/decline/:inviteId')
  async declineInvite(
    @Param('inviteId') inviteId: string,
    @User('id') userId: string,
  ) {
    try {
      const invite = await firstValueFrom(
        this.projectService.send(
          { cmd: 'decline-invite' },
          { inviteId, userId },
        ),
      );

      return {
        status: 200,
        data: invite,
        message: 'Invite declined',
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('invites/pending')
  async getPendingInvites(@User('id') userId: string) {
    try {
      const invites = await firstValueFrom(
        this.projectService.send(
          { cmd: 'get-user-pending-invites' },
          { userId },
        ),
      );

      return {
        status: 200,
        data: invites,
        message: 'Pending invites retrieved',
      };
    } catch (error) {
      console.log('error', error);
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Patch('team/role')
  async updateTeamMemberRole(@Body() dto: UpdateTeamMemberRoleDto) {
    try {
      const updated = await firstValueFrom(
        this.projectService.send({ cmd: 'update-team-member-role' }, dto),
      );

      return {
        status: 200,
        data: updated,
        message: 'Team member role updated',
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Delete('team')
  async removeTeamMember(@Body() dto: RemoveTeamMemberDto) {
    try {
      const result = await firstValueFrom(
        this.projectService.send({ cmd: 'remove-team-member' }, dto),
      );

      return {
        status: 200,
        data: result,
        message: 'Team member removed',
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('team/projects/:projectId')
  async getProjectTeam(@Param('projectId') projectId: string) {
    try {
      const team = await firstValueFrom(
        this.projectService.send({ cmd: 'get-project-team' }, { projectId }),
      );

      return {
        status: 200,
        data: team,
        message: 'Project team retrieved',
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }
}
