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
    const savedMarket = await this.markets.save(market);
    return savedMarket;
  }

  findAll() {
    return this.markets.find();
  }

  findOne(id: string) {
    return this.markets.findOneBy({ id });
  }

  update(id: string, dto: UpdateMarketDto) {
    return `This action updates a #${id} market`;
  }

  async remove(id: string) {
    await this.markets.delete(id);
  }
}
