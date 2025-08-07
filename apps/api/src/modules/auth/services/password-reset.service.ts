import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PasswordResetToken, User } from 'generated/prisma';
import {
  alphabet,
  createDate,
  generateRandomString,
  isWithinExpirationDate,
  TimeSpan,
} from '../../../common/utils';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomLogger } from '../../logger/logger.service';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly logger: CustomLogger,
  ) {}

  async createResetToken(user: User) {
    const token = generateRandomString(21, alphabet('a-zA-Z0-9'));
    const resetToken = await this.prisma.passwordResetToken.create({
      data: {
        token,
        User: {
          connect: {
            id: user.id,
          },
        },
        expiresAt: createDate(new TimeSpan(1, 'h')),
      },
    });

    this.logger.info('Password reset token created', {
      resetTokenId: resetToken.id,
      userId: user.id,
    });

    return resetToken;
  }

  async findAndDeleteResetToken(token: string) {
    return await this.prisma.$transaction(async (tx) => {
      const resetToken = await tx.passwordResetToken.findUnique({
        where: { token },
      });

      if (resetToken) {
        await tx.passwordResetToken.delete({
          where: { id: resetToken.id },
        });
      }

      return resetToken;
    });
  }

  async findLastSentToken(userId: string) {
    return await this.prisma.passwordResetToken.findFirst({
      where: { userId },
    });
  }

  isTokenValid(token: PasswordResetToken | null): boolean {
    if (!token) return false;
    return isWithinExpirationDate(token.expiresAt);
  }

  generateResetLink(token: string): string {
    return `${this.configService.getOrThrow('FRONTEND_URL')}/auth/reset-password?token=${token}`;
  }
}
