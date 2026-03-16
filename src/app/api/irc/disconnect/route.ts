import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const body = await request.json().catch(() => null);

	if (
		!body ||
		typeof body.threadId !== "string" ||
		typeof body.nick !== "string" ||
		!body.threadId.trim() ||
		!body.nick.trim()
	) {
		return NextResponse.json({ error: "threadId and nick are required" }, { status: 400 });
	}

	const { threadId, nick } = body as { threadId: string; nick: string };
	const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

	if (!webhookUrl) {
		return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
	}

	try {
		await fetch(`${webhookUrl}?thread_id=${threadId}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				content: `📤 **${nick}** has left the chat`,
				username: "LemonNET",
				avatar_url: "https://lemonsaur.us/images/lemon87_bootup.png",
			}),
		});
	} catch (e) {
		console.error("Failed to post disconnect message:", e);
	}

	return NextResponse.json({ ok: true });
}
