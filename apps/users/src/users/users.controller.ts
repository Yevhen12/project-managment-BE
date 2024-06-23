import { Controller, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserDto } from './dtos/CreateUserDto';
import { encode } from 'punycode';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'get-users' })
  createUser(@Payload() data: any) {
    return this.usersService.getUsers();
  }

  @MessagePattern({ cmd: 'create-user' })
  async register(user: CreateUserDto) {
    return this.usersService.create(user);
  }

  @MessagePattern({ cmd: 'verify-user' })
  async verifyUser(email: string, password: string) {
    return this.usersService.verifyUser(email, password);
  }

  @MessagePattern({ cmd: 'find-by-email' })
  async findByEmail(@Payload() payload: { email: string }) {
    console.log('IN find-by-email', payload.email);
    return this.usersService.findByEmail(payload.email);
  }
}
