import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import {
  AttachmentEntity,
  AUTH_SERVICE,
  CommentEntity,
  LabelEntity,
  PostgresDBModule,
  ProjectEntity,
  RmqModule,
  SprintEntity,
  TaskEntity,
  UserEntity,
  USERS_SERVICE,
  TeamMemberEntity,
  InviteEntity,
  PROJECT_SERVICE,
  WorkLogEntity,
  PAYMENTS_SERVICE,
} from '@/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth/auth.controller';
import { ProjectController } from './projects/projects.controller';
import { PaymentsController } from './payments/payments.controller';

@Module({
  imports: [
    RmqModule.registerRmq(AUTH_SERVICE, process.env.RABBITMQ_AUTH_QUEUE),
    RmqModule.registerRmq(USERS_SERVICE, process.env.RABBITMQ_USERS_QUEUE),
    RmqModule.registerRmq(PROJECT_SERVICE, process.env.RABBITMQ_PROJECTS_QUEUE),
    RmqModule.registerRmq(
      PAYMENTS_SERVICE,
      process.env.RABBITMQ_PAYMENTS_QUEUE,
    ),
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
  controllers: [
    UsersController,
    AuthController,
    ProjectController,
    PaymentsController,
  ],
})
export class AppModule {}
