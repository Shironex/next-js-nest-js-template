import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LogRequest, RateLimit } from '../../common/decorators';
import {
  RegisterDocs,
  LoginDocs,
  LogoutDocs,
  VerifyEmailDocs,
  ForgotPasswordDocs,
  ResetPasswordDocs,
} from './swagger/auth.swagger';
import { ApiTags } from '@nestjs/swagger';
import { RequireTurnstile } from 'src/common/decorators/require-turnstile.decorator';
import { TurnstileGuard } from 'src/common/guards/turnstile.guard';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { SessionCookieService } from './services/session/sessionCookie.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { VerifyEmailDto } from './dto/verify-email.dto';
import {
  CurrentSession,
  CurrentUser,
} from 'src/common/decorators/current-user.decorator';
import { SafeSession, SafeUser } from 'src/common/interfaces/auth';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('authentication')
@Controller('auth')
@UseGuards(TurnstileGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionCookieService: SessionCookieService,
  ) {}

  @Post('register')
  @RateLimit({
    requests: 3,
    window: '15m',
    keyGenerator: (req) => `register:${req.ip}`,
    skipSuccessfulRequests: true,
  })
  @RequireTurnstile()
  @RegisterDocs()
  @LogRequest({
    logBody: true,
  })
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Post('login')
  @RateLimit({
    requests: 3,
    window: '15m',
    keyGenerator: (req) => `login:${req.ip}`,
    skipSuccessfulRequests: true,
  })
  @RequireTurnstile()
  @LoginDocs()
  @LogRequest({
    logBody: true,
  })
  async login(
    @Body() data: LoginDto,
    @Req() request: Request,
    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    return await this.authService.login(data, request, response);
  }

  @Post('verify-email')
  @UseGuards(AuthGuard)
  @RequireTurnstile()
  @VerifyEmailDocs()
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
    @CurrentUser() user: SafeUser,
  ) {
    return await this.authService.verifyEmail(user.email, dto.code);
  }

  @Post('forgot-password')
  @RequireTurnstile()
  @ForgotPasswordDocs()
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @RequireTurnstile()
  @ResetPasswordDocs()
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  // @MeDocs()
  me(@CurrentUser() user: SafeUser, @CurrentSession() session: SafeSession) {
    return {
      user,
      session,
    };
  }

  @Post('logout')
  @LogoutDocs()
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const cookieName = this.sessionCookieService.getCookieName();
    const sessionId = request.cookies[cookieName];

    if (sessionId) {
      const cookie = await this.authService.logout(sessionId);
      response.cookie(cookie.name, cookie.value, cookie.attributes as any);
    }

    return { message: 'Wylogowano pomyślnie' };
  }
}
