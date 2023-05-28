import {
  Body,
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
import { UploadMarketImageDto } from './upload-market-image.dto';

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
    @Body() body: UploadMarketImageDto,
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
    const timestampedFilename = `${Date.now()}-${file.originalname}`;
    const imageData = await this.svc.putImage(timestampedFilename, file.buffer);
    return { message: 'File uploaded successfully', url: imageData?.url };
  }
}
