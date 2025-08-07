import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Request } from 'express';
import { SessionTokenService } from './sessionToken.service';
import { SessionCookieService } from './sessionCookie.service';
import { SessionValidatorService } from './sessionValidator.service';
import { Cookie, SessionResponse } from 'src/common/interfaces/auth';
import { LoggerFactory } from 'src/modules/logger/logger.factory';
import { ILogger } from 'src/modules/logger/logger.interface';

export type SessionValidationResult =
  | SessionResponse
  | { session: null; user: null };

@Injectable()
export class SessionService {
  private readonly logger: ILogger;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly sessionTokenService: SessionTokenService,
    private readonly sessionCookieService: SessionCookieService,
    private readonly sessionValidatorService: SessionValidatorService,
    private readonly loggerFactory: LoggerFactory,
  ) {
    this.logger = this.loggerFactory.createLogger(SessionService.name);
  }

  async createSession(userId: string, request: Request): Promise<Cookie> {
    const token = this.sessionTokenService.generateToken();
    const sessionId = this.sessionTokenService.hashToken(token);
    const metadata = this.sessionTokenService.extractMetadata(request);

    this.logger.debug('Creating new session', {
      userId,
      sessionId,
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
    });

    await this.sessionValidatorService.enforceSessionLimit(userId);

    await this.prismaService.session.create({
      data: {
        id: sessionId,
        userId,
        ...metadata,
        expiresAt: this.sessionTokenService.calculateExpiry(),
      },
    });

    this.logger.info('Session created successfully', {
      userId,
      sessionId,
      expiresAt: this.sessionTokenService.calculateExpiry(),
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
    });

    return this.sessionCookieService.create(sessionId);
  }

  async validateSession(sessionId: string): Promise<SessionValidationResult> {
    this.logger.debug('Validating session', { sessionId });
    return this.sessionValidatorService.validate(sessionId);
  }

  async invalidateSession(sessionId: string): Promise<void> {
    this.logger.debug('Invalidating session', { sessionId });

    try {
      await this.prismaService.session.delete({ where: { id: sessionId } });

      this.logger.info('Session invalidated successfully', {
        sessionId,
      });
    } catch (error) {
      this.logger.warn('Failed to invalidate session - may not exist', {
        sessionId,
        error: error.message,
      });
    }
  }

  async invalidateAllUserSessions(userId: string): Promise<void> {
    this.logger.debug('Invalidating all user sessions', { userId });

    const result = await this.prismaService.session.deleteMany({
      where: { userId },
    });

    this.logger.info('All user sessions invalidated', {
      userId,
      deletedCount: result.count,
    });
  }
}
