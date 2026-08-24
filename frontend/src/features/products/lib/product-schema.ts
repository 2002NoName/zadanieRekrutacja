import { z } from "zod";

export const productSchema = z.object({
	name: z.string().trim().min(2, "Enter a product name.").max(120),
	category: z.string().trim().min(2, "Enter a category.").max(80),
	price: z.coerce
		.number()
		.finite()
		.nonnegative("Price must be zero or higher.")
		.max(1_000_000, "Price cannot exceed 1,000,000."),
	stock: z.coerce
		.number()
		.int()
		.nonnegative("Stock must be a whole number.")
		.max(1_000_000, "Stock cannot exceed 1,000,000."),
});

export type ProductPayload = z.infer<typeof productSchema>;
