import { headers } from "next/headers";
import { NextResponse } from "next/server";

const DISCORD_API = "https://discord.com/api/v10";

// In-memory rate limit: IP -> last connect timestamp
const connectRateLimit = new Map<string, number>();

// Clean up old entries every 10 minutes
setInterval(
	() => {
		const cutoff = Date.now() - 30 * 1000;
		for (const [ip, ts] of connectRateLimit.entries()) {
			if (ts < cutoff) connectRateLimit.delete(ip);
		}
	},
	10 * 60 * 1000,
);

function getClientIp(headersList: Awaited<ReturnType<typeof headers>>): string {
	return (
		headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
		headersList.get("x-real-ip") ??
		"unknown"
	);
}

async function isThreadActive(botToken: string, threadId: string): Promise<boolean> {
	try {
		const res = await fetch(`${DISCORD_API}/channels/${threadId}`, {
			headers: { Authorization: `Bot ${botToken}` },
		});
		if (!res.ok) return false;
		const thread = await res.json();
		return !thread.archived && !thread.locked;
	} catch {
		return false;
	}
}

export async function POST(request: Request) {
	const body = await request.json().catch(() => null);

	if (!body || typeof body.nick !== "string" || !body.nick.trim()) {
		return NextResponse.json({ error: "nick is required" }, { status: 400 });
	}

	const nick = body.nick.trim().slice(0, 32);
	const existingThreadId: string | null =
		typeof body.threadId === "string" && body.threadId.trim() ? body.threadId.trim() : null;

	// Rate limiting: 1 connection per IP per 30 seconds
	const headersList = await headers();
	const ip = getClientIp(headersList);
	const lastConnect = connectRateLimit.get(ip);
	const now = Date.now();

	if (process.env.NODE_ENV !== "development" && lastConnect && now - lastConnect < 30 * 1000) {
		const waitSeconds = Math.ceil((30 * 1000 - (now - lastConnect)) / 1000);
		return NextResponse.json(
			{ error: `Rate limited. Please wait ${waitSeconds} seconds before reconnecting.` },
			{ status: 429 },
		);
	}

	const botToken = process.env.DISCORD_BOT_TOKEN;
	const forumChannelId = process.env.DISCORD_FORUM_CHANNEL_ID;
	const ownerId = process.env.DISCORD_OWNER_ID;

	if (!botToken || !forumChannelId || !ownerId) {
		return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
	}

	// Try to reuse an existing thread if one was provided
	if (existingThreadId) {
		const active = await isThreadActive(botToken, existingThreadId);
		if (active) {
			connectRateLimit.set(ip, now);
			return NextResponse.json({
				sessionId: `${ip}:${existingThreadId}`,
				threadId: existingThreadId,
			});
		}
	}

	// Create a new forum thread
	const now2 = new Date();
	const dateStr = `${now2.toISOString().replace("T", " ").slice(0, 16)} UTC`;
	const threadName = `IRC: ${nick} — ${dateStr}`;

	const threadRes = await fetch(`${DISCORD_API}/channels/${forumChannelId}/threads`, {
		method: "POST",
		headers: {
			Authorization: `Bot ${botToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: threadName,
			message: {
				content: `**${nick}** has connected from lemonsaur.us`,
			},
		}),
	});

	if (!threadRes.ok) {
		const err = await threadRes.text();
		console.error("Discord thread creation failed:", err);
		return NextResponse.json({ error: "Failed to create chat session" }, { status: 502 });
	}

	const thread = await threadRes.json();
	const threadId: string = thread.id;

	connectRateLimit.set(ip, now);

	// DM the owner about the new connection
	const dmChannelRes = await fetch(`${DISCORD_API}/users/@me/channels`, {
		method: "POST",
		headers: {
			Authorization: `Bot ${botToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ recipient_id: ownerId }),
	});

	if (dmChannelRes.ok) {
		const dmChannel = await dmChannelRes.json();
		const guildId = process.env.DISCORD_GUILD_ID;
		const threadLink = guildId
			? `https://discord.com/channels/${guildId}/${threadId}`
			: `(thread ID: ${threadId})`;

		await fetch(`${DISCORD_API}/channels/${dmChannel.id}/messages`, {
			method: "POST",
			headers: {
				Authorization: `Bot ${botToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				content: `👋 **${nick}** just connected to your IRC chat from lemonsaur.us!\n${threadLink}`,
			}),
		}).catch((e) => console.error("Failed to DM owner:", e));
	}

	return NextResponse.json({ sessionId: `${ip}:${threadId}`, threadId });
}
