import { NextResponse } from "next/server";

const DISCORD_API = "https://discord.com/api/v10";

interface SessionState {
	userLabel: string;
	threadId: string;
	lastSeen: number;
	creating?: Promise<string | null>;
}

// sessionId -> thread bookkeeping
const sessions = new Map<string, SessionState>();

// Counter for anonymous labels. Resets on server restart, which is fine.
let anonCounter = 0;

// Evict sessions idle for over 6 hours every 30 min
setInterval(
	() => {
		const cutoff = Date.now() - 6 * 60 * 60 * 1000;
		for (const [id, s] of sessions.entries()) {
			if (s.lastSeen < cutoff) sessions.delete(id);
		}
	},
	30 * 60 * 1000,
);

function nextAnonLabel(): string {
	anonCounter += 1;
	return `anonymous_user_${String(anonCounter).padStart(2, "0")}`;
}

async function createThread(
	botToken: string,
	channelId: string,
	label: string,
): Promise<string | null> {
	const now = new Date();
	const dateStr = `${now.toISOString().replace("T", " ").slice(0, 16)} UTC`;
	const threadName = `${label} — ${dateStr}`;

	try {
		const res = await fetch(`${DISCORD_API}/channels/${channelId}/threads`, {
			method: "POST",
			headers: {
				Authorization: `Bot ${botToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name: threadName,
				message: { content: `👋 **${label}** hopped onto lemonsaur.us` },
			}),
		});
		if (!res.ok) {
			console.error("Telemetry thread creation failed:", res.status, await res.text());
			return null;
		}
		const thread = await res.json();
		return thread.id as string;
	} catch (err) {
		console.error("Telemetry thread creation error:", err);
		return null;
	}
}

async function postToThread(
	botToken: string,
	threadId: string,
	content: string,
): Promise<void> {
	try {
		await fetch(`${DISCORD_API}/channels/${threadId}/messages`, {
			method: "POST",
			headers: {
				Authorization: `Bot ${botToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ content }),
		});
	} catch (err) {
		console.error("Telemetry post error:", err);
	}
}

interface EventPayload {
	sessionId: string;
	event: string;
	data?: Record<string, unknown>;
}

function formatEvent(
	event: string,
	data: Record<string, unknown> | undefined,
	label: string,
): string | null {
	switch (event) {
		case "session_start":
			// Thread creation message already covers this.
			return null;
		case "command_run": {
			const name = typeof data?.name === "string" ? data.name : "unknown";
			return `⚡ **${label}** ran the \`${name}\` command`;
		}
		case "doom_exit": {
			const seconds = typeof data?.durationSeconds === "number" ? data.durationSeconds : null;
			return seconds != null
				? `🎮 **${label}** played DOOM for ${seconds}s`
				: `🎮 **${label}** exited DOOM`;
		}
		case "chat_opened":
			return `💬 **${label}** opened chat`;
		case "lemon95_upgrade":
			return `🎉 **${label}** upgraded to Lemon 95!`;
		case "app_open": {
			const name = typeof data?.name === "string" ? data.name : "an app";
			return `🪟 **${label}** opened the ${name} app`;
		}
		default:
			return null;
	}
}

export async function POST(request: Request) {
	const body = (await request.json().catch(() => null)) as EventPayload | null;

	if (!body || typeof body.sessionId !== "string" || typeof body.event !== "string") {
		return NextResponse.json({ error: "sessionId and event required" }, { status: 400 });
	}

	const botToken = process.env.DISCORD_BOT_TOKEN;
	const channelId = process.env.DISCORD_TELEMETRY_CHANNEL_ID;

	// Silently succeed if telemetry is not configured — don't break the client.
	if (!botToken || !channelId) {
		return NextResponse.json({ ok: true });
	}

	const { sessionId, event, data } = body;

	let session = sessions.get(sessionId);

	if (!session) {
		const label = nextAnonLabel();
		const creating = createThread(botToken, channelId, label);
		session = { userLabel: label, threadId: "", lastSeen: Date.now(), creating };
		sessions.set(sessionId, session);

		const threadId = await creating;
		session.creating = undefined;

		if (!threadId) {
			sessions.delete(sessionId);
			return NextResponse.json({ error: "thread create failed" }, { status: 502 });
		}
		session.threadId = threadId;
	} else if (session.creating) {
		// Another request for this session is still creating the thread. Wait.
		await session.creating;
	}

	session.lastSeen = Date.now();

	// Identify: rename the session label and log the transition.
	if (event === "identify" && typeof data?.nick === "string" && data.nick.trim()) {
		const oldLabel = session.userLabel;
		const newLabel = data.nick.trim();
		if (oldLabel !== newLabel) {
			await postToThread(
				botToken,
				session.threadId,
				`🪪 **${oldLabel}** identified themselves as **${newLabel}**`,
			);
			session.userLabel = newLabel;
		}
		return NextResponse.json({ ok: true });
	}

	const msg = formatEvent(event, data, session.userLabel);
	if (msg) {
		await postToThread(botToken, session.threadId, msg);
	}

	return NextResponse.json({ ok: true });
}
