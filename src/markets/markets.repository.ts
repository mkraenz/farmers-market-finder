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
    radius,
    limit,
  }: {
    lat: number;
    long: number;
    radius: number;
    limit: number;
  }): Promise<Market[]> {
    const result = await this.createQueryBuilder()
      .where(
        'ST_DistanceSphere(point, ST_MakePoint(:long, :lat)) <= :radius * 1000',
        { lat, long, radius },
      )
      .orderBy('ST_DistanceSphere(point, ST_MakePoint(:long, :lat))', 'ASC')
      .limit(limit)
      .getMany();
    return result;
    // const result = await this.createQueryBuilder()
    //   .where(
    //     `
    //     SELECT *, ST_DistanceSphere(location, ST_MakePoint(:long, :lat)) as distance
    //     FROM market
    //     WHERE ST_DistanceSphere(location, ST_MakePoint(:long, :lat)) <= :radius * 1000
    //     ORDER BY distance
    //     LIMIT :limit
    //     `,
    //     { lat, long, radius, limit },
    //   )
    //   .getManyAndCount();
  }
}
