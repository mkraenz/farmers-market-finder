import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { CreateMarketDto } from './dto/create-market.dto';
import { FindNearestMarketsDto } from './dto/find-nearest-markets.dto';
import { GetMarketDto } from './dto/get-market.dto';
import { UpdateMarketDto } from './dto/update-market.dto';
import {
  UploadMarketImageBodyDto,
  UploadMarketImageParamDto,
} from './dto/upload-market-image.dto';
import { MarketsService } from './markets.service';

const oneMegabyteInBytes = 1024 * 1024;

@Controller('markets')
@ApiTags('Markets')
export class MarketsController {
  constructor(private readonly markets: MarketsService) {}

  @Post()
  async create(@Body() dto: CreateMarketDto) {
    const market = await this.markets.create(dto);
    return GetMarketDto.fromEntity(market);
  }

  @Get()
  @ApiExtraModels(FindNearestMarketsDto)
  @ApiQuery({
    required: true,
    name: 'queryParams',
    explode: true,
    type: 'object',
    schema: {
      $ref: getSchemaPath(FindNearestMarketsDto),
    },
  })
  @ApiOkResponse({
    type: [GetMarketDto],
    description:
      'Returns markets around the given coordinates, sorted by closest first. Markets additionally have the property "distance" set.',
  })
  async findMany(@Query() queryParams: FindNearestMarketsDto) {
    if (queryParams instanceof FindNearestMarketsDto) {
      // TODO queryParams is not an instance of FindNearestMarketsDto!!!
      // @see https://github.com/risen228/nestjs-zod/issues/52
    }
    const markets = await this.markets.findMany(queryParams);
    return markets.map(GetMarketDto.fromEntity);
  }

  @Get(':id')
  @ApiOkResponse({ type: [GetMarketDto] })
  async findOne(@Param('id') id: string) {
    const market = await this.markets.findOne(id);
    if (!market) throw new NotFoundException();
    return GetMarketDto.fromEntity(market);
  }

  @Patch(':id')
  @ApiOkResponse({ type: [GetMarketDto] })
  async update(@Param('id') id: string, @Body() dto: UpdateMarketDto) {
    const market = await this.markets.update(id, dto);
    if (!market) throw new NotFoundException();
    return GetMarketDto.fromEntity(market);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.markets.remove(id);
  }

  @Post(':id/image-upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param() params: UploadMarketImageParamDto,
    @Body() body: UploadMarketImageBodyDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * oneMegabyteInBytes }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const market = await this.markets.findOne(params.id);
    if (!market) throw new NotFoundException('Market not found');
    const updatedMarket = await this.markets.uploadImage(
      market,
      file,
      body.imageDescription,
    );
    return GetMarketDto.fromEntity(updatedMarket);
  }
}
