import type { NextFunction, Request, Response } from "express";
import { respondWithError } from "../lib/error-response.js";

export function errorHandler(
	error: unknown,
	request: Request,
	response: Response,
	_next: NextFunction,
) {
	void _next;
	const normalizedError =
		error instanceof Error
			? error
			: new Error("Unhandled application error");
	const candidateStatus =
		typeof error === "object" && error !== null && "status" in error
			? Number(error.status)
			: 500;
	const statusCode =
		Number.isInteger(candidateStatus) &&
		candidateStatus >= 400 &&
		candidateStatus < 500
			? candidateStatus
			: 500;
	const systemMessage =
		statusCode < 500 ? "Invalid request" : "Unhandled application error";
	return respondWithError(
		request,
		response,
		statusCode,
		{
			systemMessage,
			userMessage:
				statusCode < 500
					? "Żądanie jest nieprawidłowe."
					: "Wystąpił błąd aplikacji.",
		},
		normalizedError,
	);
}
