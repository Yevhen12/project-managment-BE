import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PostgresDBModule, RmqModule, UserEntity } from '@/shared';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    RmqModule.registerRmq('USERS_SERVICE', process.env.RABBITMQ_USERS_QUEUE),
    PostgresDBModule,
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
