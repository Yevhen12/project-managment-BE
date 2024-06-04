import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserEntity } from '@/shared';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  @MessagePattern({ cmd: 'get-users' })
  createUser(@Payload() data: any) {
    console.log('IN USER', data);
    return data;
  }
  @MessagePattern({ cmd: 'create-user' })
  async register(newUser: Readonly<any>): Promise<any> {
    console.log('newUser', newUser);
    const { firstName, lastName, email, password } = newUser;

    const savedUser = await this.userRepository.save({
      firstName,
      lastName,
      email,
      password,
    });

    console.log('savedUser', savedUser);

    delete savedUser.password;
    return savedUser;
  }
}
