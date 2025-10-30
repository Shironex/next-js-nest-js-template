import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoggerFactory } from '../logger/logger.factory';
import { ILogger } from '../logger/logger.interface';
import { RegisterDto } from './dto/register.dto';
import { PasswordHashingService } from './services/passwordHashing.service';
import { EXCEPTION_MESSAGES } from '../../common/constants/index';
import { usersRepositoryService } from '../user/services/users.repository.service';
import { VerificationCodeService } from './services/verificationCode.service';
import { MailService } from '../mail/mail.service';
import { RegisterResponseDto } from './dto/register-response.dto';
import { Request, Response } from 'express';
import { SessionService } from './services/session/session.service';
import { LoginDto } from './dto/login.dto';
import { Cookie } from 'src/common/interfaces/auth';
import { SessionCookieService } from './services/session/sessionCookie.service';
import { PasswordResetService } from './services/password-reset.service';

@Injectable()
export class AuthService {
  private readonly logger: ILogger;

  constructor(
    private readonly loggerFactory: LoggerFactory,
    private readonly usersRepository: usersRepositoryService,
    private readonly passwordHashingService: PasswordHashingService,
    private readonly verificationCodeService: VerificationCodeService,
    private readonly sessionService: SessionService,
    private readonly mailService: MailService,
    private readonly sessionCookieService: SessionCookieService,
    private readonly passwordResetService: PasswordResetService,
  ) {
    this.logger = this.loggerFactory.createLogger('AuthService');
  }

  async register(data: RegisterDto): Promise<RegisterResponseDto> {
    this.logger.info('User registration attempt', {
      email: data.email,
      username: data.username,
      phoneNumber: data.phoneNumber,
      turnstileToken: data.turnstileToken,
    });

    try {
      const existingUser = await this.usersRepository.findByEmail(data.email);

      if (existingUser) {
        this.logger.warn('Registration failed - user already exists', {
          email: data.email,
          existingUserId: existingUser.id,
        });
        throw new BadRequestException('This email address is already taken');
      }

      const isUsernameTaken = await this.usersRepository.findByUsername(
        data.username,
      );

      if (isUsernameTaken) {
        this.logger.warn('Registration failed - username already taken', {
          email: data.email,
          username: data.username,
          existingUserId: isUsernameTaken.id,
        });
        throw new BadRequestException('This username is already taken');
      }

      const hashedPassword = await this.passwordHashingService.hashPassword(
        data.password,
      );

      const user = await this.usersRepository.create({
        email: data.email,
        password: hashedPassword,
        username: data.username,
      });

      this.logger.info('User created successfully', {
        userId: user.id,
        email: data.email,
        username: data.username,
      });

      const code =
        await this.verificationCodeService.createEmailVerificationCode(user);

      await this.mailService.sendVerificationCode(data.email, code);

      this.logger.info('Registration completed successfully', {
        userId: user.id,
        email: data.email,
        verificationCodeSent: true,
      });

      return {
        message:
          'Registration completed successfully. Check your email inbox to verify your account.',
        nextSteps:
          'Click the verification link in the sent email to activate your account.',
      };
    } catch (error) {
      this.logger.error('Error during user registration', error, {
        email: data.email,
        username: data.username,
      });

      // Re-throw the error if it's already a BadRequestException
      if (error instanceof BadRequestException) {
        throw error;
      }

      // For unexpected errors, throw a generic error
      throw new InternalServerErrorException(
        EXCEPTION_MESSAGES.Internal_Server_Error,
      );
    }
  }

  async login(
    data: LoginDto,
    request: Request,
    response: Response,
  ): Promise<{
    message: string;
    emailVerified: boolean;
  }> {
    const { email, password } = data;
    this.logger.info('User login attempt', { email });

    try {
      const user = await this.usersRepository.findByEmail(email);

      if (!user) {
        this.logger.warn('Login failed - user not found', { email });
        throw new UnauthorizedException('Invalid login credentials');
      }

      const isValidPassword = await this.passwordHashingService.verifyPassword(
        user.password,
        password,
      );

      if (!isValidPassword) {
        this.logger.warn('Login failed - invalid password', {
          email,
          userId: user.id,
        });

        throw new UnauthorizedException('Invalid login credentials');
      }

      this.logger.info('Login successful', {
        email,
        userId: user.id,
        emailVerified: user.emailVerified,
      });

      const cookie = await this.sessionService.createSession(user.id, request);

      response.cookie(cookie.name, cookie.value, cookie.attributes as any);
      return {
        message: 'Login successful',
        emailVerified: user.emailVerified,
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      this.logger.error('Unexpected error during login', error, {
        email,
      });

      throw new UnauthorizedException(EXCEPTION_MESSAGES.Internal_Server_Error);
    }
  }

  async verifyEmail(
    email: string,
    code: string,
  ): Promise<{
    message: string;
  }> {
    this.logger.info('Email verification attempt', {
      email,
      codeLength: code?.length,
    });

    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      this.logger.warn('Email verification failed - user not found', { email });
      throw new BadRequestException(
        'User not found with the provided email address',
      );
    }

    if (user.emailVerified) {
      this.logger.info('Email already verified', {
        email,
        userId: user.id,
      });
      return {
        message: 'Account is already verified',
      };
    }

    const verificationCode =
      await this.verificationCodeService.findAndDeleteVerificationCode(
        user.id,
        code,
      );

    if (!verificationCode) {
      this.logger.warn('Email verification failed - invalid code', {
        email,
        userId: user.id,
        codeLength: code?.length,
      });
      throw new BadRequestException('Verification code is invalid');
    }

    if (
      !this.verificationCodeService.isCodeValid(verificationCode, user.id, code)
    ) {
      this.logger.warn('Email verification failed - code expired or invalid', {
        email,
        userId: user.id,
        verificationCodeId: verificationCode.id,
        expiresAt: verificationCode.expiresAt,
      });
      throw new BadRequestException('Verification code is expired or invalid');
    }

    const updatedUser = await this.usersRepository.update(user.id, {
      emailVerified: true,
    });

    if (!updatedUser) {
      this.logger.error('Email verification failed - user update failed', {
        email,
        userId: user.id,
      });
      throw new InternalServerErrorException(
        'An error occurred during email verification',
      );
    }

    this.logger.info('Email verification successful', {
      email,
      userId: user.id,
    });

    return {
      message: 'Account has been verified',
    };
  }

