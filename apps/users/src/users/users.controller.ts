import { Controller, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserDto } from './dtos/CreateUserDto';
import { encode } from 'punycode';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserProfileDto } from '@/shared';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'get-users' })
  getUsers(@Payload() data: any) {
    return this.usersService.getUsers();
  }

  @MessagePattern({ cmd: 'get-user' })
  getUser(@Payload() payload: { id: string }) {
    return this.usersService.getUser(payload.id);
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

  @MessagePattern({ cmd: 'update-profile' })
  async updateProfile(
    @Payload() payload: { id: string; data: UpdateUserProfileDto },
  ) {
    return this.usersService.updateProfile(payload.id, payload.data);
  }
}
