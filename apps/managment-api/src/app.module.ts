import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import {
  AUTH_SERVICE,
  PostgresDBModule,
  RmqModule,
  USERS_SERVICE,
  UserEntity,
} from '@/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [
    RmqModule.registerRmq(AUTH_SERVICE, process.env.RABBITMQ_AUTH_QUEUE),
    RmqModule.registerRmq(USERS_SERVICE, process.env.RABBITMQ_USERS_QUEUE),
    PostgresDBModule,
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [UsersController, AuthController],
})
export class AppModule {}
