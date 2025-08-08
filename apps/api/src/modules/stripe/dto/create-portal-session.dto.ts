import { ApiProperty } from '@nestjs/swagger';
import { IsUrl, IsNotEmpty } from 'class-validator';

export class CreatePortalSessionDto {
  @ApiProperty({
    description: 'URL to redirect to after leaving the portal',
    example: 'https://example.com/account',
  })
  @IsUrl({ require_tld: false, require_protocol: true })
  @IsNotEmpty()
  returnUrl: string;
}
