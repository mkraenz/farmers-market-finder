import { createZodDto } from 'nestjs-zod';
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
  country: z.string(),
  products: z.array(z.string()),
});

export class GetMarketDto extends createZodDto(schema) {
  static fromEntity(entity: Market) {
    const result = schema.safeParse(entity);
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  }
}
