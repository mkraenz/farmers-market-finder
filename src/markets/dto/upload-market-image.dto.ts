import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const UploadMarketImageSchema = z.object({
  marketId: z.string().uuid(),
  imageDescription: z.string().max(255),
});

export class UploadMarketImageDto extends createZodDto(
  UploadMarketImageSchema,
) {}
