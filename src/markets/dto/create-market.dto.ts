import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const CreateMarketSchema = z.object({
  address: z.string().describe('Street and house number'),
  city: z.string().describe('City or Township'),
  state: z.string().describe('Which state in the given country'),
  country: z.string().describe('Which country'),
  location: z
    .object({
      lat: z.number().min(-90).max(90).describe('latitude'),
      long: z.number().min(-180).max(180).describe('longitude'),
    })
    .describe('GPS coordinates'),
  zip: z.string().min(5).max(5).describe('postal code'),
  products: z
    .array(z.string())
    .refine((items) => new Set(items).size === items.length, {
      message: 'Must be an array of unique strings',
    })
    .describe('what products are typically offered here'),
});

export class CreateMarketDto extends createZodDto(CreateMarketSchema) {}
