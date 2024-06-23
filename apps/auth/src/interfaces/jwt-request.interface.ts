import { Request } from 'express';

export interface JwtRequest extends Request {
  jwt?: string;
}

export interface JwtRefreshRequest extends Request {
  jwtRefresh?: string;
}
