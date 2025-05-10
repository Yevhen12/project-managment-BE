import { BaseInterfaceRepository } from './base.interface.repository';
import { UserEntity } from '../entities/user.entity';
import { ProjectEntity } from '../entities/project.entity';
import { TeamMemberEntity } from '../entities/team-member.entity';
import { InviteEntity } from '../entities/invite.entity';
import { TaskEntity } from '../entities/task.entity';
import { WorkLogEntity } from '../entities/work-log.entity';
import { CommentEntity } from '../entities/comment.entity';
import { SprintEntity } from '../entities/sprint.entity';
import { AttachmentEntity } from '../entities/attachment.entity';

export interface UserRepositoryInterface
  extends BaseInterfaceRepository<UserEntity> {}

export interface ProjectRepositoryInterface
  extends BaseInterfaceRepository<ProjectEntity> {}

export interface TeamMemberRepositoryInterface
  extends BaseInterfaceRepository<TeamMemberEntity> {}

export interface InviteRepositoryInterface
  extends BaseInterfaceRepository<InviteEntity> {}

export interface TaskRepositoryInterface
  extends BaseInterfaceRepository<TaskEntity> {}

export interface WorkLogRepositoryInterface
  extends BaseInterfaceRepository<WorkLogEntity> {}

export interface CommentRepositoryInterface
  extends BaseInterfaceRepository<CommentEntity> {}

export interface SprintRepositoryInterface
  extends BaseInterfaceRepository<SprintEntity> {}

export interface AttachmentRepositoryInterface
  extends BaseInterfaceRepository<AttachmentEntity> {}
