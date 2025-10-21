import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResendVerificationDto {
  @ApiProperty({
    description: 'Turnstile CAPTCHA token for verification',
    example: '0.Ab1cd2Ef3gH4...',
  })
  @IsString({
    message: 'Invalid captcha code format',
  })
  @MinLength(1, {
    message: 'Captcha verification is required',
  })
  turnstileToken: string;
}
