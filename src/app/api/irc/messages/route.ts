import { NextResponse } from "next/server";

const DISCORD_API = "https://discord.com/api/v10";
const DISCORD_EPOCH = BigInt(1420070400000);

/** Convert an ISO timestamp to a Discord snowflake for use as `after` param. */
function isoToSnowflake(iso: string): string | null {
	try {
		const ms = BigInt(new Date(iso).getTime());
		if (Number.isNaN(Number(ms))) return null;
		// Snowflake = (timestamp_ms - DISCORD_EPOCH) << 22
		return ((ms - DISCORD_EPOCH) << BigInt(22)).toString();
	} catch {
		return null;
	}
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const threadId = searchParams.get("threadId");
	const since = searchParams.get("since");

	if (!threadId) {
		return NextResponse.json({ error: "threadId is required" }, { status: 400 });
	}

	const botToken = process.env.DISCORD_BOT_TOKEN;
	const ownerId = process.env.DISCORD_OWNER_ID;

	if (!botToken || !ownerId) {
		return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
	}

	let url = `${DISCORD_API}/channels/${threadId}/messages?limit=50`;

	if (since) {
		const snowflake = isoToSnowflake(since);
		if (snowflake) {
			url += `&after=${snowflake}`;
		}
	}

	const res = await fetch(url, {
		headers: {
			Authorization: `Bot ${botToken}`,
		},
		next: { revalidate: 0 },
	});

	if (!res.ok) {
		const err = await res.text();
		console.error("Discord messages fetch failed:", err);
		return NextResponse.json({ error: "Failed to fetch messages" }, { status: 502 });
	}

	const discordMessages = await res.json();

	// Filter to only messages from the owner
	const messages = discordMessages
		.filter((m: { author: { id: string } }) => m.author.id === ownerId)
		.map((m: { content: string; timestamp: string; author: { username: string } }) => ({
			content: m.content,
			timestamp: m.timestamp,
			author: m.author.username,
		}));

	return NextResponse.json({ messages });
}
