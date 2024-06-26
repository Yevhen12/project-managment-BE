import { AuthGuard, USERS_SERVICE } from '@/shared';
import { Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(USERS_SERVICE) private readonly usersService: ClientProxy,
  ) {}

  @UseGuards(AuthGuard)
  @Get('getAll')
  async getUsers() {
    const users = await firstValueFrom(
      this.usersService.send(
        {
          cmd: 'get-users',
        },
        {
          users: [
            { id: '1', user: 'Yevhen' },
            { id: '2', user: 'Lys' },
          ],
        },
      ),
    );
    return {
      status: 200,
      data: users,
      message: 'Users recieved',
    };
  }

  @Post('')
  async createUser() {
    try {
      const newUser = await firstValueFrom(
        this.usersService.send(
          {
            cmd: 'create-user',
          },
          {
            firstName: 'test name',
            lastName: 'test last name',
            email: 'test@gmail.com',
            password: 'test password',
          },
        ),
      );

      return {
        status: 201,
        data: {
          user: newUser,
        },
        message: 'User created',
      };
    } catch (err) {
      console.log('err', err);
    }
  }
}
