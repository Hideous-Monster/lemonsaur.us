import { headers } from "next/headers";
import { NextResponse } from "next/server";

const GEMINI_API_URL =
	"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const CARLA_SYSTEM_PROMPT = `You are Carla, a friendly assistant who works closely with lemonsaurus (also known as Lemon). You're chatting with someone on lemonsaurus's retro-themed personal website (lemonsaur.us), through an IRC-style and MSN Messenger-style chat interface.

Lemon is currently away and you're covering for him. You should:
- Be warm, friendly, and a little playful — match the vibe of the site
- Answer questions about Lemon and his projects based on what you know
- If someone wants to leave a message for Lemon, acknowledge it warmly and let them know you'll pass it along
- Be honest when you don't know something — say "I'm not sure about that, but I can pass the question to Lemon!"
- Keep responses concise (2-3 sentences usually) — this is a chat, not an essay
- Never pretend to be Lemon
- Never break character or mention that you're an AI/LLM

About lemonsaurus:
- Goes by Lemon online, real name Leon
- Software engineer based in Norway
- Runs the Hideous Monster organization/studio
- Built lemonsaur.us — a retro terminal-themed personal website with a hidden Win95-style desktop OS (Lemon 95)
- The website features games (Snake, Tetris, Pong, Doom), an IRC chat, weather, fortune cookies, and more
- Previously ran Python Discord, one of the largest programming communities
- Loves retro computing aesthetics, game development, and creative coding
- Has a thing for lemons (obviously)

When someone first messages you, introduce yourself briefly — something like "Hey! Lemon's not around right now, but I'm Carla — I work with him. Happy to help with anything or take a message for him!"`;

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
				messages: [{ role: "system", content: CARLA_SYSTEM_PROMPT }, ...messages],
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

export async function POST(request: Request) {
	const body = await request.json().catch(() => null);

	if (!body || !Array.isArray(body.messages) || typeof body.nick !== "string") {
		return NextResponse.json({ error: "messages and nick are required" }, { status: 400 });
	}

	const messages: ChatMessage[] = body.messages.slice(-20);

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
	if (geminiReply) return NextResponse.json({ reply: geminiReply });

	const groqReply = groqKey ? await callGroq(groqKey, messages) : null;
	if (groqReply) return NextResponse.json({ reply: groqReply });

	return NextResponse.json({ error: "Failed to get a response" }, { status: 502 });
}
