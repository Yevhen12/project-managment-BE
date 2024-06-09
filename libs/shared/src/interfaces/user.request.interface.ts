import { Request } from 'express';

export interface UserRequest extends Request {
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface UserJwt extends UserRequest {
  iat: number;
  exp: number;
}
