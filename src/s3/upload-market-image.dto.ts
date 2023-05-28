import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const UploadMarketImageSchema = z.object({
  marketId: z.string().uuid(),
});

export class UploadMarketImageDto extends createZodDto(
  UploadMarketImageSchema,
) {}
