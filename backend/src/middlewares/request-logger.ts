import type { Request, Response } from "express";
import pinoHttp from "pino-http";
import { applicationLogger } from "../lib/logger.js";
import { requestClientContext } from "../lib/client-context.js";

export const requestLogger = pinoHttp({
	logger: applicationLogger,
	customLogLevel: (
		_request: Request,
		response: Response,
		error: Error | undefined,
	) => {
		if (response.locals.diagnosticError) return "silent";
		if (error || response.statusCode >= 500) return "error";
		if (response.statusCode >= 400) return "warn";
		return "info";
	},
	customSuccessObject: (request: Request, response: Response) => ({
		event: {
			outcome: response.statusCode < 400 ? "success" : "failure",
			action: request.method,
		},
		http: { response: { status_code: response.statusCode } },
		req: { method: request.method, url: request.originalUrl },
		...requestClientContext(request),
	}),
	customErrorObject: (
		request: Request,
		response: Response,
		error: Error,
	) => ({
		...(response.locals.diagnosticError
			? {
					err: response.locals.diagnosticError.error,
					error: {
						type: response.locals.diagnosticError.error.name,
						message: response.locals.diagnosticError.error.message,
						stack: response.locals.diagnosticError.error.stack,
						stack_trace:
							response.locals.diagnosticError.error.stack,
						response: {
							system_message:
								response.locals.diagnosticError.errorResponse
									.systemMessage,
						},
					},
				}
			: {}),
		event: { outcome: "failure", action: request.method },
		http: { response: { status_code: response.statusCode } },
		...requestClientContext(request),
		...(response.locals.diagnosticError ? {} : { err: error }),
	}),
});
