import { Test, TestingModule } from '@nestjs/testing';
import { usersService } from './users.service';

describe('usersService', () => {
  let service: usersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [usersService],
    }).compile();

    service = module.get<usersService>(usersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
