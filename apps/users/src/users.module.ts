import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RmqModule } from '@/shared';

@Module({
  imports: [
    RmqModule.registerRmq('USERS_SERVICE', process.env.RABBITMQ_USERS_QUEUE),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
