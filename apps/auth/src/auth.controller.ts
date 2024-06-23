import { Controller, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserDto } from '../../../libs/shared/src/dtos/auth/CreateUser.dto';
import { LoginUserDto } from '../../../libs/shared/src/dtos/auth/LoginUser.dto';
import { JwtGuard } from './guards/auth-jwt.guard';
import { JwtResfreshGuard } from './guards/refresh-jwt.guard';
import { UserEntityWithoutPassword } from '@/shared';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'register' })
  register(@Payload() newUser: CreateUserDto) {
    console.log('newUser', newUser);
    return this.authService.register(newUser);
  }

  @MessagePattern({ cmd: 'login' })
  async login(@Payload() existingUser: LoginUserDto) {
    console.log('IN AUTH LOGIN', existingUser);
    return this.authService.login(existingUser);
  }

  @MessagePattern({ cmd: 'logout' })
  async logout(@Payload() { jwt }: { jwt: string }) {
    console.log('LOG OUT ACTION OCCUR', jwt);
    // return this.authService.login(jwt);
  }

  @MessagePattern({ cmd: 'verify-jwt' })
  @UseGuards(JwtGuard)
  async verifyJwt(@Payload() payload: { jwt: string }) {
    return this.authService.verifyJwt(payload.jwt);
  }

  @MessagePattern({ cmd: 'decode-jwt' })
  async decodeJwt(@Payload() payload: { jwt: string }) {
    return this.authService.getUserFromHeader(payload.jwt);
  }

  @MessagePattern({ cmd: 'refresh-token' })
  refreshTokens(
    @Payload()
    payload: {
      refreshToken: string;
      user: UserEntityWithoutPassword;
    },
  ) {
    console.log('ON auth service', payload);
    return this.authService.refreshAccessToken(
      payload.user,
      payload.refreshToken,
    );
  }

  @MessagePattern({ cmd: 'verify-refresh-jwt' })
  @UseGuards(JwtResfreshGuard)
  async verifyRefreshJwt(@Payload() payload: { jwtRefresh: string }) {
    console.log('jwtRefresh', payload.jwtRefresh);
    return this.authService.verifyRefreshJwt(payload.jwtRefresh);
  }
}
