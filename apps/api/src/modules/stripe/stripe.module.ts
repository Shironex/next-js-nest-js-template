import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { StripeWebhookController } from './stripe-webhook.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../logger/logger.module';
import { usersModule } from '../user/users.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [ConfigModule, PrismaModule, LoggerModule, usersModule, MailModule],
  providers: [StripeService],
  controllers: [StripeController, StripeWebhookController],
  exports: [StripeService],
})
export class StripeModule {}
