import type { ProductInput } from "../schemas/product.js";

export type Product = ProductInput & {
	id: string;
	createdAt: string;
	updatedAt: string;
};

export const products = new Map<string, Product>();
let productSequence = 0;

for (let index = 1; index <= 2000; index += 1) {
	const now = new Date().toISOString();
	products.set(String(index), {
		id: String(index),
		name: `Product ${index}`,
		category: index % 2 ? "Hardware" : "Software",
		price: Number((9.99 + index * 0.73).toFixed(2)),
		stock: index % 97,
		createdAt: now,
		updatedAt: now,
	});
	productSequence = index;
}

export function nextProductId() {
	productSequence += 1;
	return String(productSequence);
}
