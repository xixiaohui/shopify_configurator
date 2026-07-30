import { z } from "zod";

export const priceRequestSchema = z.object({
  productId: z.number().int().positive(),
  options: z.record(z.string(), z.string()),
});

export type PriceRequest = z.infer<typeof priceRequestSchema>;

export const recommendationItemSchema = z.object({
  sku: z.string().min(1),
  reason: z.string().min(1),
});

export const recommendationsSchema = z.array(recommendationItemSchema);
