import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
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
    description:
      'User password - must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 symbol',
    example: 'MySecurePass123!',
    minLength: 8,
    pattern:
      '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
  })
  @IsString({
    message: 'Invalid password format',
  })
  @IsNotEmpty({
    message: 'Password is required',
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
  password: string;

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
