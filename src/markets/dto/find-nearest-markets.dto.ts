import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const FindNearestMarketsSchema = z.object({
  long: z.coerce.number().min(-180).max(180).describe('Longitude'),
  lat: z.coerce.number().min(-90).max(90).describe('Latitude'),
  limit: z.coerce
    .number()
    .max(20)
    .default(10)
    .describe('Maximum number of results'),
  radiusInKm: z.coerce
    .number()
    .max(100000)
    .default(30)
    .describe('Search radius in kilometers from the given coordinates'),
});

export class FindNearestMarketsDto extends createZodDto(
  FindNearestMarketsSchema,
) {}
