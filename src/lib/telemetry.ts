const SESSION_ID_KEY = "telemetry-session-id";
const THREAD_ID_KEY = "telemetry-thread-id";
const USER_LABEL_KEY = "telemetry-user-label";

function readLocal(key: string): string | null {
	if (typeof window === "undefined") return null;
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

function writeLocal(key: string, value: string): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(key, value);
	} catch {
		// ignore
	}
}

function getOrCreateSessionId(): string | null {
	if (typeof window === "undefined") return null;
	let id = readLocal(SESSION_ID_KEY);
	if (!id) {
		id =
			typeof crypto !== "undefined" && "randomUUID" in crypto
				? crypto.randomUUID()
				: `${Date.now()}-${Math.random().toString(36).slice(2)}`;
		writeLocal(SESSION_ID_KEY, id);
	}
	return id;
}

// Serialize all telemetry requests. This matters during startup: the first
// request creates the thread, and subsequent ones need the returned threadId
// to land in localStorage before they fire.
let pending: Promise<unknown> = Promise.resolve();

export function track(event: string, data?: Record<string, unknown>): void {
	if (typeof window === "undefined") return;
	const sessionId = getOrCreateSessionId();
	if (!sessionId) return;

	pending = pending
		.then(async () => {
			const threadId = readLocal(THREAD_ID_KEY);
			const userLabel = readLocal(USER_LABEL_KEY);

			const res = await fetch("/api/telemetry", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ sessionId, threadId, userLabel, event, data }),
				keepalive: true,
			});

			if (!res.ok) return;
			const body = (await res.json().catch(() => null)) as {
				threadId?: string;
				userLabel?: string;
			} | null;

			if (body?.threadId) writeLocal(THREAD_ID_KEY, body.threadId);
			if (body?.userLabel) writeLocal(USER_LABEL_KEY, body.userLabel);
		})
		.catch(() => {
			// Telemetry failures must never affect the user.
		});
}
