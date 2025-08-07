import { sha256 } from '@oslojs/crypto/sha2';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { SessionMetadata } from 'src/common/interfaces/auth';
import { Injectable } from '@nestjs/common';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { alphabet, generateRandomString } from 'src/common/utils';
import { getClientIp } from 'src/common/utils/request.utils';

@Injectable()
export class SessionTokenService {
  constructor(private readonly configService: ConfigService) {}

  generateToken(): string {
    return generateRandomString(21, alphabet('a-zA-Z0-9'));
  }

  hashToken(token: string): string {
    return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  }

  extractMetadata(request: Request): SessionMetadata {
    return {
      userAgent: request.headers['user-agent'] || null,
      ipAddress: getClientIp(request),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  calculateExpiry(): Date {
    const durationDays = this.configService.getOrThrow<number>(
      'SESSION_DURATION_DAYS',
    );
    const durationMs = durationDays * 24 * 60 * 60 * 1000;
    return new Date(Date.now() + durationMs);
  }
}
