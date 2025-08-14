import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty({
    description: 'Stripe price ID',
    example: 'price_1234567890',
  })
  @IsString()
  @IsNotEmpty()
  priceId: string;

  @ApiProperty({
    description: 'URL to redirect to on successful payment',
    example: 'https://example.com/success',
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  @IsNotEmpty()
  successUrl: string;

  @ApiProperty({
    description: 'URL to redirect to if payment is canceled',
    example: 'https://example.com/cancel',
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  @IsNotEmpty()
  cancelUrl: string;
}
