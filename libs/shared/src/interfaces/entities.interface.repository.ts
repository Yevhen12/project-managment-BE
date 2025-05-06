import { BaseInterfaceRepository } from './base.interface.repository';
import { UserEntity } from '../entities/user.entity';
import { ProjectEntity } from '../entities/project.entity';
import { TeamMemberEntity } from '../entities/team-member.entity';

export interface UserRepositoryInterface
  extends BaseInterfaceRepository<UserEntity> {}

export interface ProjectRepositoryInterface
  extends BaseInterfaceRepository<ProjectEntity> {}

export interface TeamMemberRepositoryInterface
  extends BaseInterfaceRepository<TeamMemberEntity> {}
