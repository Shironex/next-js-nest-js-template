import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Registration success message',
    example:
      'Rejestracja zakończona pomyślnie. Sprawdź swoją skrzynkę pocztową w celu weryfikacji konta.',
  })
  message: string;

  @ApiProperty({
    description: 'Next step instructions for the user',
    example:
      'Kliknij link weryfikacyjny w wysłanym mailu, aby aktywować swoje konto.',
  })
  nextSteps: string;
}
