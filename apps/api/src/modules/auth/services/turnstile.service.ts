import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerFactory } from 'src/modules/logger/logger.factory';
import { ILogger } from 'src/modules/logger/logger.interface';

export interface TurnstileVerificationResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

export interface TurnstileValidationResult {
  isValid: boolean;
  errorCodes?: string[];
  hostname?: string;
  action?: string;
}

@Injectable()
export class TurnstileService {
  private readonly logger: ILogger;

  private readonly secretKey: string;
  private readonly endpoint: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly loggerFactory: LoggerFactory,
  ) {
    this.logger = this.loggerFactory.createLogger(TurnstileService.name);

    this.secretKey = this.configService.getOrThrow<string>(
      'TURNSTILE_SECRET_KEY',
    );
    this.endpoint = this.configService.getOrThrow<string>('TURNSTILE_ENDPOINT');
  }

  async validateToken(
    token: string,
    remoteIp?: string,
  ): Promise<TurnstileValidationResult> {
    const startTime = Date.now();

    try {
      this.logger.debug('Starting Turnstile token validation', {
        tokenLength: token?.length,
        remoteIp,
        endpoint: this.endpoint,
      });

      if (!token || token.trim() === '') {
        this.logger.warn('Empty or missing Turnstile token provided');
        return {
          isValid: false,
          errorCodes: ['Missing token'],
        };
      }

      const formData = new URLSearchParams();
      formData.append('secret', this.secretKey);
      formData.append('response', token);

      if (remoteIp) {
        formData.append('remoteip', remoteIp);
      }

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        this.logger.warn('Turnstile API request failed', undefined, {
          status: response.status,
          statusText: response.statusText,
          url: this.endpoint,
        });

        return {
          isValid: false,
          errorCodes: [
            'An error occurred during captcha response verification',
          ],
        };
      }

      const data: TurnstileVerificationResponse = await response.json();
      const duration = Date.now() - startTime;

      if (data.success) {
        this.logger.info('Turnstile token validation successful', {
          hostname: data.hostname,
          action: data.action,
          duration: `${duration}ms`,
          remoteIp,
        });

        return {
          isValid: true,
          hostname: data.hostname,
          action: data.action,
        };
      } else {
        this.logger.warn('Turnstile validation failed', {
          errorCodes: data['error-codes'],
          hostname: data.hostname,
          duration: `${duration}ms`,
          remoteIp,
        });

        return {
          isValid: false,
          errorCodes: data['error-codes'],
          hostname: data.hostname,
        };
      }
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error('Turnstile validation error', {
        duration: `${duration}ms`,
        remoteIp,
        error,
      });

      return {
        isValid: false,
        errorCodes: ['An error occurred during token verification'],
      };
    }
  }
}
