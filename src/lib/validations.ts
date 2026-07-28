import { z } from "zod";

export const priceRequestSchema = z.object({
  productId: z.number().int().positive(),
  options: z.record(z.string(), z.string()),
});

export type PriceRequest = z.infer<typeof priceRequestSchema>;
