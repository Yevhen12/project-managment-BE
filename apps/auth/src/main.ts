import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RABBITMQ_AUTH_QUEUE, RmqService, RpcExceptionFilter } from '@/shared';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  const configService = app.get(ConfigService);
  const sharedService = app.get(RmqService);

  const queue = configService.get(RABBITMQ_AUTH_QUEUE);

  app.connectMicroservice(sharedService.getRmqOptions(queue));

  app.use(cookieParser());
  app.useGlobalFilters(new RpcExceptionFilter());

  const PORT = process.env.PORT || 3002;
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  await app.listen(PORT, () => {
    console.log(`HTTP gateway server running on port ${PORT}`);
  });
  await app.startAllMicroservices();
}
bootstrap();
