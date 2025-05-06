import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import {
  AttachmentEntity,
  CommentEntity,
  InviteEntity,
  LabelEntity,
  PostgresDBModule,
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
    RmqModule.registerRmq(USERS_SERVICE, process.env.RABBITMQ_PROJECTS_QUEUE),
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
  ],
})
export class ProjectsModule {}
