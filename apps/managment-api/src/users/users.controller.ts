import {
  AuthGuard,
  UpdateUserProfileDto,
  UserRequest,
  USERS_SERVICE,
} from '@/shared';
import {
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  Post,
  Req,
  UseGuards,
  Request,
} from '@nestjs/common';
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
        {},
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
          {},
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

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: UserRequest) {
    return req.user;
  }

  @UseGuards(AuthGuard)
  @Get('fullProfile')
  async getFullProfile(@Request() req: UserRequest) {
    const user = await firstValueFrom(
      this.usersService.send(
        { cmd: 'get-user' },
        {
          id: req.user.id,
        },
      ),
    );

    return {
      status: 200,
      data: user,
      message: 'User successfully recived',
    };
  }

  @UseGuards(AuthGuard)
  @Patch('profile')
  async updateProfile(@Body() dto: UpdateUserProfileDto, @Req() req: any) {
    const updatedUser = await firstValueFrom(
      this.usersService.send(
        { cmd: 'update-profile' },
        {
          id: req.user.id,
          data: dto,
        },
      ),
    );

    return {
      status: 200,
      data: updatedUser,
      message: 'User profile updated',
    };
  }
}
