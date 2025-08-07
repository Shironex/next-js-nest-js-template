import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Global()
@Module({
  controllers: [],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
