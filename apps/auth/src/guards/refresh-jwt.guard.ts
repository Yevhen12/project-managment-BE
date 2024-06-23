import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtResfreshGuard extends AuthGuard('jwt-refresh') {}
