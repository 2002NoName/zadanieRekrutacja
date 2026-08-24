import type { Request, Response } from "express";
import { products } from "../../lib/products.js";
import { respondWithError } from "../../lib/error-response.js";
import { simulateMutationFailure } from "../../lib/simulate-failure.js";
import { productInput } from "../../schemas/product.js";

export function updateProduct(request: Request, response: Response) {
  if (simulateMutationFailure(request, response)) return;

  const productId = String(request.params.id);
  const existing = products.get(productId);
  if (!existing) return respondWithError(request, response, 404, { systemMessage: "Product not found", userMessage: "Produkt nie istnieje." });

  const parsed = productInput.safeParse(request.body);
  if (!parsed.success) return respondWithError(request, response, 400, { systemMessage: "Invalid product payload", userMessage: "Dane produktu są nieprawidłowe." });

  const product = { ...existing, ...parsed.data, updatedAt: new Date().toISOString() };
  products.set(product.id, product);
  return response.json({ data: product });
}
