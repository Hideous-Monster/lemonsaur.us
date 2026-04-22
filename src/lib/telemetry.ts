const SESSION_STORAGE_KEY = "telemetry-session-id";

function getSessionId(): string | null {
	if (typeof window === "undefined") return null;
	try {
		let id = sessionStorage.getItem(SESSION_STORAGE_KEY);
		if (!id) {
			id =
				typeof crypto !== "undefined" && "randomUUID" in crypto
					? crypto.randomUUID()
					: `${Date.now()}-${Math.random().toString(36).slice(2)}`;
			sessionStorage.setItem(SESSION_STORAGE_KEY, id);
		}
		return id;
	} catch {
		return null;
	}
}

export function track(event: string, data?: Record<string, unknown>): void {
	if (typeof window === "undefined") return;
	const sessionId = getSessionId();
	if (!sessionId) return;

	fetch("/api/telemetry", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ sessionId, event, data }),
		keepalive: true,
	}).catch(() => {
		// Telemetry failures must never affect the user.
	});
}
