const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function apiRequest(
	path: string,
	options?: RequestInit,
	simulateFailure = false,
) {
	const response = await fetch(`${API_URL}${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...(simulateFailure ? { "X-Simulate-Failure": "true" } : {}),
		},
	});
	if (!response.ok) {
		const body = await response.text();
		let message = body || "Request failed.";
		try {
			message =
				(JSON.parse(body) as { userMessage?: string }).userMessage ??
				message;
		} catch {}
		throw new Error(message);
	}
	return response.status === 204 ? null : response.json();
}
