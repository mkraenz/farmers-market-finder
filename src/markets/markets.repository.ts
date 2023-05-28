import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Market } from './entities/market.entity';

@Injectable()
export class MarketRepository extends Repository<Market> {
  constructor(private dataSource: DataSource) {
    super(Market, dataSource.createEntityManager());
  }

  async findNearby({
    lat,
    long,
    radiusInKm: radius,
    limit,
  }: {
    lat: number;
    long: number;
    radiusInKm: number;
    limit: number;
  }): Promise<Market[]> {
    const alias = 'market';
    const result = await this.createQueryBuilder(alias)
      // WORKAROUND for virtual property market.distance
      // inspired by first solution in https://pietrzakadrian.com/blog/virtual-column-solutions-for-typeorm
      .addSelect(
        'ST_DistanceSphere(location, ST_MakePoint(:long, :lat)) / 1000',
        `${alias}_distance`, // must be prefixed with entity alias
      )
      .where(
        'ST_DistanceSphere(location, ST_MakePoint(:long, :lat)) <= :radius * 1000',
        { lat, long, radius },
      )
      .orderBy('ST_DistanceSphere(location, ST_MakePoint(:long, :lat))', 'ASC')
      .limit(limit)
      .getMany();
    return result;
  }
}
