import * as S3 from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from '../environment';

const logger = new Logger('S3Service');

@Injectable()
export class S3Service {
  private client: S3.S3Client;
  private bucket: string;
  private region: string;

  constructor(private cfg: ConfigService<Environment, true>) {
    // region: string, // credentials: { accessKeyId: string; secretAccessKey: string },
    const credentials = {
      accessKeyId: cfg.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: cfg.get('AWS_SECRET_ACCESS_KEY'),
    };
    this.region = cfg.get('AWS_REGION');
    this.bucket = cfg.get('AWS_S3_BUCKET');
    this.client = new S3.S3Client({
      credentials,
      region: this.region,
    });
  }

  async listBuckets() {
    try {
      const command = new S3.ListBucketsCommand({});
      const data = await this.client.send(command);
      logger.log(JSON.stringify(data, null, 2));
      return data.Buckets;
    } catch (error) {
      logger.error(error);
    }
  }

  /** TODO the whole Nestjs-as-proxy-to-S3 for uploads can be avoided by using presigned URLs https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html */
  async putImage(key: string, body: string | Buffer) {
    try {
      const command = new S3.PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg',
      });
      const res = await this.client.send(command);
      const region = this.region === 'us-east-1' ? '' : `-${this.region}`;
      const url = `https://s3${region}.amazonaws.com/${this.bucket}/${key}`;
      logger.log(JSON.stringify(res, null, 2));
      logger.log({ url, key });
      return { url, key };
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
