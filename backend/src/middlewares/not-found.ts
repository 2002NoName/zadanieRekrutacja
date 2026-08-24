import type { Request, Response } from "express";
import { respondWithError } from "../lib/error-response.js";

export function notFound(request: Request, response: Response) {
  return respondWithError(request, response, 404, { systemMessage: "Route not found", userMessage: "Nie znaleziono zasobu." });
}
