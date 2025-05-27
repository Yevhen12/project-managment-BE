import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import {
  RmqModule,
  PROJECT_SERVICE,
  USERS_SERVICE,
  PostgresDBModule,
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
  PAYMENTS_SERVICE,
} from '@/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeService } from '../services/stripe.service';
import { StripeController } from '../controllers/stripe.controller';

@Module({
  imports: [
    RmqModule.registerRmq(
      PAYMENTS_SERVICE,
      process.env.RABBITMQ_PAYMENTS_QUEUE,
    ),
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
  controllers: [PaymentsController, StripeController],
  providers: [PaymentsService, StripeService],
})
export class PaymentsModule {}
