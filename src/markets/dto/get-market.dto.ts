import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Market } from '../entities/market.entity';

const schema = z.object({
  id: z.string(),
  name: z.string(),
  teaser: z.string(),
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
  distance: z.number().optional().describe('Distance in kilometers'),
  images: z
    .array(z.object({ url: z.string(), description: z.string() }))
    .optional(),
});
type Schema = z.infer<typeof schema>;

export class GetMarketDto extends createZodDto(schema) {
  static fromEntity(entity: Market) {
    const data: Schema = {
      ...entity,
      distance: entity.distance ?? undefined,
      location: {
        lat: entity.location.lat,
        long: entity.location.long,
      },
    };
    const result = schema.safeParse(data);
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  }
}
