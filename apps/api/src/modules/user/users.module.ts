import { Module } from '@nestjs/common';
import { usersService } from './users.service';
import { usersController } from './users.controller';
import { usersRepositoryService } from './services/users.repository.service';

@Module({
  controllers: [usersController],
  providers: [usersService, usersRepositoryService],
  exports: [usersService, usersRepositoryService],
})
export class usersModule {}
