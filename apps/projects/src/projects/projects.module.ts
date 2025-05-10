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
  WorkLogEntity,
} from '@/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from '../tasks/tasks.service';
import { TaskRepository } from '@/shared/repositories/task.repository';
import { WorkLogRepository } from '@/shared/repositories/work-log.repository';
import { CommentRepository } from '@/shared/repositories/comment.repository';
import { SprintService } from '../sprints/sprints.service';
import { SprintRepository } from '@/shared/repositories/sprint.repository';
import { AttachmentRepository } from '@/shared/repositories/attachment.repository';
import { AwsS3Service } from '@/shared/services/aws-s3.service';

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
      WorkLogEntity,
    ]),
  ],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    TasksService,
    SprintService,
    AwsS3Service,
    // SprintCleanupService,
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
    {
      provide: 'TaskRepositiryInterface',
      useClass: TaskRepository,
    },
    {
      provide: 'WorkLogRepositiryInterface',
      useClass: WorkLogRepository,
    },
    {
      provide: 'CommentRepositiryInterface',
      useClass: CommentRepository,
    },
    {
      provide: 'SprintRepositiryInterface',
      useClass: SprintRepository,
    },
    {
      provide: 'AttachmentRepositiryInterface',
      useClass: AttachmentRepository,
    },
  ],
})
export class ProjectsModule {}
