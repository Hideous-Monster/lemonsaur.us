import { NextResponse } from "next/server";

// In-memory rate limit per session: sessionId -> { lastSent, count }
const sendRateLimit = new Map<string, { lastSent: number; count: number }>();

// Clean up old entries periodically
setInterval(
	() => {
		const cutoff = Date.now() - 10 * 60 * 1000;
		for (const [id, data] of sendRateLimit.entries()) {
			if (data.lastSent < cutoff) sendRateLimit.delete(id);
		}
	},
	10 * 60 * 1000,
);

export async function POST(request: Request) {
	const body = await request.json().catch(() => null);

	if (
		!body ||
		typeof body.threadId !== "string" ||
		typeof body.nick !== "string" ||
		typeof body.message !== "string"
	) {
		return NextResponse.json(
			{ error: "threadId, nick, and message are required" },
			{ status: 400 },
		);
	}

	const { threadId, nick, message } = body as { threadId: string; nick: string; message: string };

	if (!threadId.trim() || !nick.trim() || !message.trim()) {
		return NextResponse.json(
			{ error: "threadId, nick, and message must not be empty" },
			{ status: 400 },
		);
	}

	if (message.length > 2000) {
		return NextResponse.json({ error: "Message too long (max 2000 chars)" }, { status: 400 });
	}

	const sessionId = threadId;
	const now = Date.now();
	const existing = sendRateLimit.get(sessionId);

	// Max 1 message per 2 seconds
	if (process.env.NODE_ENV !== "development" && existing && now - existing.lastSent < 2000) {
		return NextResponse.json(
			{ error: "You are sending messages too fast. Please wait." },
			{ status: 429 },
		);
	}

	// Max 100 messages per session
	if (existing && existing.count >= 100) {
		return NextResponse.json(
			{ error: "Session message limit reached (100 messages max)." },
			{ status: 429 },
		);
	}

	const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
	if (!webhookUrl) {
		return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
	}

	const res = await fetch(`${webhookUrl}?thread_id=${threadId}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			content: message,
			username: nick.slice(0, 32),
			avatar_url: "https://lemonsaur.us/images/lemon_87.png",
		}),
	});

	if (!res.ok) {
		const err = await res.text();
		console.error("Discord webhook send failed:", err);
		return NextResponse.json({ error: "Failed to send message" }, { status: 502 });
	}

	// Update rate limit tracking
	sendRateLimit.set(sessionId, {
		lastSent: now,
		count: (existing?.count ?? 0) + 1,
	});

	return NextResponse.json({ ok: true });
}
