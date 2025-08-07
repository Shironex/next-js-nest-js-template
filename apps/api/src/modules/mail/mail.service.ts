import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/render';
import * as nodemailer from 'nodemailer';
import ResetPasswordLinkEmail from './templates/reset-password-link';
import VerificationCodeEmail from './templates/email-verification';
import AccountLockedEmail from './templates/account-locked';
import { APP_TITLE } from 'src/common/constants';

export type MessageInfo = {
  to: string;
  subject: string;
  html: string;
};

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure:
        this.configService.get<string>('SMTP_TLS') === 'yes' ? true : false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendMail(message: MessageInfo) {
    await this.transporter.sendMail({
      from: this.configService.get<string>('SMTP_FROM_EMAIL'),
      to: message.to,
      subject: message.subject,
      html: message.html,
    });
  }

  async sendVerificationCode(email: string, code: string) {
    const html = await render(VerificationCodeEmail({ code }));

    await this.sendMail({
      to: email,
      subject: 'Verification Code',
      html,
    });
  }

  async sendResetPasswordLink(email: string, link: string, userName?: string) {
    const html = await render(
      ResetPasswordLinkEmail({ resetLink: link, userName }),
    );

    await this.sendMail({
      to: email,
      subject: 'Reset Password Link',
      html,
    });
  }

  async sendAccountLockedEmail(
    email: string,
    username: string,
    lockedUntil: Date,
    loginAttempts: number,
  ) {
    const html = await render(
      AccountLockedEmail({ username, lockedUntil, loginAttempts }),
    );

    await this.sendMail({
      to: email,
      subject: `${APP_TITLE} - Account Temporarily Locked`,
      html,
    });
  }
}
