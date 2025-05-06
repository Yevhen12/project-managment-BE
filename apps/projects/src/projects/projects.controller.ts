import { Controller, Get } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateProjectDto } from '@/shared';

@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @MessagePattern({ cmd: 'get-project' })
  getUser(@Payload() payload: { id: string }) {
    return this.projectsService.getProjectById(payload.id);
  }

  @MessagePattern({ cmd: 'create-project' })
  createProject(
    @Payload() payload: { creatorId: string; data: CreateProjectDto },
  ) {
    return this.projectsService.createProject(payload.data, payload.creatorId);
  }

  @MessagePattern({ cmd: 'get-all-projects' })
  getAllProjects() {
    return this.projectsService.getAllProjects();
  }

  @MessagePattern({ cmd: 'get-user-projects' })
  getUserProjects(@Payload() payload: { userId: string }) {
    return this.projectsService.getUserProjects(payload.userId);
  }
}
