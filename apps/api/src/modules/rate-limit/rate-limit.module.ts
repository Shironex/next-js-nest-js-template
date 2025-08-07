import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RateLimitService } from './rate-limit.service';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { RateLimitInterceptor } from '../../common/interceptors/rate-limit.interceptor';
import { LoggerModule } from '../logger/logger.module';

@Global()
@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [RateLimitService, RateLimitGuard, RateLimitInterceptor],
  exports: [RateLimitService, RateLimitGuard, RateLimitInterceptor],
})
export class RateLimitModule {}
