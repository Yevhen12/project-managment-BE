import { Request } from 'express';
import { UserEntity } from '../entities/user.entity';

export interface UserRequest extends Request {
  user?: UserEntity;
}

export interface UserRefreshRequest extends Request {
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  refreshToken?: string;
}

export interface UserJwt extends UserRequest {
  iat: number;
  exp: number;
}

export type UserEntityWithoutPassword = Omit<UserEntity, 'password'>;
