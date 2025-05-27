import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { RABBITMQ_PAYMENTS_QUEUE, RmqService } from '@/shared';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { PaymentsModule } from './payments/payments.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(PaymentsModule, {
    bodyParser: false, // ❗️ додано
  });

  app.use('/stripe/webhook', express.raw({ type: 'application/json' })); // має бути після bodyParser: false
  app.enableCors();

  const configService = app.get(ConfigService);
  const sharedService = app.get(RmqService);
  const queue = configService.get(RABBITMQ_PAYMENTS_QUEUE);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.connectMicroservice(sharedService.getRmqOptions(queue));
  app.use(cookieParser());

  await app.startAllMicroservices();
  await app.listen(3004);
}
bootstrap();
