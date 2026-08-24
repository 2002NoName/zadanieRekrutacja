import type { Request, Response } from "express";
import { respondWithError } from "./error-response.js";

export function simulateMutationFailure(request: Request, response: Response) {
	if (
		process.env.ENABLE_FAILURE_SIMULATION !== "true" ||
		request.get("x-simulate-failure") !== "true"
	)
		return false;

	const error = new Error("Simulated mutation failure");
	respondWithError(
		request,
		response,
		500,
		{
			systemMessage: error.message,
			userMessage: "Symulowany błąd zapisu. Spróbuj ponownie.",
		},
		error,
	);
	return true;
}
