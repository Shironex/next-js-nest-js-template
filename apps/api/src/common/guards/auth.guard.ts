import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionCookieService } from '../../modules/auth/services/session/sessionCookie.service';
import { SessionValidatorService } from '../../modules/auth/services/session/sessionValidator.service';
import { AuthRequest } from '../interfaces/auth-request.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly sessionValidatorService: SessionValidatorService,
    private readonly sessionCookieService: SessionCookieService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const cookieName = this.sessionCookieService.getCookieName();
    const sessionId = request.cookies[cookieName];

    if (!sessionId) {
      throw new UnauthorizedException();
    }

    const result = await this.sessionValidatorService.validate(sessionId);

    if (!result.session) {
      throw new UnauthorizedException();
    }

    // Attach user to request
    request.user = result.user;
    request.session = result.session;

    return true;
  }
}
