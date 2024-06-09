import { NestFactory } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { ConfigService } from '@nestjs/config';
import { RABBITMQ_USERS_QUEUE, RmqService } from '@/shared';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(UsersModule);
  app.enableCors();

  const configService = app.get(ConfigService);
  const sharedService = app.get(RmqService);

  const queue = configService.get(RABBITMQ_USERS_QUEUE);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.connectMicroservice(sharedService.getRmqOptions(queue));

  app.use(cookieParser());

  await app.startAllMicroservices();

  await app.listen(3001);
}
bootstrap();
