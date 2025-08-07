import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CustomLogger } from '../../modules/logger/logger.service';
import { LOG_METADATA, LogOptions } from '../decorators/log.decorator';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(CustomLogger) private readonly logger: CustomLogger,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const logOptions = this.reflector.get<LogOptions>(
      LOG_METADATA,
      context.getHandler(),
    );

    if (!logOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Generate request ID if not present
    const requestId = (request.headers['x-request-id'] as string) || uuidv4();
    request.headers['x-request-id'] = requestId;
    response.setHeader('x-request-id', requestId);

    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    const startTime = Date.now();

    const logContext = {
      requestId,
      method,
      url,
      ip,
      userAgent,
      context: logOptions.context || context.getClass().name,
    };

    // Log incoming request
    if (logOptions.logRequest) {
      const requestLog = `Incoming ${method} ${url}`;

      const requestMeta: any = { ...logContext };

      if (logOptions.logHeaders) {
        requestMeta.headers = this.sanitizeObject(
          headers,
          logOptions.excludeFields,
        );
      }

      if (logOptions.logBody && request.body) {
        requestMeta.body = this.sanitizeObject(
          request.body,
          logOptions.excludeFields,
        );
      }

      this.logger.info(requestLog, requestMeta);
    }

    return next.handle().pipe(
      tap((data) => {
        if (logOptions.logResponse) {
          const responseTime = Date.now() - startTime;
          const { statusCode } = response;

          const responseLog = `Completed ${method} ${url} ${statusCode} - ${responseTime}ms`;

          const responseMeta: any = {
            ...logContext,
            statusCode,
            responseTime,
          };

          if (logOptions.logBody && data) {
            responseMeta.responseBody = this.sanitizeObject(
              data,
              logOptions.excludeFields,
            );
          }

          this.logger.info(responseLog, responseMeta);
        }
      }),
      catchError((error) => {
        const responseTime = Date.now() - startTime;
        const statusCode = error.status || 500;

        this.logger.error(
          `Failed ${method} ${url} ${statusCode} - ${responseTime}ms`,
          error,
          {
            ...logContext,
            statusCode,
            responseTime,
          },
        );

        throw error;
      }),
    );
  }

  private sanitizeObject(obj: any, excludeFields: string[] = []): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const sanitized = { ...obj };

    for (const field of excludeFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
