import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { TurnstileService } from '../../modules/auth/services/turnstile.service';
import { REQUIRE_TURNSTILE_KEY } from '../decorators/require-turnstile.decorator';
import { ILogger } from 'src/modules/logger/logger.interface';
import { LoggerFactory } from 'src/modules/logger/logger.factory';
import { getClientIp } from '../utils/request.utils';

@Injectable()
export class TurnstileGuard implements CanActivate {
  private readonly logger: ILogger;

  constructor(
    private readonly reflector: Reflector,
    private readonly turnstileService: TurnstileService,
    private readonly loggerFactory: LoggerFactory,
  ) {
    this.logger = loggerFactory.createLogger(TurnstileGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireTurnstile = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_TURNSTILE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requireTurnstile) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const { turnstileToken } = request.body || {};
    const remoteIp = getClientIp(request);
    const userAgent = request.headers['user-agent'];
    const endpoint = `${request.method} ${request.path}`;

    this.logger.debug('Turnstile validation required', {
      endpoint,
      hasToken: !!turnstileToken,
      remoteIp,
      userAgent,
    });

    if (!turnstileToken) {
      throw new BadRequestException('Brak tokenu captcha');
    }

    const validationResult = await this.turnstileService.validateToken(
      turnstileToken,
      remoteIp || undefined,
    );

    if (!validationResult.isValid) {
      throw new BadRequestException('Weryfikacja captcha nie powiodła się');
    }

    this.logger.info('Turnstile validation successful', {
      endpoint,
      hostname: validationResult.hostname,
      action: validationResult.action,
      remoteIp,
      userAgent,
    });

    return true;
  }
}
