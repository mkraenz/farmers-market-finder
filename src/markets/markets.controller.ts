import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateMarketDto } from './dto/create-market.dto';
import { UpdateMarketDto } from './dto/update-market.dto';
import { MarketsService } from './markets.service';

@Controller('markets')
export class MarketsController {
  constructor(private readonly markets: MarketsService) {}

  @Post()
  create(@Body() dto: CreateMarketDto) {
    return this.markets.create(dto);
  }

  @Get()
  findAll() {
    return this.markets.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.markets.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMarketDto) {
    return this.markets.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.markets.remove(id);
  }
}
