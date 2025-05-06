import {
  USERS_SERVICE,
  UserEntity,
  UserEntityWithoutPassword,
  UserJwt,
  UserRepositoryInterface,
} from '@/shared';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../../../libs/shared/src/dtos/auth/CreateUser.dto';
import { LoginUserDto } from '../../../libs/shared/src/dtos/auth/LoginUser.dto';
import { ConfigService } from '@nestjs/config';
import {
  LoginResponse,
  RegisterResponse,
  Tokens,
} from './types/auth.interfaces';
import { RedisCacheService } from '@/shared/services/redis.service';
import { AUTH_REFRESH_TOKEN_PREFIX } from '@/shared/constants/redis';
import { APPLICATION_ROLES } from '@/shared/constants/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('UsersRepositoryInterface')
    private readonly usersRepository: UserRepositoryInterface,
    @Inject(USERS_SERVICE) private readonly usersService: ClientProxy,
    private readonly configService: ConfigService,
    private readonly redisService: RedisCacheService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async register(newUser: Readonly<CreateUserDto>): Promise<RegisterResponse> {
    const { firstName, lastName, email, password } = newUser;

    const existingUser = await firstValueFrom(
      this.usersService.send(
        {
          cmd: 'find-by-email',
        },
        {
          email,
        },
      ),
    );

    if (existingUser) {
      throw new RpcException(
        new ConflictException('An account with that email already exists!'),
      );
    }

    const hashedPassword = await this.hashPassword(password);

    const savedUser = await this.usersRepository.save({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    delete savedUser.password;

    const tokens = await this.getTokens(savedUser);
    const redisKey = `${AUTH_REFRESH_TOKEN_PREFIX}${savedUser.id}`;

    await this.redisService.set(redisKey, tokens.refreshToken);

    return { user: savedUser, tokens };
  }

  async doesPasswordMatch(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await firstValueFrom(
      this.usersService.send(
        {
          cmd: 'find-by-email',
        },
        {
          email,
        },
      ),
    );

    const doesUserExist = !!user;

    if (!doesUserExist) return null;

    const doesPasswordMatch = await this.doesPasswordMatch(
      password,
      user.password,
    );

    if (!doesPasswordMatch) return null;

    return user;
  }

  async login(existingUser: Readonly<LoginUserDto>): Promise<LoginResponse> {
    const { email, password } = existingUser;
    const user = await this.validateUser(email, password);

    console.log('test', user);

    if (!user) {
      throw new RpcException(new BadRequestException('Bad credentials'));
    }

    delete user.password;

    const tokens = await this.getTokens(user);
    const redisKey = `${AUTH_REFRESH_TOKEN_PREFIX}${user.id}`;

    await this.redisService.set(redisKey, tokens.refreshToken);

    return { tokens: tokens, user };
  }

  async logout(userId: string) {
    const redisKey = `${AUTH_REFRESH_TOKEN_PREFIX}${userId}`;
    return await this.redisService.del(redisKey);
  }

  async verifyJwt(
    jwt: string,
  ): Promise<{ user: UserEntityWithoutPassword; exp: number }> {
    if (!jwt) {
      throw new RpcException(new UnauthorizedException());
    }

    try {
      const { user, exp } = await this.jwtService.verifyAsync(jwt, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return { user, exp };
    } catch (error) {
      throw new RpcException(new UnauthorizedException());
    }
  }

  async verifyRefreshJwt(
    jwt: string,
  ): Promise<{ user: UserEntityWithoutPassword; exp: number }> {
    if (!jwt) {
      throw new RpcException(new UnauthorizedException());
    }

    try {
      const { user, exp } = await this.jwtService.verifyAsync(jwt, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      return { user, exp };
    } catch (error) {
      throw new RpcException(new UnauthorizedException());
    }
  }

  async getUserFromHeader(jwt: string): Promise<UserJwt> {
    if (!jwt) return;

    try {
      return this.jwtService.decode(jwt) as UserJwt;
    } catch (error) {
      throw new RpcException(new BadRequestException());
    }
  }

  async getTokens(user: UserEntity): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          user,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: `${this.configService.get<string>('JWT_EXPIRATION')}s`,
        },
      ),
      this.jwtService.signAsync(
        {
          user,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: `${this.configService.get<string>(
            'JWT_REFRESH_EXPIRATION',
          )}s`,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  hashData(data: string) {
    return bcrypt.hash(data, 12);
  }

  async refreshAccessToken(
    user: UserEntityWithoutPassword,
    refreshToken: string,
  ) {
    const refreshTokensMatch = this.isRefreshTokensMatches(
      +user.id,
      refreshToken,
    );
    if (!refreshTokensMatch) throw new RpcException(new ForbiddenException());
    const userFromHeader = (await this.getUserFromHeader(refreshToken)).user;
    if (!userFromHeader) {
      throw new RpcException(new BadRequestException());
    }

    const newAccessToken = await this.generateNewAccessToken(userFromHeader);
    return newAccessToken;
  }

  async getRedisRefreshToken(userId: string) {
    const redisKey = `${AUTH_REFRESH_TOKEN_PREFIX}${userId}`;
    return await this.redisService.get(redisKey);
  }

  async isRefreshTokensMatches(
    userId: number,
    refreshToken: string,
  ): Promise<boolean> {
    const refreshTokenFromRedis = await this.getRedisRefreshToken(`${userId}`);
    return refreshTokenFromRedis === refreshToken;
  }

  async generateNewAccessToken(user: UserEntityWithoutPassword) {
    const newToken = await this.jwtService.signAsync(
      {
        user,
      },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: `${this.configService.get<string>('JWT_EXPIRATION')}s`,
      },
    );

    return newToken;
  }
}
