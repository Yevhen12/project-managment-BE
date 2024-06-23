import {
  AUTH_SERVICE,
  AuthGuard,
  CreateUserDto,
  DEFAULT_ERROR,
  LoginUserDto,
  UserRefreshRequest,
  UserRequest,
} from '@/shared';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RpcErrorToHttpException } from '../utils/rpc-exception.handler';
import { RefreshAuthGuard } from '@/shared/guards/refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: ClientProxy,
  ) {}

  @Get('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() user: LoginUserDto) {
    try {
      const response = await firstValueFrom(
        this.authService.send(
          {
            cmd: 'login',
          },
          {
            ...user,
          },
        ),
      );

      return {
        message: 'User successfully logged in!',
        status: HttpStatus.OK,
        data: response,
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() user: CreateUserDto) {
    try {
      const response = await firstValueFrom(
        this.authService.send(
          {
            cmd: 'register',
          },
          {
            ...user,
          },
        ),
      );

      return {
        message: 'User created',
        status: HttpStatus.CREATED,
        data: response,
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: UserRequest) {
    return req.user;
  }

  @UseGuards(RefreshAuthGuard)
  @Get('refreshToken')
  async refreshToken(@Request() req: UserRefreshRequest) {
    console.log('req.user', req.user);
    console.log('req.refreshToken', req.refreshToken);
    try {
      const response = await firstValueFrom(
        this.authService.send(
          {
            cmd: 'refresh-token',
          },
          {
            user: req.user,
            refreshToken: req.refreshToken,
          },
        ),
      );

      console.log('response', response);

      return {
        message: 'Token refreshed',
        status: HttpStatus.CREATED,
        data: response,
      };
    } catch (error) {
      throw new RpcErrorToHttpException(error.response || DEFAULT_ERROR);
    }
  }
}
