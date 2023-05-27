import {
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';

const oneMegabyte = 1024 * 1024;

@Controller('s3')
export class S3Controller {
  constructor(private svc: S3Service) {}

  @Get()
  async listBuckets() {
    return this.svc.listBuckets();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * oneMegabyte }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    await this.svc.putImage(file.originalname, file.buffer);
    return { message: 'File uploaded successfully' };
  }
}
