import { z } from 'zod';
import { Market } from '../entities/market.entity';

const schema = z.object({
  id: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  location: z.object({
    lat: z.number(),
    long: z.number(),
  }),
  zip: z.string(),
  products: z.array(z.string()),
});

export class GetMarketDto {
  static fromEntity(entity: Market) {
    const result = schema.safeParse(entity);
    return result;
  }
}
