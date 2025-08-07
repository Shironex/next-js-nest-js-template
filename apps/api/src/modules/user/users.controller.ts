import { Controller } from '@nestjs/common';
import { usersService } from './users.service';

@Controller('users')
export class usersController {
  constructor(private readonly usersService: usersService) {}
}
