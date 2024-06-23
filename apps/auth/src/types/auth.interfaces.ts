import { UserEntity } from '@/shared';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: UserEntity;
  tokens: Tokens;
}

export interface LoginResponse {
  user: UserEntity;
  tokens: Tokens;
}
