import { Controller, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserDto } from '../../../libs/shared/src/dtos/auth/CreateUser.dto';
import { LoginUserDto } from '../../../libs/shared/src/dtos/auth/LoginUser.dto';
import { JwtGuard } from './guards/auth-jwt.guard';

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

  @MessagePattern({ cmd: 'verify-jwt' })
  @UseGuards(JwtGuard)
  async verifyJwt(@Payload() payload: { jwt: string }) {
    return this.authService.verifyJwt(payload.jwt);
  }

  @MessagePattern({ cmd: 'decode-jwt' })
  async decodeJwt(@Payload() payload: { jwt: string }) {
    return this.authService.getUserFromHeader(payload.jwt);
  }
}
