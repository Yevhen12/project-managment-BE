import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {
  AttachmentEntity,
  CommentEntity,
  LabelEntity,
  PostgresDBModule,
  ProjectEntity,
  RmqModule,
  SprintEntity,
  TaskEntity,
  UserEntity,
  USERS_SERVICE,
  UsersRepository,
  TeamMemberEntity,
  InviteEntity,
  WorkLogEntity,
} from '@/shared';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
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
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'UsersRepositoryInterface',
      useClass: UsersRepository,
    },
  ],
})
export class UsersModule {}
