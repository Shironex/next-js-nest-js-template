import { Global, Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionTokenService } from './sessionToken.service';
import { SessionCookieService } from './sessionCookie.service';
import { SessionValidatorService } from './sessionValidator.service';

@Global()
@Module({
  providers: [
    SessionService,
    SessionTokenService,
    SessionCookieService,
    SessionValidatorService,
  ],
  exports: [SessionService, SessionCookieService, SessionValidatorService], // Export what's needed
})
export class SessionModule {}
