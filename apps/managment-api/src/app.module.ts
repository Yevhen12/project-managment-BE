import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PostgresDBModule, RmqModule, UserEntity } from '@/shared';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // RmqModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
    RmqModule.registerRmq('USERS_SERVICE', process.env.RABBITMQ_USERS_QUEUE),
    PostgresDBModule,
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [AppController],
})
export class AppModule {}
