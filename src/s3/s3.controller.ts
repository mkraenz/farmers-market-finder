import { Controller, Get } from '@nestjs/common';
import { S3Service } from './s3.service';

@Controller('s3')
export class S3Controller {
  constructor(private svc: S3Service) {}

  @Get()
  async listBuckets() {
    return this.svc.listBuckets();
  }
}
