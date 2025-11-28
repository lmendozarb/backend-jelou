import { z } from 'zod';

export const createProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  priceCents: z.number().int().positive(),
  stock: z.number().int().nonnegative()
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
