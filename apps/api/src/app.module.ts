import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { LoggerModule } from './modules/logger/logger.module';
import loggerConfig from './config/logger.config';
import { usersModule } from './modules/user/users.module';
import { MailModule } from './modules/mail/mail.module';
import { AuthModule } from './modules/auth/auth.module';
import { RateLimitModule } from './modules/rate-limit/rate-limit.module';
import { validationSchema } from './config/configuration.config';
import { SessionModule } from './modules/auth/services/session/session.module';
import { S3Module } from './modules/s3/s3.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loggerConfig],
      validationSchema: validationSchema,
    }),
    LoggerModule,
    RateLimitModule,
    PrismaModule,
    usersModule,
    MailModule,
    AuthModule,
    SessionModule,
    S3Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
