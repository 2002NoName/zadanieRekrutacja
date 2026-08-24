import type { Request, Response } from "express";
import { nextProductId, products } from "../../lib/products.js";
import { respondWithError } from "../../lib/error-response.js";
import { simulateMutationFailure } from "../../lib/simulate-failure.js";
import { productInput } from "../../schemas/product.js";

export function createProduct(request: Request, response: Response) {
  if (simulateMutationFailure(request, response)) return;

  const parsed = productInput.safeParse(request.body);
  if (!parsed.success) return respondWithError(request, response, 400, { systemMessage: "Invalid product payload", userMessage: "Dane produktu są nieprawidłowe." });

  const now = new Date().toISOString();
  const product = { ...parsed.data, id: nextProductId(), createdAt: now, updatedAt: now };
  products.set(product.id, product);
  return response.status(201).json({ data: product });
}
