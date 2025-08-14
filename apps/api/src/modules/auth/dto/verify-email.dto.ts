import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email verification code (8 digits)',
    example: '12345678',
    minLength: 8,
    maxLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 8, { message: 'Code must be exactly 8 digits' })
  code: string;

  @ApiProperty({
    description: 'Turnstile CAPTCHA token for verification',
    example: '0.Ab1cd2Ef3gH4...',
  })
  @IsString()
  @IsNotEmpty()
  turnstileToken: string;
}
