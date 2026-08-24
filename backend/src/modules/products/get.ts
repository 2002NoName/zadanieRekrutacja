import type { Request, Response } from "express";
import { products } from "../../lib/products.js";
import { respondWithError } from "../../lib/error-response.js";

export function getProduct(request: Request, response: Response) {
  const productId = String(request.params.id);
  const product = products.get(productId);
  return product ? response.json({ data: product }) : respondWithError(request, response, 404, { systemMessage: "Product not found", userMessage: "Produkt nie istnieje." });
}
