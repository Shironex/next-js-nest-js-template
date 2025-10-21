import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token from email link',
    example: 'abc123def456ghi789...',
  })
  @IsString({
    message: 'Invalid token format',
  })
  @IsNotEmpty({
    message: 'Token is required',
  })
  token: string;

  @ApiProperty({
    description:
      'New password - must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 symbol',
    example: 'MyNewSecurePass123!',
    minLength: 8,
  })
  @IsString({
    message: 'Invalid password format',
  })
  @IsNotEmpty({
    message: 'New password is required',
  })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 digit and 1 symbol',
    },
  )
  newPassword: string;

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
