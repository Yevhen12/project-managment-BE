import {
  PROJECT_SERVICE,
  AuthGuard,
  DEFAULT_ERROR,
  CreateProjectDto,
  User,
  SendInviteDto,
  RemoveTeamMemberDto,
  UpdateTeamMemberRoleDto,
  CreateTaskDto,
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
  Put,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RpcErrorToHttpException } from '../utils/rpc-exception.handler';
import { UpdateTaskDto } from '@/shared/dtos/projects/UpdateTask.dto';
import { AddWorkLogDto } from '@/shared/dtos/projects/AddWorkLog.dto';
import { AddCommentDto } from '@/shared/dtos/projects/AddComment.dto';
import { CreateSprintDto } from '@/shared/dtos/projects/CreateSprint.dto';
import { UpdateSprintDto } from '@/shared/dtos/projects/UpdateSprint.dto';
import { firstValueFrom } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('projects')
export class ProjectController {
  constructor(
    @Inject(PROJECT_SERVICE) private readonly projectService: ClientProxy,
  ) {}

  @UseGuards(AuthGuard)
  @Get('getOne/:projectId')
  async getProject(@Req() req: any, @Param('projectId') projectId: string) {
    const userId = req.user.id;

    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }

    const project = await firstValueFrom(
      this.projectService.send(
        { cmd: 'get-project' },
        { id: projectId, userId },
      ),
    );

    return {
      status: 200,
      data: project,
      message: 'Project retrieved',
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

  @UseGuards(AuthGuard)
  @Post('tasks')
  async createTask(@Body() dto: CreateTaskDto, @Req() req: any) {
    try {
      const tasks = await firstValueFrom(
        this.projectService.send(
          { cmd: 'create-task' },
          {
            ...dto,
            reporter: req.user.id,
          },
        ),
      );

      return {
        status: 201,
        data: tasks,
        message: 'Task created successfully',
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || 'Internal error');
    }
  }

  @UseGuards(AuthGuard)
  @Get('tasks/project/:projectId')
  async getAllTasks(@Param('projectId') projectId: string) {
    const tasks = await firstValueFrom(
      this.projectService.send({ cmd: 'get-project-tasks' }, { projectId }),
    );

    return {
      status: 200,
      data: tasks,
      message: 'All project tasks retrieved',
    };
  }

  @UseGuards(AuthGuard)
  @Get('tasks/project/:projectId/my')
  async getMyTasks(
    @Param('projectId') projectId: string,
    @User('id') userId: string,
  ) {
    const tasks = await firstValueFrom(
      this.projectService.send(
        { cmd: 'get-user-tasks' },
        { projectId, userId },
      ),
    );

    return {
      status: 200,
      data: tasks,
      message: 'Your tasks in project retrieved',
    };
  }

  @UseGuards(AuthGuard)
  @Patch('tasks/:id')
  async updateTask(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @Req() req: any,
  ) {
    try {
      const task = await firstValueFrom(
        this.projectService.send(
          { cmd: 'update-task' },
          { ...dto, id, reporter: req.user.id },
        ),
      );

      return {
        status: 200,
        data: task,
        message: 'Task updated successfully',
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('tasks/:id')
  async getTaskById(@Param('id') id: string) {
    try {
      const task = await firstValueFrom(
        this.projectService.send({ cmd: 'get-task' }, { id }),
      );

      return {
        status: 200,
        data: task,
        message: 'Task retrieved successfully',
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Delete('tasks/:id')
  async deleteTask(@Param('id') id: string) {
    try {
      const result = await firstValueFrom(
        this.projectService.send({ cmd: 'delete-task' }, { id }),
      );

      return {
        status: 200,
        data: result,
        message: 'Task deleted successfully',
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Post('tasks/work-log')
  async addWorkLog(@Body() dto: AddWorkLogDto, @Req() req: any) {
    try {
      const task = await firstValueFrom(
        this.projectService.send(
          { cmd: 'add-work-log' },
          { userId: req.user.id, dto },
        ),
      );

      return {
        status: 201,
        data: task,
        message: 'Work log added successfully',
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Post('tasks/comment')
  async addComment(@Body() dto: AddCommentDto, @Req() req: any) {
    try {
      const task = await await firstValueFrom(
        this.projectService.send(
          { cmd: 'add-task-comment' },
          { userId: req.user.id, ...dto },
        ),
      );

      return {
        status: 201,
        message: 'Comment added',
        data: task,
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('tasks/:id/comments')
  async getTaskComments(@Param('id') taskId: string) {
    try {
      const comments = await firstValueFrom(
        this.projectService.send({ cmd: 'get-task-comments' }, { taskId }),
      );

      return {
        status: 200,
        message: 'Task comments fetched',
        data: comments,
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Post('sprints')
  async createSprint(@Body() dto: CreateSprintDto, @Req() req: any) {
    try {
      const sprint = await firstValueFrom(
        this.projectService.send({ cmd: 'create-sprint' }, { ...dto }),
      );

      return {
        status: 201,
        data: sprint,
        message: 'Sprint created successfully',
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('sprints/:projectId')
  async getAllSprints(@Param('projectId') projectId: string) {
    try {
      const sprints = await firstValueFrom(
        this.projectService.send({ cmd: 'get-all-sprints' }, { projectId }),
      );

      return {
        status: 200,
        data: sprints,
        message: 'Sprints retrieved',
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('sprints/:projectId/active')
  async getActiveSprint(@Param('projectId') projectId: string) {
    try {
      const sprint = await firstValueFrom(
        this.projectService.send({ cmd: 'get-active-sprint' }, { projectId }),
      );

      return {
        status: 200,
        data: sprint,
        message: 'Active sprint retrieved',
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Put('sprints/:id')
  async updateSprint(
    @Param('id') sprintId: string,
    @Body() dto: UpdateSprintDto,
  ) {
    const sprint = await firstValueFrom(
      this.projectService.send({ cmd: 'update-sprint' }, { sprintId, dto }),
    );

    return {
      status: 200,
      data: sprint,
      message: 'Sprint updated successfully',
    };
  }

  @UseGuards(AuthGuard)
  @Post('sprints/:id/complete')
  async completeSprint(@Param('id') sprintId: string) {
    const sprint = await firstValueFrom(
      this.projectService.send({ cmd: 'complete-sprint' }, { sprintId }),
    );

    return {
      status: 200,
      data: sprint,
      message: 'Sprint completed successfully',
    };
  }

  @UseGuards(AuthGuard)
  @Post('tasks/:taskId/attachments')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachment(
    @Param('taskId') taskId: string,
    @UploadedFile() file: any,
    @Req() req: any,
  ) {
    try {
      console.log('FIRST CHHALLANGR', { taskId, file });
      const updatedTask = await firstValueFrom(
        this.projectService.send(
          { cmd: 'add-attachment' },
          { taskId, userId: req.user.id, file },
        ),
      );

      return {
        status: 201,
        message: 'Attachment uploaded successfully',
        data: updatedTask,
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Delete('tasks/attachments/:id')
  async deleteAttachment(@Param('id') id: string, @Req() req: any) {
    try {
      await firstValueFrom(
        this.projectService.send(
          { cmd: 'delete-attachment' },
          { attachmentId: id, userId: req.user.id },
        ),
      );

      return {
        status: 200,
        message: 'Attachment deleted successfully',
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('tasks/:taskId/attachments')
  async getTaskAttachments(@Param('taskId') taskId: string) {
    try {
      const attachments = await firstValueFrom(
        this.projectService.send({ cmd: 'get-task-attachments' }, { taskId }),
      );

      return {
        status: 200,
        data: attachments,
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }
}
