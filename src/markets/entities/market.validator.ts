import { z } from 'zod';

export const MarketExtraSchema = z.object({
  images: z
    .array(
      z.object({
        url: z.string().url(),
        description: z.string(),
        key: z.string(),
      }),
    )
    .optional(),
});
