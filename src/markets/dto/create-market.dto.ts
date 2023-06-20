import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const CreateMarketSchema = z.object({
  name: z.string().min(3).max(60).describe('Name of the market'),
  teaser: z.string().min(5).max(200).describe('Short description'),
  address: z.string().describe('Street and house number'),
  city: z.string().describe('City or Township'),
  state: z.string().describe('Which state in the given country'),
  country: z.string().describe('Which country'),
  location: z
    .object({
      lat: z.number().min(-90).max(90).describe('Latitude'),
      long: z.number().min(-180).max(180).describe('Longitude'),
    })
    // .transform((data) => ({
    //   type: 'Point' as const,
    //   coordinates: [data.long, data.lat],
    // }))
    .describe('GPS coordinates'),
  zip: z.string().min(5).max(5).describe('Postal code'),
  products: z
    .array(z.string())
    .refine((items) => new Set(items).size === items.length, {
      message: 'Must be an array of unique strings',
    })
    .describe('What products are typically offered here'),
});

export class CreateMarketDto extends createZodDto(CreateMarketSchema) {}

type Schema = z.infer<typeof CreateMarketSchema>;
export type CreateMarketApiInput = {
  [key in keyof Omit<Schema, 'location'>]: Schema[key];
} & {
  location: {
    lat: number;
    long: number;
  };
};
