import { SetMetadata } from '@nestjs/common';

export const REQUIRE_TURNSTILE_KEY = 'require_turnstile';

export const RequireTurnstile = () => SetMetadata(REQUIRE_TURNSTILE_KEY, true);
