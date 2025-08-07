import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly client: S3Client;
  private readonly bucketName: string;
  private readonly endpoint: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.getOrThrow<string>('AWS_BUCKET_NAME');
    this.endpoint = this.configService.getOrThrow<string>('AWS_ENDPOINT');

    // Construct full endpoint URL for S3 client
    const port = this.configService.get<string>('AWS_PORT');
    const fullEndpoint =
      port && this.endpoint === 'localhost'
        ? `http://${this.endpoint}:${port}`
        : this.endpoint;

    this.client = new S3Client({
      region: this.configService.getOrThrow<string>('AWS_REGION'),
      endpoint: fullEndpoint,
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY'),
        secretAccessKey:
          this.configService.getOrThrow<string>('AWS_SECRET_KEY'),
      },
      forcePathStyle: true,
    });
  }

  getBucketName(): string {
    return this.bucketName;
  }

  getEndpoint(): string {
    return this.endpoint;
  }

  getClient(): S3Client {
    return this.client;
  }

  async listAllBucketKeys(): Promise<string[]> {
    this.logger.log('Listing keys from S3');

    const keys: string[] = [];
    let continuationToken: string | undefined;

    do {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        ContinuationToken: continuationToken,
      });

      const response = await this.client.send(command);

      response.Contents?.forEach((item) => {
        if (item.Key) {
          keys.push(item.Key);
        }
      });

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return keys;
  }
}