  async resendVerification(email: string): Promise<{
    message: string;
  }> {
    this.logger.info('Resend verification attempt', { email });

    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      this.logger.warn('Resend verification failed - user not found', {
        email,
      });
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      this.logger.info('Resend verification skipped - email already verified', {
        email,
        userId: user.id,
      });
      throw new BadRequestException('Your email is already verified');
    }

    try {
      // Generate new verification code (this will delete any existing codes)
      const code =
        await this.verificationCodeService.createEmailVerificationCode(user);

      // Send the new verification code
      await this.mailService.sendVerificationCode(user.email, code);

      this.logger.info('Verification code resent successfully', {
        email,
        userId: user.id,
      });

      return {
        message: 'New verification code has been sent to your email',
      };
    } catch (error) {
      this.logger.error('Failed to resend verification code', {
        email,
        userId: user?.id,
        error: error.message,
        stack: error.stack,
      });

      throw new InternalServerErrorException(
        'An error occurred while resending verification code',
      );
    }
  }

  async forgotPassword(email: string): Promise<{
    message: string;
  }> {
    this.logger.info('Forgot password request', { email });

    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      this.logger.warn('Forgot password - user not found', {
        email,
      });
      return { message: 'User not found' };
    }

    if (!user.emailVerified) {
      this.logger.warn('Forgot password failed - email not verified', {
        email,
        userId: user.id,
      });
      throw new BadRequestException('Email address has not been verified');
    }

    // Check if there's already a recent token
    const existingToken = await this.passwordResetService.findLastSentToken(
      user.id,
    );
    if (
      existingToken &&
      this.passwordResetService.isTokenValid(existingToken)
    ) {
      this.logger.warn('Forgot password failed - token already sent', {
        email,
        userId: user.id,
        existingTokenId: existingToken.id,
      });
      throw new BadRequestException(
        'Password reset link has already been sent',
      );
    }

    const resetToken = await this.passwordResetService.createResetToken(user);
    const resetLink = this.passwordResetService.generateResetLink(
      resetToken.token,
    );

    await this.mailService.sendResetPasswordLink(
      email,
      resetLink,
      user.username,
    );

    this.logger.info('Password reset link sent', {
      email,
      userId: user.id,
      resetTokenId: resetToken.id,
    });

    return {
      message: 'Password reset link has been sent',
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{
    message: string;
  }> {
    this.logger.info('Password reset attempt', {
      tokenLength: token?.length,
    });

    const resetToken =
      await this.passwordResetService.findAndDeleteResetToken(token);

    if (!resetToken || !this.passwordResetService.isTokenValid(resetToken)) {
      this.logger.warn('Password reset failed - invalid or expired token', {
        tokenLength: token?.length,
        resetTokenId: resetToken?.id,
        expiresAt: resetToken?.expiresAt,
      });
      throw new BadRequestException('Token is invalid or expired');
    }

    const hashedPassword =
      await this.passwordHashingService.hashPassword(newPassword);

    await this.usersRepository.update(resetToken.userId, {
      password: hashedPassword,
    });

    // Invalidate all user sessions
    await this.sessionService.invalidateAllUserSessions(resetToken.userId);

    this.logger.info('Password reset successful', {
      userId: resetToken.userId,
      resetTokenId: resetToken.id,
    });

    return {
      message: 'Password has been reset successfully',
    };
  }

  async logout(sessionId: string): Promise<Cookie> {
    this.logger.info('User logout attempt', { sessionId });

    try {
      await this.sessionService.invalidateSession(sessionId);

      this.logger.info('Logout successful', { sessionId });

      return this.sessionCookieService.createBlank();
    } catch (error) {
      this.logger.error('Error during logout', error, {
        sessionId,
      });

      // Even if logout fails, return blank cookie to clear client session
      return this.sessionCookieService.createBlank();
    }
  }
}
