import { Controller, Get } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateProjectDto,
  HandleInviteDto,
  RemoveTeamMemberDto,
  SendInviteDto,
  TaskEntity,
  UpdateTeamMemberRoleDto,
} from '@/shared';
import { CreateTaskDto } from '@/shared/dtos/projects/CreateTask.dto';
import { TasksService } from '../tasks/tasks.service';
import { UpdateTaskDto } from '@/shared/dtos/projects/UpdateTask.dto';
import { AddWorkLogDto } from '@/shared/dtos/projects/AddWorkLog.dto';
import { CreateSprintDto } from '@/shared/dtos/projects/CreateSprint.dto';
import { SprintService } from '../sprints/sprints.service';
import { UpdateSprintDto } from '@/shared/dtos/projects/UpdateSprint.dto';

@Controller()
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
    private readonly sprintsService: SprintService,
  ) {}

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

  @MessagePattern({ cmd: 'send-invite' })
  sendInvite(@Payload() dto: SendInviteDto) {
    return this.projectsService.sendInvite(dto);
  }

  @MessagePattern({ cmd: 'get-all-invites' })
  async getAllInvites() {
    return this.projectsService.getAllInvites();
  }

  @MessagePattern({ cmd: 'get-user-invites' })
  async getUserInvites(@Payload() payload: { userId: string }) {
    return this.projectsService.getUserInvites(payload.userId);
  }

  @MessagePattern({ cmd: 'approve-invite' })
  async approveInvite(@Payload() dto: HandleInviteDto) {
    return this.projectsService.approveInvite(dto);
  }

  @MessagePattern({ cmd: 'decline-invite' })
  async declineInvite(@Payload() dto: HandleInviteDto) {
    return this.projectsService.declineInvite(dto);
  }

  @MessagePattern({ cmd: 'get-user-pending-invites' })
  async getPendingInvitesForUser(@Payload() payload: { userId: string }) {
    return this.projectsService.getPendingInvitesForUser(payload.userId);
  }

  @MessagePattern({ cmd: 'update-team-member-role' })
  async updateTeamMemberRole(@Payload() dto: UpdateTeamMemberRoleDto) {
    return this.projectsService.updateTeamMemberRole(dto);
  }

  @MessagePattern({ cmd: 'remove-team-member' })
  async removeTeamMember(@Payload() dto: RemoveTeamMemberDto) {
    return this.projectsService.removeTeamMember(dto);
  }

  @MessagePattern({ cmd: 'get-project-team' })
  async getProjectTeam(@Payload() payload: { projectId: string }) {
    return this.projectsService.getProjectTeamMembers(payload.projectId);
  }

  @MessagePattern({ cmd: 'create-task' })
  async createTask(@Payload() dto: CreateTaskDto & { reporter: { id: any } }) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    return this.tasksService.createTask(dto);
  }

  @MessagePattern({ cmd: 'get-project-tasks' })
  async getAllTasksForProject(@Payload() data: { projectId: string }) {
    return this.tasksService.getAllTasksForProject(data.projectId);
  }

  @MessagePattern({ cmd: 'get-user-tasks' })
  async getUserTasksInProject(
    @Payload() data: { projectId: string; userId: string },
  ) {
    return this.tasksService.getUserTasksInProject(data.projectId, data.userId);
  }

  @MessagePattern({ cmd: 'update-task' })
  async updateTaskHandler(
    @Payload() data: UpdateTaskDto & { id: string; reporter: string },
  ) {
    return await this.tasksService.updateTask(data);
  }

  @MessagePattern({ cmd: 'delete-task' })
  async deleteTask(@Payload() data: { id: string }) {
    return this.tasksService.deleteTask(data.id);
  }

  @MessagePattern({ cmd: 'add-work-log' })
  async handleAddWorkLog(
    @Payload() data: { userId: string; dto: AddWorkLogDto },
  ) {
    return this.tasksService.addWorkLog(data.userId, data.dto);
  }

  @MessagePattern({ cmd: 'add-task-comment' })
  async handleAddComment(@Payload() payload: any): Promise<TaskEntity> {
    const { userId, taskId, content } = payload;
    return this.tasksService.addComment(userId, { taskId, content });
  }
  @MessagePattern({ cmd: 'get-task-comments' })
  async getTaskComments(@Payload() data: { taskId: string }) {
    return this.tasksService.getTaskComments(data.taskId);
  }

  @MessagePattern({ cmd: 'create-sprint' })
  async createSprint(@Payload() dto: CreateSprintDto) {
    return this.sprintsService.createSprint(dto);
  }

  @MessagePattern({ cmd: 'get-all-sprints' })
  async getAllSprints(@Payload() data: { projectId: string }) {
    return this.sprintsService.getAllSprintsForProject(data.projectId);
  }

  @MessagePattern({ cmd: 'get-active-sprint' })
  async getActiveSprint(@Payload() data: { projectId: string }) {
    return this.sprintsService.getActiveSprint(data.projectId);
  }

  @MessagePattern({ cmd: 'update-sprint' })
  async updateSprint(
    @Payload() data: { sprintId: string; dto: UpdateSprintDto },
  ) {
    return this.sprintsService.updateSprint(data.sprintId, data.dto);
  }

  @MessagePattern({ cmd: 'complete-sprint' })
  async completeSprint(@Payload() data: { sprintId: string }) {
    return this.sprintsService.completeSprintManually(data.sprintId);
  }

  @MessagePattern({ cmd: 'add-attachment' })
  async addAttachment(
    @Payload() data: { taskId: string; userId: string; file: any },
  ) {
    return this.tasksService.addAttachment(data.taskId, data.file, data.userId);
  }

  @MessagePattern({ cmd: 'delete-attachment' })
  async handleDeleteAttachment(
    @Payload() data: { attachmentId: string; userId: string },
  ): Promise<{ success: boolean; message: string }> {
    return this.tasksService.deleteAttachment(data.attachmentId, data.userId);
  }

  @MessagePattern({ cmd: 'get-task-attachments' })
  async handleGetTaskAttachments(@Payload() data: { taskId: string }) {
    return this.tasksService.getTaskAttachments(data.taskId);
  }
}
