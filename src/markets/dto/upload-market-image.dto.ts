import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const UploadMarketImageBodySchema = z.object({
  imageDescription: z.string().max(255),
});

export class UploadMarketImageBodyDto extends createZodDto(
  UploadMarketImageBodySchema,
) {}

export class UploadMarketImageParamDto extends createZodDto(
  z.object({
    id: z.string().uuid(),
  }),
) {}
