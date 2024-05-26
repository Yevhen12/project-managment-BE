import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { RmqModule } from '@/shared';

@Module({
  imports: [
    // RmqModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
    RmqModule.registerRmq('USERS_SERVICE', process.env.RABBITMQ_USERS_QUEUE),
  ],
  controllers: [AppController],
})
export class AppModule {}
