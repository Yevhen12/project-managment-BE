import { PROJECT_ROLES } from '@/shared/constants/enums';

export class UpdateTeamMemberRoleDto {
  userId: string;
  projectId: string;
  newRole: PROJECT_ROLES;
}
