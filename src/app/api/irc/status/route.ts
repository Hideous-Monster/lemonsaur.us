import { NextResponse } from "next/server";

const LANYARD_USER_ID = "95872159741644800";
const CACHE_TTL_MS = 15 * 1000;

type DiscordStatus = "online" | "idle" | "dnd" | "offline";

interface StatusCache {
	status: DiscordStatus;
	activeOn?: string;
	fetchedAt: number;
}

let cache: StatusCache | null = null;

export async function GET() {
	const now = Date.now();

	if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
		return NextResponse.json({ status: cache.status, activeOn: cache.activeOn });
	}

	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 5000);

		const res = await fetch(`https://api.lanyard.rest/v1/users/${LANYARD_USER_ID}`, {
			signal: controller.signal,
			cache: "no-store",
		});

		clearTimeout(timeout);

		if (!res.ok) {
			cache = { status: "offline", fetchedAt: now };
			return NextResponse.json({ status: "offline" });
		}

		const data = await res.json();
		const lanyardData = data?.data;

		if (!lanyardData) {
			cache = { status: "offline", fetchedAt: now };
			return NextResponse.json({ status: "offline" });
		}

		const status: DiscordStatus = (lanyardData.discord_status as DiscordStatus) ?? "offline";

		// Figure out which platform they're active on, if any
		let activeOn: string | undefined;
		const activeDesktop = lanyardData.active_on_discord_desktop;
		const activeMobile = lanyardData.active_on_discord_mobile;
		const activeWeb = lanyardData.active_on_discord_web;

		if (activeDesktop) activeOn = "desktop";
		else if (activeMobile) activeOn = "mobile";
		else if (activeWeb) activeOn = "web";

		cache = { status, activeOn, fetchedAt: now };
		return NextResponse.json({ status, activeOn });
	} catch {
		cache = { status: "offline", fetchedAt: now };
		return NextResponse.json({ status: "offline" });
	}
}
