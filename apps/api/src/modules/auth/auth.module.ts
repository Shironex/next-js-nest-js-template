import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PasswordHashingService } from './services/passwordHashing.service';
import { usersRepositoryService } from '../user/services/users.repository.service';
import { VerificationCodeService } from './services/verificationCode.service';
import { TurnstileService } from './services/turnstile.service';
import { PasswordResetService } from './services/password-reset.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    usersRepositoryService,
    PasswordHashingService,
    VerificationCodeService,
    TurnstileService,
    PasswordResetService,
  ],
})
export class AuthModule {}
