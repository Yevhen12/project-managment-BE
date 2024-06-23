import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import {
  PostgresDBModule,
  RmqModule,
  USERS_SERVICE,
  UserEntity,
  UsersRepository,
} from '@/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtGuard } from './guards/auth-jwt.guard';
import { RefreshTokenStrategy } from './strategies/refresh.strategy';
import { RedisModule } from '@/shared/modules/redis.module';
import { JwtResfreshGuard } from './guards/refresh-jwt.guard';
// import { RefreshTokenStrategy } from './strategies/refresh.strategy';

@Module({
  imports: [
    RmqModule.registerRmq(USERS_SERVICE, process.env.RABBITMQ_USERS_QUEUE),
    PostgresDBModule,
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule,
    // ConfigModule.forRoot({
    //   isGlobal: true,
    //   validationSchema: Joi.object({
    //     JWT_SECRET: Joi.string().required(),
    //     JWT_EXPIRATION: Joi.string().required(),
    //   }),
    // }),
    JwtModule.register({}),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtGuard,
    JwtResfreshGuard,
    JwtStrategy,
    AuthService,
    ConfigService,
    RefreshTokenStrategy,
    {
      provide: 'UsersRepositoryInterface',
      useClass: UsersRepository,
    },
  ],
})
export class AuthModule {}
