import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail(
    {},
    {
      message: 'Niepoprawny adres email',
    },
  )
  @IsNotEmpty({
    message: 'Adres email jest wymagany',
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
    message: 'Niepoprawny format hasła',
  })
  @IsNotEmpty({
    message: 'Hasło jest wymagane',
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
        'Hasło musi zawierać co najmniej 8 znaków, 1 wielką literę, 1 małą literę, 1 cyfrę i 1 symbol',
    },
  )
  password: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+48 123456789',
  })
  @IsString({
    message: 'Niepoprawny format numeru telefonu',
  })
  @IsOptional()
  phoneNumber: string;

  @ApiProperty({
    description: 'Unique username for the user',
    example: 'artlover2024',
    minLength: 3,
    maxLength: 30,
  })
  @IsString({
    message: 'Niepoprawny format nazwy użytkownika',
  })
  @IsNotEmpty({
    message: 'Nazwa użytkownika jest wymagana',
  })
  username: string;

  @ApiProperty({
    description: 'Turnstile CAPTCHA token for verification',
    example: '0.Ab1cd2Ef3gH4...',
  })
  @IsString({
    message: 'Niepoprawny format kodu captcha',
  })
  @IsNotEmpty({
    message: 'Weryfikacja captcha jest wymagana',
  })
  turnstileToken: string;
}
