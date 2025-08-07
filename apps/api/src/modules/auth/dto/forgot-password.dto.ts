import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'User email address to send reset link to',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Turnstile CAPTCHA token for verification',
    example: '0.Ab1cd2Ef3gH4...',
  })
  @IsString()
  @IsNotEmpty()
  turnstileToken: string;
}
