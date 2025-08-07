import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { SessionValidationResult } from './session.service';
import { Session, User } from 'generated/prisma';
import { ILogger } from 'src/modules/logger/logger.interface';
import { LoggerFactory } from 'src/modules/logger/logger.factory';

interface SessionWithUser extends Session {
  user: User;
}

@Injectable()
export class SessionValidatorService {
  private readonly logger: ILogger;
  private readonly sessionDuration: number;
  private readonly refreshThreshold: number;
  private readonly maxSessionCount: number;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly loggerFactory: LoggerFactory,
  ) {
    this.logger = this.loggerFactory.createLogger(SessionValidatorService.name);

    const durationDays = this.configService.getOrThrow<number>(
      'SESSION_DURATION_DAYS',
    );
    this.sessionDuration = durationDays * 24 * 60 * 60 * 1000;
    const refreshDays = this.configService.getOrThrow<number>(
      'SESSION_REFRESH_THRESHOLD_DAYS',
    );
    this.refreshThreshold = refreshDays * 24 * 60 * 60 * 1000;

    this.maxSessionCount =
      this.configService.getOrThrow<number>('SESSION_MAX_COUNT');
  }

  async validate(sessionId: string): Promise<SessionValidationResult> {
    try {
      const session = await this.fetchSessionWithUser(sessionId);

      if (!session || !session.user) {
        return this.nullResult();
      }

      if (this.isExpired(session)) {
        await this.deleteSession(sessionId);
        return this.nullResult();
      }

      await this.refreshIfNeeded(session);
      await this.updateActivityIfNeeded(session);

      return this.formatResult(session);
    } catch (error) {
      this.logger.error('Error validating session', error);
      return this.nullResult();
    }
  }

  async enforceSessionLimit(userId: string): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      const count = await tx.session.count({ where: { userId } });

      if (count >= this.maxSessionCount) {
        const oldest = await tx.session.findFirst({
          where: { userId },
          orderBy: { createdAt: 'asc' },
        });

        if (oldest) {
          await tx.session.delete({ where: { id: oldest.id } });
        }
      }
    });
  }

  private async fetchSessionWithUser(
    sessionId: string,
  ): Promise<SessionWithUser | null> {
    return await this.prismaService.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          omit: {},
        },
      },
    });
  }

  private async deleteSession(sessionId: string): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      await tx.session.delete({ where: { id: sessionId } });
    });
  }

  private isExpired(session: Session): boolean {
    return Date.now() >= session.expiresAt.getTime();
  }

  private async refreshIfNeeded(session: SessionWithUser): Promise<void> {
    if (Date.now() >= session.expiresAt.getTime() - this.refreshThreshold) {
      await this.prismaService.session.update({
        where: { id: session.id },
        data: { expiresAt: new Date(Date.now() + this.sessionDuration) },
      });
    }
  }

  private async updateActivityIfNeeded(
    session: SessionWithUser,
  ): Promise<void> {
    const fiveMinutes = 5 * 60 * 1000;

    if (Date.now() - session.updatedAt.getTime() > fiveMinutes) {
      await this.prismaService.session.update({
        where: { id: session.id },
        data: { updatedAt: new Date() },
      });
    }
  }

  private nullResult(): SessionValidationResult {
    return { session: null, user: null };
  }

  private formatResult(session: SessionWithUser): SessionValidationResult {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user, ipAddress, userAgent, userId, updatedAt, ...safeSession } =
      session;

    // Create safe user by excluding all sensitive security and metadata fields
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      password,
      failedLoginAttempts,
      lastFailedLoginAt,
      lockedUntil,
      lastPasswordChangeAt,
      passwordChangeCount,
      createdAt,
      updatedAt: userUpdatedAt,
      ...safeUser
    } = user;
    /* eslint-enable @typescript-eslint/no-unused-vars */

    return {
      session: safeSession,
      user: safeUser,
    };
  }
}
