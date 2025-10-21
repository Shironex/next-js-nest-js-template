import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'User email address to send reset link to',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail(
    {},
    {
      message: 'Invalid email address',
    },
  )
  @IsNotEmpty({
    message: 'Email address is required',
  })
  email: string;

  @ApiProperty({
    description: 'Turnstile CAPTCHA token for verification',
    example: '0.Ab1cd2Ef3gH4...',
  })
  @IsString({
    message: 'Invalid captcha code format',
  })
  @IsNotEmpty({
    message: 'Captcha verification is required',
  })
  turnstileToken: string;
}
