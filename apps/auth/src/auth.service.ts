import {
  USERS_SERVICE,
  UserEntity,
  UserJwt,
  UserRepositoryInterface,
} from '@/shared';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../../../libs/shared/src/dtos/auth/CreateUser.dto';
import { firstValueFrom } from 'rxjs';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { LoginUserDto } from '../../../libs/shared/src/dtos/auth/LoginUser.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('UsersRepositoryInterface')
    private readonly usersRepository: UserRepositoryInterface,
    @Inject(USERS_SERVICE) private readonly usersService: ClientProxy,
  ) {}
  getHello(): string {
    return 'Hello World!!!!!';
  }
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async register(newUser: Readonly<CreateUserDto>): Promise<UserEntity> {
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

    console.log('existingUser', existingUser);

    if (existingUser) {
      throw new RpcException(
        new ConflictException('An account with that email already exists!'),
      );
    }

    const hashedPassword = await this.hashPassword(password);

    console.log('newUser', newUser);

    const savedUser = await this.usersRepository.save({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    delete savedUser.password;
    return savedUser;
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

  async login(existingUser: Readonly<LoginUserDto>) {
    const { email, password } = existingUser;
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new RpcException(new UnauthorizedException());
    }

    delete user.password;

    const jwt = await this.jwtService.signAsync({ user });

    return { token: jwt, user };
  }

  async verifyJwt(jwt: string): Promise<{ user: UserEntity; exp: number }> {
    if (!jwt) {
      throw new UnauthorizedException();
    }

    try {
      const { user, exp } = await this.jwtService.verifyAsync(jwt);
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
      throw new BadRequestException();
    }
  }
}
