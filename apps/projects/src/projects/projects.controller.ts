import { Controller, Get } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateProjectDto,
  HandleInviteDto,
  RemoveTeamMemberDto,
  SendInviteDto,
  UpdateTeamMemberRoleDto,
} from '@/shared';

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
}
