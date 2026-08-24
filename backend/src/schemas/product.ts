import { z } from "zod";

export const productInput = z.object({
  name: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(80),
  price: z.number().finite().nonnegative().max(1_000_000),
  stock: z.number().int().nonnegative().max(1_000_000),
});

export type ProductInput = z.infer<typeof productInput>;

export const productListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().max(120).optional(),
});
