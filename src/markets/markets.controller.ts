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
} from '@nestjs/common';
import { CreateMarketDto } from './dto/create-market.dto';
import { GetMarketDto } from './dto/get-market.dto';
import { UpdateMarketDto } from './dto/update-market.dto';
import { MarketsService } from './markets.service';

@Controller('markets')
export class MarketsController {
  constructor(private readonly markets: MarketsService) {}

  @Post()
  async create(@Body() dto: CreateMarketDto) {
    const market = await this.markets.create(dto);
    return GetMarketDto.fromEntity(market);
  }

  @Get()
  async findAll() {
    const markets = await this.markets.findAll();
    return markets.map(GetMarketDto.fromEntity);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const market = await this.markets.findOne(id);
    if (!market) throw new NotFoundException();
    return market;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateMarketDto) {
    const market = await this.markets.update(id, dto);
    if (!market) throw new NotFoundException();
    return market;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.markets.remove(id);
  }
}
