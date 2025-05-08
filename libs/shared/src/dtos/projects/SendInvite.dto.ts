import { PROJECT_ROLES } from '@/shared/constants/enums';

export class SendInviteDto {
  email: string;
  role: PROJECT_ROLES;
  projectId: string;
  senderId: string; // Беремо з JWT (AuthGuard)
}
