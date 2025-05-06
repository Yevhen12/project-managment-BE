import {
  PROJECT_SERVICE,
  AuthGuard,
  DEFAULT_ERROR,
  CreateProjectDto,
  User,
} from '@/shared';
import {
  Controller,
  Inject,
  Get,
  UseGuards,
  Post,
  Body,
  Req,
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
  async createProject(
    @Body() dto: CreateProjectDto,
    @Req() req: any, // або кастомний декоратор типу @CurrentUser() if you have it
  ) {
    try {
      console.log({ dto, user: req.user });
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
}
