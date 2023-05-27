import * as S3 from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from '../environment';

const logger = new Logger('S3Service');

@Injectable()
export class S3Service {
  private client: S3.S3Client;
  constructor(cfg: ConfigService<Environment, true>) {
    // region: string, // credentials: { accessKeyId: string; secretAccessKey: string },
    const credentials = {
      accessKeyId: cfg.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: cfg.get('AWS_SECRET_ACCESS_KEY'),
    };
    const region = cfg.get('AWS_REGION');
    this.client = new S3.S3Client({
      credentials,
      region,
    });
  }

  async listBuckets() {
    const command = new S3.ListBucketsCommand({});
    try {
      const data = await this.client.send(command);
      logger.log(JSON.stringify(data, null, 2));
      return data.Buckets;
    } catch (error) {
      logger.error(error);
    } finally {
      // finally.
    }
  }
}
