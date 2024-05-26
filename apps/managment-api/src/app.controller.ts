import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    // @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('USERS_SERVICE') private readonly usersService: ClientProxy,
  ) {}

  @Get('users')
  async getUsers() {
    console.log('test');
    return this.usersService.send(
      {
        cmd: 'get-users',
      },
      {
        users: [
          { id: '1', user: 'Yevhen' },
          { id: '2', user: 'Lys' },
        ],
      },
    );
  }
}
