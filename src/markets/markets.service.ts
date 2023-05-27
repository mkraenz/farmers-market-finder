import { Injectable } from '@nestjs/common';
import { CreateMarketDto } from './dto/create-market.dto';
import { UpdateMarketDto } from './dto/update-market.dto';
import { MarketRepository } from './markets.repository';

@Injectable()
export class MarketsService {
  constructor(private markets: MarketRepository) {}

  async create(dto: CreateMarketDto) {
    const market = this.markets.create(dto);
    return this.markets.save(market);
  }

  findMany(options?: {
    lat: number;
    long: number;
    radiusInKm: number;
    limit: number;
  }) {
    if (options) return this.markets.findNearby(options);
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
