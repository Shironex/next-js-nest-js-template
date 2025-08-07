import { Injectable } from '@nestjs/common';
import { scrypt } from '../scrypt';
import { ScryptService } from './scrypt.service';
import { CustomLogger } from '../../../modules/logger/logger.service';

@Injectable()
export class PasswordHashingService {
  constructor(private readonly logger: CustomLogger) {}

  private async generateScryptKey(
    data: string,
    salt: string,
    blockSize = 16,
  ): Promise<Uint8Array> {
    const encodedData = new TextEncoder().encode(data);
    const encodedSalt = new TextEncoder().encode(salt);
    const keyUint8Array = await scrypt(encodedData, encodedSalt, {
      N: 16384,
      r: blockSize,
      p: 1,
      dkLen: 64,
    });
    return new Uint8Array(keyUint8Array);
  }

  private scryptImpl = new ScryptService(this.generateScryptKey.bind(this));

  async hashPassword(password: string): Promise<string> {
    const startTime = Date.now();
    this.logger.debug('Starting password hashing', {
      passwordLength: password?.length,
    });

    try {
      const hashedPassword = await this.scryptImpl.hash(password);
      const duration = Date.now() - startTime;

      this.logger.debug('Password hashing completed', {
        duration,
        hashedLength: hashedPassword?.length,
      });

      return hashedPassword;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Password hashing failed', {
        error: error.message,
        duration,
      });
      throw error;
    }
  }

  async verifyPassword(
    hashedPassword: string,
    password: string,
  ): Promise<boolean> {
    const startTime = Date.now();
    this.logger.debug('Starting password verification', {
      hashedLength: hashedPassword?.length,
      passwordLength: password?.length,
    });

    try {
      const isValid = await this.scryptImpl.verify(hashedPassword, password);
      const duration = Date.now() - startTime;

      this.logger.debug('Password verification completed', {
        isValid,
        duration,
      });

      return isValid;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Password verification failed', {
        error: error.message,
        duration,
      });
      throw error;
    }
  }
}
