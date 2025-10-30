import { Test, TestingModule } from '@nestjs/testing';
import { usersRepositoryService } from './users.repository.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, User } from 'generated/prisma';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

describe('usersRepositoryService', () => {
  let service: usersRepositoryService;
  let prismaService: DeepMockProxy<PrismaService>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedpassword',
    emailVerified: false,
    lastPasswordChangeAt: null,
    isActive: true,
    role: 'USER',
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        usersRepositoryService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    service = module.get<usersRepositoryService>(usersRepositoryService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should find user by email successfully', async () => {
      const email = 'test@example.com';
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail(email);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by email', async () => {
      const email = 'notfound@example.com';
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toBeNull();
    });

    it('should handle database errors when finding by email', async () => {
      const email = 'test@example.com';
      const error = new Error('Database connection failed');
      prismaService.user.findUnique.mockRejectedValue(error);

      await expect(service.findByEmail(email)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle empty email string', async () => {
      const email = '';
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: '' },
      });
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by id successfully', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById(id);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by id', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174999';
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findById(id);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toBeNull();
    });

    it('should handle database errors when finding by id', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const error = new Error('Database connection failed');
      prismaService.user.findUnique.mockRejectedValue(error);

      await expect(service.findById(id)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle invalid UUID format', async () => {
      const id = 'invalid-uuid';
      const error = new Error('Invalid UUID format');
      prismaService.user.findUnique.mockRejectedValue(error);

      await expect(service.findById(id)).rejects.toThrow('Invalid UUID format');
    });
  });

  describe('findByUsername', () => {
    it('should find user by username successfully', async () => {
      const username = 'testuser';
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByUsername(username);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by username', async () => {
      const username = 'notfounduser';
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByUsername(username);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username },
      });
      expect(result).toBeNull();
    });

    it('should handle database errors when finding by username', async () => {
      const username = 'testuser';
      const error = new Error('Database connection failed');
      prismaService.user.findUnique.mockRejectedValue(error);

      await expect(service.findByUsername(username)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle empty username string', async () => {
      const username = '';
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByUsername(username);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: '' },
      });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      prismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(mockUser);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: mockUser,
      });
      expect(result).toEqual(mockUser);
    });

    it('should handle database errors when creating user', async () => {
      const error = new Error('Unique constraint violation');
      prismaService.user.create.mockRejectedValue(error);

      await expect(service.create(mockUser)).rejects.toThrow(
        'Unique constraint violation',
      );
    });

    it('should handle duplicate email error', async () => {
      const error = new Error('Email already exists');
      prismaService.user.create.mockRejectedValue(error);

      await expect(service.create(mockUser)).rejects.toThrow(
        'Email already exists',
      );
    });

    it('should handle duplicate username error', async () => {
      const error = new Error('Username already exists');
      prismaService.user.create.mockRejectedValue(error);

      await expect(service.create(mockUser)).rejects.toThrow(
        'Username already exists',
      );
    });

    it('should create user with minimal required data', async () => {
      const minimalUserData: Prisma.UserCreateInput = {
        email: 'minimal@example.com',
        username: 'minimaluser',
        password: 'hashedpassword',
      };

      const createdUser: User = {
        ...mockUser,
        ...minimalUserData,
        id: '123e4567-e89b-12d3-a456-426614174002',
        lastPasswordChangeAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.create(minimalUserData);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: minimalUserData,
      });
      expect(result).toEqual(createdUser);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateData: Prisma.UserUpdateInput = {
        email: 'updated@example.com',
        isActive: false,
      };

      const updatedUser = {
        ...mockUser,
        email: 'updated@example.com',
        isActive: false,
        updatedAt: new Date('2023-01-02T00:00:00Z'),
      };

      prismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(id, updateData);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id },
        data: updateData,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should handle user not found when updating', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174999';
      const updateData: Prisma.UserUpdateInput = {
        email: 'updated@example.com',
      };

      const error = new Error('User not found');
      prismaService.user.update.mockRejectedValue(error);

      await expect(service.update(id, updateData)).rejects.toThrow(
        'User not found',
      );
    });

    it('should handle database errors when updating', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateData: Prisma.UserUpdateInput = {
        email: 'updated@example.com',
      };

      const error = new Error('Database connection failed');
      prismaService.user.update.mockRejectedValue(error);

      await expect(service.update(id, updateData)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle partial updates', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateData: Prisma.UserUpdateInput = {
        isActive: false,
      };

      const updatedUser = {
        ...mockUser,
        isActive: false,
        updatedAt: new Date('2023-01-02T00:00:00Z'),
      };

      prismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(id, updateData);

      expect(result.isActive).toBe(false);
      expect(result.email).toBe(mockUser.email); // Should remain unchanged
      expect(result.username).toBe(mockUser.username); // Should remain unchanged
    });

    it('should handle empty update data', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateData: Prisma.UserUpdateInput = {};

      prismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.update(id, updateData);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id },
        data: {},
      });
      expect(result).toEqual(mockUser);
    });

    it('should handle invalid UUID format when updating', async () => {
      const id = 'invalid-uuid';
      const updateData: Prisma.UserUpdateInput = {
        email: 'updated@example.com',
      };

      const error = new Error('Invalid UUID format');
      prismaService.user.update.mockRejectedValue(error);

      await expect(service.update(id, updateData)).rejects.toThrow(
        'Invalid UUID format',
      );
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      prismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.delete(id);

      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(mockUser);
    });

    it('should handle user not found when deleting', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174999';
      const error = new Error('User not found');
      prismaService.user.delete.mockRejectedValue(error);

      await expect(service.delete(id)).rejects.toThrow('User not found');
    });

    it('should handle database errors when deleting', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const error = new Error('Database connection failed');
      prismaService.user.delete.mockRejectedValue(error);

      await expect(service.delete(id)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle invalid UUID format when deleting', async () => {
      const id = 'invalid-uuid';
      const error = new Error('Invalid UUID format');
      prismaService.user.delete.mockRejectedValue(error);

      await expect(service.delete(id)).rejects.toThrow('Invalid UUID format');
    });
  });

  describe('deleteMany', () => {
    it('should delete multiple users successfully', async () => {
      const ids = [
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174001',
      ];

      const deleteResult = { count: 2 };
      prismaService.user.deleteMany.mockResolvedValue(deleteResult);

      const result = await service.deleteMany(ids);

      expect(prismaService.user.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ids } },
      });
      expect(result).toEqual(deleteResult);
    });

    it('should handle empty ids array', async () => {
      const ids: string[] = [];
      const deleteResult = { count: 0 };
      prismaService.user.deleteMany.mockResolvedValue(deleteResult);

      const result = await service.deleteMany(ids);

      expect(prismaService.user.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [] } },
      });
      expect(result.count).toBe(0);
    });

    it('should handle partial deletions (some users not found)', async () => {
      const ids = [
        '123e4567-e89b-12d3-a456-426614174000', // exists
        '123e4567-e89b-12d3-a456-426614174999', // doesn't exist
      ];

      const deleteResult = { count: 1 }; // Only one was deleted
      prismaService.user.deleteMany.mockResolvedValue(deleteResult);

      const result = await service.deleteMany(ids);

      expect(result.count).toBe(1);
    });

    it('should handle database errors when deleting many', async () => {
      const ids = [
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174001',
      ];

      const error = new Error('Database connection failed');
      prismaService.user.deleteMany.mockRejectedValue(error);

      await expect(service.deleteMany(ids)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle single id in array', async () => {
      const ids = ['123e4567-e89b-12d3-a456-426614174000'];
      const deleteResult = { count: 1 };
      prismaService.user.deleteMany.mockResolvedValue(deleteResult);

      const result = await service.deleteMany(ids);

      expect(prismaService.user.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ids } },
      });
      expect(result.count).toBe(1);
    });

    it('should handle large number of ids', async () => {
      const ids = Array.from(
        { length: 100 },
        (_, i) =>
          `123e4567-e89b-12d3-a456-42661417${i.toString().padStart(4, '0')}`,
      );
      const deleteResult = { count: 100 };
      prismaService.user.deleteMany.mockResolvedValue(deleteResult);

      const result = await service.deleteMany(ids);

      expect(prismaService.user.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ids } },
      });
      expect(result.count).toBe(100);
    });

    it('should handle mixed valid and invalid UUIDs', async () => {
      const ids = [
        '123e4567-e89b-12d3-a456-426614174000', // valid
        'invalid-uuid', // invalid
        '123e4567-e89b-12d3-a456-426614174001', // valid
      ];

      // In real scenarios, Prisma would handle this, but for testing we simulate partial success
      const deleteResult = { count: 2 }; // Only valid UUIDs deleted
      prismaService.user.deleteMany.mockResolvedValue(deleteResult);

      const result = await service.deleteMany(ids);

      expect(result.count).toBe(2);
    });
  });
});
