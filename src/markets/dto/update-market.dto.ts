import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const UpdateMarketSchema = z.object({
  name: z.string().min(3).max(60).optional().describe('Name of the market'),
  teaser: z.string().min(5).max(200).describe('Short description'),
  address: z.string().optional().describe('Street and house number'),
  city: z.string().optional().describe('City or Township'),
  state: z.string().optional().describe('Which state in the given country'),
  country: z.string().optional().describe('Which country'),
  location: z
    .object({
      lat: z.number().min(-90).max(90).describe('Latitude'),
      long: z.number().min(-180).max(180).describe('Longitude'),
    })
    .optional()
    // .transform((data) => {
    //   if (!data) return undefined;
    //   return {
    //     type: 'Point' as const,
    //     coordinates: [data.long, data.lat],
    //   };
    // })
    .describe('GPS coordinates'),
  zip: z.string().min(5).max(5).optional().describe('Postal code'),
  products: z
    .array(z.string())
    .optional()
    .refine(
      (items) => {
        if (!items) return true;
        return new Set(items).size === items.length;
      },
      {
        message: 'Must be an array of unique strings',
      },
    )
    .describe('What products are typically offered here'),
  images: z
    .array(
      z.object({
        url: z.string().url().describe('Storage URL to the image'),
        description: z.string().describe('Description of the image'),
      }),
    )
    .optional()
    .describe('Images of the market'),
});

export class UpdateMarketDto extends createZodDto(UpdateMarketSchema) {}

type Schema = z.infer<typeof UpdateMarketSchema>;
export type UpdateMarketApiInput = {
  [key in keyof Omit<Schema, 'location'>]: Schema[key];
} & {
  location?: {
    lat: number;
    long: number;
  };
};
