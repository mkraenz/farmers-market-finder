import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
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
import { MarketsService } from './markets.service';

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
  // @ApiQuery({
  //   name: 'lat',
  //   type: Number,
  //   description:
  //     'Latitude of coordinate in which area you want to search. If provided, also long is required',
  // })
  // @ApiQuery({ name: 'long', type: Number })
  // @ApiQuery({ name: 'radiusinkm', type: Number, required: false })
  // @ApiQuery({ name: 'limit', type: Number, required: false })
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
      console.log('queryParams is instance of FindNearestMarketsDto');
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
}
