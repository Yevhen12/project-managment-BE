import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { AUTH_SERVICE } from '../constants/proxy.services';

@Injectable()
export class RefreshAuthGuard implements CanActivate {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const jwtRefresh = this.extractTokenFromHeader(request);

    console.log('jwtRefresh ON GUARD', jwtRefresh);

    try {
      const { user, exp } = await lastValueFrom(
        this.authService.send({ cmd: 'verify-refresh-jwt' }, { jwtRefresh }),
      );

      if (!user || !exp) return false;

      const TOKEN_EXP_MS = exp * 1000;
      const isJwtValid = Date.now() < TOKEN_EXP_MS;

      if (!isJwtValid) return false;

      request['user'] = user;
      request['refreshToken'] = jwtRefresh;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
