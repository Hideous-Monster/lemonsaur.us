import { NextResponse } from "next/server";
import { generateGuestName } from "@/lib/guest-name";

const DISCORD_API = "https://discord.com/api/v10";

// Emoji per app/command. Matches the Lemon 95 desktop icons where applicable.
// Falls back to ⚡ for anything not listed.
const EVENT_EMOJI: Record<string, string> = {
	doom: "💀",
	matrix: "🐇",
	tetris: "🧱",
	snake: "🐍",
	pong: "🏓",
	fortune: "🔮",
	hack: "💻",
	neofetch: "🖥️",
	weather: "🌤",
	irc: "💬",
	messenger: "🦋",
	create: "🎨",
	upgrade: "🎉",
	blog: "📰",
	about: "👤",
	links: "🌐",
	cat: "📄",
	ls: "📂",
	cd: "📁",
	pwd: "📍",
	clear: "🧹",
	help: "❓",
};

function emojiFor(name: string): string {
	return EVENT_EMOJI[name.toLowerCase()] ?? "⚡";
}

function titleCase(s: string): string {
	return s
		.split(/[\s_-]+/)
		.filter(Boolean)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
		.join(" ");
}

function deriveAnonLabel(sessionId: string): string {
	return generateGuestName(sessionId);
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

async function postToThread(botToken: string, threadId: string, content: string): Promise<boolean> {
	try {
		const res = await fetch(`${DISCORD_API}/channels/${threadId}/messages`, {
			method: "POST",
			headers: {
				Authorization: `Bot ${botToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ content }),
		});
		return res.ok;
	} catch (err) {
		console.error("Telemetry post error:", err);
		return false;
	}
}

async function renameThread(botToken: string, threadId: string, name: string): Promise<void> {
	try {
		await fetch(`${DISCORD_API}/channels/${threadId}`, {
			method: "PATCH",
			headers: {
				Authorization: `Bot ${botToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name }),
		});
	} catch (err) {
		console.error("Telemetry thread rename error:", err);
	}
}

interface EventPayload {
	sessionId: string;
	threadId?: string | null;
	userLabel?: string | null;
	event: string;
	data?: Record<string, unknown>;
}

function formatEvent(event: string, data: Record<string, unknown> | undefined): string | null {
	switch (event) {
		case "session_start":
			// Seed post when the thread is created covers this.
			return null;
		case "command_run": {
			const name = typeof data?.name === "string" ? data.name : "unknown";
			const raw = typeof data?.raw === "string" ? data.raw.trim() : "";
			const display = raw || name;
			return `- ${emojiFor(name)} ran \`${display}\``;
		}
		case "doom_exit": {
			const seconds = typeof data?.durationSeconds === "number" ? data.durationSeconds : null;
			return seconds != null ? `- 💀 played DOOM for ${seconds}s` : `- 💀 exited DOOM`;
		}
		case "chat_opened":
			return `- 💬 opened chat`;
		case "lemon95_upgrade":
			return `- 🎉 upgraded to Lemon 95!`;
		case "app_open": {
			const name = typeof data?.name === "string" ? data.name : "an app";
			const title = typeof data?.title === "string" && data.title ? data.title : titleCase(name);
			return `- ${emojiFor(name)} opened **${title}**`;
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

	// Silently succeed if telemetry is not configured.
	if (!botToken || !channelId) {
		return NextResponse.json({ ok: true });
	}

	const { sessionId, event, data } = body;
	let threadId = typeof body.threadId === "string" && body.threadId ? body.threadId : null;
	let userLabel =
		typeof body.userLabel === "string" && body.userLabel.trim()
			? body.userLabel.trim()
			: deriveAnonLabel(sessionId);

	// Create a thread on first event from this client.
	if (!threadId) {
		const newThreadId = await createThread(botToken, channelId, userLabel);
		if (!newThreadId) {
			return NextResponse.json({ error: "thread create failed" }, { status: 502 });
		}
		threadId = newThreadId;
		// The thread-creation message covers session_start; skip a duplicate post.
		if (event === "session_start") {
			return NextResponse.json({ threadId, userLabel });
		}
	}

	// Identify: log the transition, rename the thread, and return the new label.
	if (event === "identify" && typeof data?.nick === "string" && data.nick.trim()) {
		const oldLabel = userLabel;
		const newLabel = data.nick.trim();
		if (oldLabel !== newLabel) {
			await postToThread(botToken, threadId, `- 🪪 identified as **${newLabel}**`);
			const now = new Date();
			const dateStr = `${now.toISOString().replace("T", " ").slice(0, 16)} UTC`;
			// Fire and forget — renaming isn't critical.
			renameThread(botToken, threadId, `${newLabel} — ${dateStr}`).catch(() => {});
			userLabel = newLabel;
		}
		return NextResponse.json({ threadId, userLabel });
	}

	const msg = formatEvent(event, data);
	if (msg) {
		await postToThread(botToken, threadId, msg);
	}

	return NextResponse.json({ threadId, userLabel });
}
