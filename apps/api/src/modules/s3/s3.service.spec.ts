import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import {
  S3Client,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
} from '@aws-sdk/client-s3';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { S3Service } from './s3.service';

// Mock the AWS SDK
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  ListObjectsV2Command: jest.fn(),
}));

describe('S3Service', () => {
  let service: S3Service;
  let configService: DeepMockProxy<ConfigService>;
  let mockS3Client: any;

  const mockConfig = {
    AWS_BUCKET_NAME: 'test-bucket',
    AWS_ENDPOINT: 'localhost',
    AWS_PORT: '9000',
    AWS_REGION: 'us-east-1',
    AWS_ACCESS_KEY: 'test-access-key',
    AWS_SECRET_KEY: 'test-secret-key',
  };

  beforeEach(async () => {
    // Create deep mocks
    configService = mockDeep<ConfigService>();

    // Create mock S3Client
    mockS3Client = {
      send: jest.fn(),
    };

    // Mock S3Client constructor to return our mock
    (S3Client as jest.Mock).mockImplementation(() => mockS3Client);

    // Setup ConfigService mocks
    configService.getOrThrow.mockImplementation((key: string) => {
      return mockConfig[key as keyof typeof mockConfig];
    });
    configService.get.mockImplementation((key: string) => {
      return mockConfig[key as keyof typeof mockConfig];
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);

    // Suppress console logs during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(configService.getOrThrow).toHaveBeenCalledWith('AWS_BUCKET_NAME');
      expect(configService.getOrThrow).toHaveBeenCalledWith('AWS_ENDPOINT');
      expect(configService.getOrThrow).toHaveBeenCalledWith('AWS_REGION');
      expect(configService.getOrThrow).toHaveBeenCalledWith('AWS_ACCESS_KEY');
      expect(configService.getOrThrow).toHaveBeenCalledWith('AWS_SECRET_KEY');
      expect(configService.get).toHaveBeenCalledWith('AWS_PORT');
    });

    it('should create S3Client with localhost endpoint and port', () => {
      expect(S3Client).toHaveBeenCalledWith({
        region: 'us-east-1',
        endpoint: 'http://localhost:9000',
        credentials: {
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
        },
        forcePathStyle: true,
      });
    });

    it('should create S3Client with non-localhost endpoint without port', () => {
      // Reset mocks and create new service instance
      jest.clearAllMocks();
      configService.getOrThrow.mockImplementation((key: string) => {
        const config = {
          ...mockConfig,
          AWS_ENDPOINT: 'https://s3.amazonaws.com',
        };
        return config[key as keyof typeof config];
      });
      configService.get.mockImplementation((key: string) => {
        const config = {
          ...mockConfig,
          AWS_ENDPOINT: 'https://s3.amazonaws.com',
        };
        return config[key as keyof typeof config];
      });

      // Create new service instance
      new S3Service(configService);

      expect(S3Client).toHaveBeenCalledWith({
        region: 'us-east-1',
        endpoint: 'https://s3.amazonaws.com',
        credentials: {
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
        },
        forcePathStyle: true,
      });
    });

    it('should create S3Client without port when AWS_PORT is not provided', () => {
      // Reset mocks and create new service instance
      jest.clearAllMocks();
      configService.getOrThrow.mockImplementation((key: string) => {
        return mockConfig[key as keyof typeof mockConfig];
      });
      configService.get.mockReturnValue(undefined); // No port provided

      // Create new service instance
      new S3Service(configService);

      expect(S3Client).toHaveBeenCalledWith({
        region: 'us-east-1',
        endpoint: 'localhost',
        credentials: {
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
        },
        forcePathStyle: true,
      });
    });
  });

  describe('getBucketName', () => {
    it('should return the configured bucket name', () => {
      const result = service.getBucketName();
      expect(result).toBe('test-bucket');
    });
  });

  describe('getEndpoint', () => {
    it('should return the configured endpoint', () => {
      const result = service.getEndpoint();
      expect(result).toBe('localhost');
    });
  });

  describe('getClient', () => {
    it('should return the S3Client instance', () => {
      const result = service.getClient();
      expect(result).toBe(mockS3Client);
    });
  });

  describe('listAllBucketKeys', () => {
    beforeEach(() => {
      (ListObjectsV2Command as unknown as jest.Mock).mockImplementation(
        (params) => ({
          input: params,
        }),
      );
    });

    it('should list all keys from S3 bucket without pagination', async () => {
      const mockResponse: ListObjectsV2CommandOutput = {
        Contents: [
          { Key: 'file1.txt' },
          { Key: 'file2.jpg' },
          { Key: 'folder/file3.pdf' },
        ],
        NextContinuationToken: undefined,
        $metadata: {},
      };

      mockS3Client.send.mockResolvedValueOnce(mockResponse);

      const result = await service.listAllBucketKeys();

      expect(ListObjectsV2Command).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        ContinuationToken: undefined,
      });
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
      expect(result).toEqual(['file1.txt', 'file2.jpg', 'folder/file3.pdf']);
      expect(Logger.prototype.log).toHaveBeenCalledWith('Listing keys from S3');
    });

    it('should handle pagination and list all keys from multiple pages', async () => {
      const mockResponse1: ListObjectsV2CommandOutput = {
        Contents: [{ Key: 'file1.txt' }, { Key: 'file2.jpg' }],
        NextContinuationToken: 'token123',
        $metadata: {},
      };

      const mockResponse2: ListObjectsV2CommandOutput = {
        Contents: [{ Key: 'file3.pdf' }, { Key: 'file4.doc' }],
        NextContinuationToken: 'token456',
        $metadata: {},
      };

      const mockResponse3: ListObjectsV2CommandOutput = {
        Contents: [{ Key: 'file5.png' }],
        NextContinuationToken: undefined,
        $metadata: {},
      };

      mockS3Client.send
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2)
        .mockResolvedValueOnce(mockResponse3);

      const result = await service.listAllBucketKeys();

      expect(ListObjectsV2Command).toHaveBeenCalledTimes(3);
      expect(ListObjectsV2Command).toHaveBeenNthCalledWith(1, {
        Bucket: 'test-bucket',
        ContinuationToken: undefined,
      });
      expect(ListObjectsV2Command).toHaveBeenNthCalledWith(2, {
        Bucket: 'test-bucket',
        ContinuationToken: 'token123',
      });
      expect(ListObjectsV2Command).toHaveBeenNthCalledWith(3, {
        Bucket: 'test-bucket',
        ContinuationToken: 'token456',
      });
      expect(mockS3Client.send).toHaveBeenCalledTimes(3);
      expect(result).toEqual([
        'file1.txt',
        'file2.jpg',
        'file3.pdf',
        'file4.doc',
        'file5.png',
      ]);
    });

    it('should handle empty bucket', async () => {
      const mockResponse: ListObjectsV2CommandOutput = {
        Contents: [],
        NextContinuationToken: undefined,
        $metadata: {},
      };

      mockS3Client.send.mockResolvedValueOnce(mockResponse);

      const result = await service.listAllBucketKeys();

      expect(result).toEqual([]);
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    });

    it('should handle bucket with no Contents property', async () => {
      const mockResponse: ListObjectsV2CommandOutput = {
        NextContinuationToken: undefined,
        $metadata: {},
      };

      mockS3Client.send.mockResolvedValueOnce(mockResponse);

      const result = await service.listAllBucketKeys();

      expect(result).toEqual([]);
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    });

    it('should filter out objects without Key property', async () => {
      const mockResponse: ListObjectsV2CommandOutput = {
        Contents: [
          { Key: 'file1.txt' },
          { Key: undefined }, // This should be filtered out
          { Key: 'file2.jpg' },
          { Key: null }, // This should be filtered out
          { Key: 'file3.pdf' },
        ] as any,
        NextContinuationToken: undefined,
        $metadata: {},
      };

      mockS3Client.send.mockResolvedValueOnce(mockResponse);

      const result = await service.listAllBucketKeys();

      expect(result).toEqual(['file1.txt', 'file2.jpg', 'file3.pdf']);
    });

    it('should handle S3 client errors', async () => {
      const error = new Error('AWS S3 connection failed');
      mockS3Client.send.mockRejectedValueOnce(error);

      await expect(service.listAllBucketKeys()).rejects.toThrow(
        'AWS S3 connection failed',
      );
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    });

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Network timeout');
      timeoutError.name = 'TimeoutError';
      mockS3Client.send.mockRejectedValueOnce(timeoutError);

      await expect(service.listAllBucketKeys()).rejects.toThrow(
        'Network timeout',
      );
    });

    it('should log listing operation', async () => {
      const mockResponse: ListObjectsV2CommandOutput = {
        Contents: [{ Key: 'file1.txt' }],
        NextContinuationToken: undefined,
        $metadata: {},
      };

      mockS3Client.send.mockResolvedValueOnce(mockResponse);

      await service.listAllBucketKeys();

      expect(Logger.prototype.log).toHaveBeenCalledWith('Listing keys from S3');
    });
  });
});
