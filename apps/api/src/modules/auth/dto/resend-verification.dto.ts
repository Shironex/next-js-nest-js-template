import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResendVerificationDto {
  @ApiProperty({
    description: 'Cloudflare Turnstile token for bot verification',
    example: 'turnstile_token_here',
  })
  @IsString()
  @MinLength(1, { message: 'Please complete the verification' })
  turnstileToken: string;
}
