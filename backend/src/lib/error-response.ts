import type { Request, Response } from "express";
import { applicationLogger } from "./logger.js";
import { requestClientContext } from "./client-context.js";

export type ErrorResponse = { systemMessage: string; userMessage: string };

export function respondWithError(
	request: Request,
	response: Response,
	statusCode: number,
	errorResponse: ErrorResponse,
	error = new Error(errorResponse.systemMessage),
) {
	response.locals.diagnosticError = { error, errorResponse, statusCode };
	const diagnosticFields = {
		err: error,
		error: {
			type: error.name,
			message: error.message,
			stack: error.stack,
			stack_trace: error.stack,
			response: { system_message: errorResponse.systemMessage },
		},
		event: { outcome: "failure", action: request.method },
		http: { response: { status_code: statusCode } },
		req: { method: request.method, url: request.originalUrl },
		...requestClientContext(request),
	};

	if (statusCode >= 500)
		applicationLogger.error(diagnosticFields, "API request failed");
	else applicationLogger.warn(diagnosticFields, "API request rejected");

	return response.status(statusCode).json(errorResponse);
}
