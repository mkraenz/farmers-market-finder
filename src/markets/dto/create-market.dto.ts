import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const CreateMarketSchema = z.object({
  address: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    long: z.number().min(-180).max(180),
  }),
  zip: z.string().min(5).max(5),
  products: z
    .array(z.string())
    .refine((items) => new Set(items).size === items.length, {
      message: 'Must be an array of unique strings',
    }),
});

export class CreateMarketDto extends createZodDto(CreateMarketSchema) {}
