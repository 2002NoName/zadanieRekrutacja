import type { Request, Response } from "express";
import { products } from "../../lib/products.js";
import { respondWithError } from "../../lib/error-response.js";
import { simulateMutationFailure } from "../../lib/simulate-failure.js";

export function removeProduct(request: Request, response: Response) {
  if (simulateMutationFailure(request, response)) return;

  const productId = String(request.params.id);
  return products.delete(productId)
    ? response.status(204).send()
    : respondWithError(request, response, 404, { systemMessage: "Product not found", userMessage: "Produkt nie istnieje." });
}
