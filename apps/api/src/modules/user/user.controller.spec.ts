import { Test, TestingModule } from '@nestjs/testing';
import { usersController } from './users.controller';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { usersService } from './users.service';

describe('UserController', () => {
  let userController: usersController;
  let userService: DeepMockProxy<usersService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [usersController],
      providers: [
        {
          provide: usersService,
          useValue: mockDeep<usersService>(),
        },
      ],
    }).compile();

    userController = app.get<usersController>(usersController);
  });

  describe('should be defined', () => {
    it('should be defined', () => {
      expect(userController).toBeDefined();
    });
  });
});
