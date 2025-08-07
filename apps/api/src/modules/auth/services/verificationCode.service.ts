import { Injectable } from '@nestjs/common';
import { EmailVerificationCode, User } from 'generated/prisma';
import { PrismaService } from '../../prisma/prisma.service';
import {
  TimeSpan,
  createDate,
  isWithinExpirationDate,
  alphabet,
  generateRandomString,
} from '../../../common/utils';
import { CustomLogger } from '../../logger/logger.service';

@Injectable()
export class VerificationCodeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CustomLogger,
  ) {}

  async createEmailVerificationCode(user: User) {
    const code = generateRandomString(8, alphabet('0-9'));

    // Delete any existing verification code for this email first
    await this.prisma.emailVerificationCode.deleteMany({
      where: {
        email: user.email,
      },
    });

    const emailVerificationCode =
      await this.prisma.emailVerificationCode.create({
        data: {
          code,
          User: {
            connect: {
              id: user.id,
            },
          },
          email: user.email,
          expiresAt: createDate(new TimeSpan(10, 'm')),
        },
      });

    this.logger.info('Email verification code created', {
      verificationCodeId: emailVerificationCode.id,
      code: emailVerificationCode.code,
    });

    return code;
  }

  async findAndDeleteVerificationCode(userId: string, code: string) {
    return await this.prisma.$transaction(async (tx) => {
      const emailVerificationCode = await tx.emailVerificationCode.findUnique({
        where: {
          userId,
          code,
        },
      });

      if (emailVerificationCode) {
        await tx.emailVerificationCode.delete({
          where: {
            id: emailVerificationCode.id,
          },
        });
      }

      return emailVerificationCode;
    });
  }

  isCodeValid(
    verificationCode: EmailVerificationCode,
    userId: string,
    code: string,
  ): boolean {
    if (!verificationCode || verificationCode.code !== code) {
      return false;
    }

    if (verificationCode.userId !== userId) {
      return false;
    }

    return isWithinExpirationDate(verificationCode.expiresAt);
  }
}
