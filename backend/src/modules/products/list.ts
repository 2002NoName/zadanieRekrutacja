import type { Request, Response } from "express";
import { products } from "../../lib/products.js";
import { respondWithError } from "../../lib/error-response.js";
import { productListQuery } from "../../schemas/product.js";

export function listProducts(request: Request, response: Response) {
	const query = productListQuery.safeParse(request.query);
	if (!query.success)
		return respondWithError(request, response, 400, {
			systemMessage: "Invalid pagination parameters",
			userMessage: "Sprawdź parametry paginacji.",
		});

	const { page, limit, search } = query.data;
	const filtered = [...products.values()].filter(
		(product) =>
			!search ||
			`${product.name} ${product.category}`
				.toLowerCase()
				.includes(search.toLowerCase()),
	);
	const items = filtered.slice((page - 1) * limit, page * limit);

	return response.json({
		data: items,
		meta: {
			page,
			limit,
			total: filtered.length,
			totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
		},
	});
}
