import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import {
  AttachmentEntity,
  CommentEntity,
  InviteEntity,
  InviteRepositiry,
  LabelEntity,
  PostgresDBModule,
  PROJECT_SERVICE,
  ProjectEntity,
  ProjectRepository,
  RmqModule,
  SprintEntity,
  TaskEntity,
  TeamMemberEntity,
  TeamMemberRepository,
  UserEntity,
  USERS_SERVICE,
} from '@/shared';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    RmqModule.registerRmq(PROJECT_SERVICE, process.env.RABBITMQ_PROJECTS_QUEUE),
    RmqModule.registerRmq(USERS_SERVICE, process.env.RABBITMQ_USERS_QUEUE),
    PostgresDBModule,
    TypeOrmModule.forFeature([
      UserEntity,
      TaskEntity,
      ProjectEntity,
      CommentEntity,
      SprintEntity,
      AttachmentEntity,
      LabelEntity,
      TeamMemberEntity,
      InviteEntity,
    ]),
  ],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    {
      provide: 'ProjectRepositoryInterface',
      useClass: ProjectRepository,
    },
    {
      provide: 'TeamMemberRepositoryInterface',
      useClass: TeamMemberRepository,
    },
    {
      provide: 'InviteRepositiryInterface',
      useClass: InviteRepositiry,
    },
  ],
})
export class ProjectsModule {}
