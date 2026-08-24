import type { Request, Response } from "express";
import { products } from "../../lib/products.js";

export function getHealth(_request: Request, response: Response) {
  return response.json({ status: "ok", records: products.size });
}
