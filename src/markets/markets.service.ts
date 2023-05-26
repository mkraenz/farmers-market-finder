import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMarketDto } from './dto/create-market.dto';
import { UpdateMarketDto } from './dto/update-market.dto';
import { Market } from './entities/market.entity';

@Injectable()
export class MarketsService {
  constructor(
    @InjectRepository(Market)
    private markets: Repository<Market>,
  ) {}

  async create(dto: CreateMarketDto) {
    const market = this.markets.create(dto);
    return this.markets.save(market);
  }

  findAll() {
    return this.markets.find();
  }

  findOne(id: string) {
    return this.markets.findOneBy({ id });
  }

  async update(id: string, dto: UpdateMarketDto) {
    const market = await this.markets.findOneBy({ id });
    if (!market) return null;
    const updatedMarket = this.markets.merge(market, dto);
    return this.markets.save(updatedMarket);
  }

  async remove(id: string) {
    await this.markets.delete(id);
  }
}
