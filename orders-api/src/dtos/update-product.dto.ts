import { z } from 'zod';

export const updateProductSchema = z.object({
  priceCents: z.number().int().positive().optional(),
  stock: z.number().int().nonnegative().optional()
});

export type UpdateProductDto = z.infer<typeof updateProductSchema>;
