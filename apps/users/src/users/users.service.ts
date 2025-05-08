import {
  UpdateUserProfileDto,
  UserEntity,
  UserRepositoryInterface,
} from '@/shared';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dtos/CreateUserDto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('UsersRepositoryInterface')
    private readonly usersRepository: UserRepositoryInterface,
  ) {}

  async getUsers(): Promise<Partial<UserEntity>[]> {
    const users = await this.usersRepository.findAll({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        bio: true,
        isActive: true,
      },
    });

    return users;
  }

  async getUserById(id: string): Promise<UserEntity> {
    return await this.usersRepository.findOneById(id);
  }

  async findByEmail(email: string): Promise<UserEntity> {
    return this.usersRepository.findByCondition({
      where: { email },
      select: ['id', 'firstName', 'lastName', 'email', 'password', 'isActive'],
    });
  }

  async findById(id: string): Promise<UserEntity> {
    return this.usersRepository.findOneById(id);
  }

  async create(newUser: Readonly<CreateUserDto>): Promise<any> {
    const { firstName, lastName, email, password } = newUser;

    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('An account with that email already exists!');
    }

    const savedUser = await this.usersRepository.save({
      firstName,
      lastName,
      email,
      password: await bcrypt.hash(newUser.password, 10),
    });

    delete savedUser.password;
    return savedUser;
  }

  async verifyUser(email: string, password: string) {
    const user = await this.usersRepository.findByCondition({
      where: { email },
    });
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async updateProfile(
    id: string,
    data: UpdateUserProfileDto,
  ): Promise<UserEntity> {
    await this.usersRepository.update(id, data);
    return this.usersRepository.findOneById(id); // повертаємо оновлений профіль
  }

  async getUser(id: string): Promise<Partial<UserEntity>> {
    const user = await this.usersRepository.findByCondition({
      where: { id },
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'phone',
        'avatarUrl',
        'bio',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
