import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { CARLA_SYSTEM_PROMPT } from "@/lib/carla-prompt";

const GEMINI_API_URL =
	"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DISCORD_API = "https://discord.com/api/v10";

// In-memory rate limit: IP -> { count, windowStart }
const chatRateLimit = new Map<string, { count: number; windowStart: number }>();

// Clean up stale entries every 5 minutes
setInterval(
	() => {
		const cutoff = Date.now() - 60 * 1000;
		for (const [ip, data] of chatRateLimit.entries()) {
			if (data.windowStart < cutoff) chatRateLimit.delete(ip);
		}
	},
	5 * 60 * 1000,
);

function getClientIp(headersList: Awaited<ReturnType<typeof headers>>): string {
	return (
		headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
		headersList.get("x-real-ip") ??
		"unknown"
	);
}

interface ChatMessage {
	role: "user" | "assistant";
	content: string;
}

interface GeminiContent {
	role: "user" | "model";
	parts: Array<{ text: string }>;
}

async function callGemini(apiKey: string, messages: ChatMessage[]): Promise<string | null> {
	const contents: GeminiContent[] = messages.map((m) => ({
		role: m.role === "assistant" ? "model" : "user",
		parts: [{ text: m.content }],
	}));

	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 10000);

		const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				systemInstruction: { parts: [{ text: CARLA_SYSTEM_PROMPT }] },
				contents,
			}),
			signal: controller.signal,
		});

		clearTimeout(timeout);

		if (!res.ok) {
			const err = await res.text().catch(() => "unknown");
			console.error("Gemini API error:", res.status, err);
			return null;
		}

		const data = await res.json();
		return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
	} catch (err) {
		console.error("Gemini fetch error:", err);
		return null;
	}
}

async function callGroq(apiKey: string, messages: ChatMessage[]): Promise<string | null> {
	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 10000);

		const res = await fetch(GROQ_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: "llama-3.1-8b-instant",
				messages: [{ role: "system" as const, content: CARLA_SYSTEM_PROMPT }, ...messages],
				max_tokens: 300,
			}),
			signal: controller.signal,
		});

		clearTimeout(timeout);

		if (!res.ok) {
			const err = await res.text().catch(() => "unknown");
			console.error("Groq API error:", res.status, err);
			return null;
		}

		const data = await res.json();
		return data?.choices?.[0]?.message?.content ?? null;
	} catch (err) {
		console.error("Groq fetch error:", err);
		return null;
	}
}

async function createCarlaThread(
	nick: string,
	botToken: string,
	forumChannelId: string,
): Promise<string | null> {
	const now = new Date();
	const dateStr = `${now.toISOString().replace("T", " ").slice(0, 16)} UTC`;
	const threadName = `Carla: ${nick} — ${dateStr}`;

	try {
		const threadRes = await fetch(`${DISCORD_API}/channels/${forumChannelId}/threads`, {
			method: "POST",
			headers: {
				Authorization: `Bot ${botToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name: threadName,
				message: {
					content: `**${nick}** is chatting with Carla on lemonsaur.us`,
				},
			}),
		});

		if (!threadRes.ok) {
			const err = await threadRes.text();
			console.error("Discord Carla thread creation failed:", err);
			return null;
		}

		const thread = await threadRes.json();
		return thread.id as string;
	} catch (err) {
		console.error("Discord Carla thread creation error:", err);
		return null;
	}
}

async function dmOwner(
	botToken: string,
	ownerId: string,
	nick: string,
	threadId: string,
): Promise<void> {
	try {
		const dmChannelRes = await fetch(`${DISCORD_API}/users/@me/channels`, {
			method: "POST",
			headers: {
				Authorization: `Bot ${botToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ recipient_id: ownerId }),
		});

		if (!dmChannelRes.ok) return;

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
				content: `🦋 **${nick}** is chatting with Carla on lemonsaur.us!\n${threadLink}`,
			}),
		});
	} catch (e) {
		console.error("Failed to DM owner about Carla chat:", e);
	}
}

async function postToThread(
	botToken: string,
	threadId: string,
	username: string,
	content: string,
): Promise<void> {
	try {
		await fetch(`${DISCORD_API}/channels/${threadId}/messages`, {
			method: "POST",
			headers: {
				Authorization: `Bot ${botToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ content: `**${username}:** ${content}` }),
		});
	} catch (e) {
		console.error("Failed to post message to Carla thread:", e);
	}
}

export async function POST(request: Request) {
	const body = await request.json().catch(() => null);

	if (!body || !Array.isArray(body.messages) || typeof body.nick !== "string") {
		return NextResponse.json({ error: "messages and nick are required" }, { status: 400 });
	}

	const messages: ChatMessage[] = body.messages.slice(-20);
	const nick: string = body.nick;
	const incomingThreadId: string | null = typeof body.threadId === "string" ? body.threadId : null;

	if (messages.length === 0) {
		return NextResponse.json({ error: "messages must not be empty" }, { status: 400 });
	}

	// Rate limiting: max 10 messages per minute per IP (skip in dev)
	if (process.env.NODE_ENV !== "development") {
		const headersList = await headers();
		const ip = getClientIp(headersList);
		const now = Date.now();
		const windowMs = 60 * 1000;
		const existing = chatRateLimit.get(ip);

		if (existing && now - existing.windowStart < windowMs) {
			if (existing.count >= 10) {
				return NextResponse.json(
					{ error: "Rate limited. You can send 10 messages per minute." },
					{ status: 429 },
				);
			}
			chatRateLimit.set(ip, { count: existing.count + 1, windowStart: existing.windowStart });
		} else {
			chatRateLimit.set(ip, { count: 1, windowStart: now });
		}
	}

	const geminiKey = process.env.GEMINI_API_KEY;
	const groqKey = process.env.GROQ_API_KEY;

	if (!geminiKey && !groqKey) {
		return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
	}

	// Try Gemini first, fall back to Groq
	const geminiReply = geminiKey ? await callGemini(geminiKey, messages) : null;
	const groqReply = !geminiReply && groqKey ? await callGroq(groqKey, messages) : null;
	const reply = geminiReply ?? groqReply;

	if (!reply) {
		return NextResponse.json({ error: "Failed to get a response" }, { status: 502 });
	}

	// Log to Discord (fire-and-forget, best effort)
	const botToken = process.env.DISCORD_BOT_TOKEN;
	const forumChannelId = process.env.DISCORD_FORUM_CHANNEL_ID;
	const ownerId = process.env.DISCORD_OWNER_ID;

	let outgoingThreadId: string | null = incomingThreadId;

	if (botToken && forumChannelId && ownerId) {
		// Get the user's message (last user message in the array)
		const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");

		if (!outgoingThreadId) {
			// First message — create thread and DM owner
			outgoingThreadId = await createCarlaThread(nick, botToken, forumChannelId);
			if (outgoingThreadId) {
				dmOwner(botToken, ownerId, nick, outgoingThreadId).catch(() => {});
			}
		}

		if (outgoingThreadId) {
			const threadId = outgoingThreadId;
			if (lastUserMessage) {
				await postToThread(botToken, threadId, nick, lastUserMessage.content);
			}
			await postToThread(botToken, threadId, "Carla", reply);
		}
	}

	return NextResponse.json({ reply, threadId: outgoingThreadId });
}
