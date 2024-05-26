import { NestFactory } from '@nestjs/core';
import { UsersModule } from './users.module';
import { ConfigService } from '@nestjs/config';
import { RmqService } from '@/shared';

async function bootstrap() {
  const app = await NestFactory.create(UsersModule);
  app.enableCors();

  const configService = app.get(ConfigService);
  const sharedService = app.get(RmqService);

  const queue = configService.get('RABBITMQ_USERS_QUEUE');

  app.connectMicroservice(sharedService.getRmqOptions(queue));
  await app.startAllMicroservices();

  await app.listen(3001);
}
bootstrap();
