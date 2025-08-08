import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Registration success message',
    example:
      'Registration completed successfully. Check your email inbox to verify your account.',
  })
  message: string;

  @ApiProperty({
    description: 'Next step instructions for the user',
    example:
      'Click the verification link in the sent email to activate your account.',
  })
  nextSteps: string;
}
