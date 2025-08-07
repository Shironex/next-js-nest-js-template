import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cookie } from 'src/common/interfaces/auth';
import { LoggerFactory } from 'src/modules/logger/logger.factory';
import { ILogger } from 'src/modules/logger/logger.interface';

@Injectable()
export class SessionCookieService {
  private readonly logger: ILogger;

  private readonly cookieName: string;
  private readonly domain: string;
  private readonly isProduction: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly loggerFactory: LoggerFactory,
  ) {
    this.logger = this.loggerFactory.createLogger(SessionCookieService.name);
    this.cookieName = this.configService.getOrThrow<string>(
      'SESSION_COOKIE_NAME',
    );
    this.domain = this.configService.getOrThrow<string>('API_DOMAIN');
    this.isProduction =
      this.configService.getOrThrow('NODE_ENV') === 'production';
  }

  public create(sessionId: string): Cookie {
    const duration = this.configService.getOrThrow<number>(
      'SESSION_DURATION_DAYS',
    );
    const expiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);

    this.logger.debug('Creating session cookie', {
      sessionId,
      expiresAt,
      domain: this.domain,
      secure: this.isProduction,
    });

    const cookie = {
      name: this.cookieName,
      value: sessionId,
      attributes: {
        expires: expiresAt,
        httpOnly: true,
        path: '/',
        domain: this.domain,
        secure: this.isProduction,
        sameSite: 'lax' as const,
      },
    };

    this.logger.debug('Session cookie created', {
      cookieName: this.cookieName,
      sessionId,
      expiresAt,
    });

    return cookie;
  }

  public createBlank(): Cookie {
    this.logger.debug('Creating blank session cookie for logout', {
      cookieName: this.cookieName,
      domain: this.domain,
    });

    const cookie = {
      name: this.cookieName,
      value: '',
      attributes: {
        expires: new Date(0),
        maxAge: 0,
        httpOnly: true,
        path: '/',
        domain: this.domain,
        secure: this.isProduction,
        sameSite: 'lax' as const,
      },
    };

    this.logger.debug('Blank session cookie created for logout');

    return cookie;
  }

  public getCookieName(): string {
    return this.cookieName;
  }
}
