import { SOCIAL_LINKS } from "@/lib/constants";
import { ALL_LEMOJIS, lemojiPath } from "@/lib/lemoji";

let lineIdCounter = 0;

export interface TerminalLine {
	id: number;
	text: string;
	type: "input" | "output" | "system" | "logo";
	href?: string;
	lemojiSrc?: string;
}

function ln(
	text: string,
	type: TerminalLine["type"],
	extra?: { href?: string; lemojiSrc?: string },
): TerminalLine {
	return { id: lineIdCounter++, text, type, ...extra };
}

export interface CommandResult {
	lines: TerminalLine[];
	action?: "navigate" | "clear" | "snake";
	href?: string;
}

const COMMANDS: Record<string, () => CommandResult> = {
	help: () => ({
		lines: [
			ln("AVAILABLE COMMANDS:", "system"),
			ln("", "output"),
			ln("  HELP    - SHOW THIS LIST", "output"),
			ln("  ABOUT   - WHO IS LEMONSAURUS?", "output"),
			ln("  LINKS   - SOCIAL LINKS", "output"),
			ln("  BLOG    - READ THE BLOG", "output"),
			ln("  MUSIC   - LISTEN TO MUSIC", "output"),
			ln("  SNAKE   - PLAY LEMON SNAKE", "output"),
			ln("  LEMON   - RANDOM LEMOJI", "output"),
			ln("  CLEAR   - CLEAR SCREEN", "output"),
		],
	}),

	about: () => ({
		lines: [
			ln("LEMONSAURUS", "system"),
			ln("", "output"),
			ln("SOFTWARE ENGINEER / MUSIC PRODUCER / DINOSAUR", "output"),
			ln("", "output"),
			ln("BUILDING THINGS WITH CODE AND SOUND.", "output"),
			ln("CURRENTLY VIBING IN OSLO, NORWAY.", "output"),
			ln("", "output"),
			ln("TYPE 'LINKS' TO FIND ME ONLINE.", "output"),
		],
	}),

	links: () => ({
		lines: [
			ln("SOCIAL LINKS:", "system"),
			ln("", "output"),
			...SOCIAL_LINKS.map((link) =>
				ln(`  ${link.name.toUpperCase().padEnd(12)} ${link.url}`, "output", { href: link.url }),
			),
		],
	}),

	blog: () => ({
		lines: [ln("LOADING BLOG...", "system")],
		action: "navigate",
		href: "/blog",
	}),

	snake: () => ({
		lines: [ln("LOADING LEMON SNAKE...", "system")],
		action: "snake",
	}),

	music: () => ({
		lines: [
			ln("SOUNDCLOUD:", "system"),
			ln("", "output"),
			ln("  HTTPS://SOUNDCLOUD.COM/LEMONSAURUSREX", "output", {
				href: "https://soundcloud.com/lemonsaurusrex",
			}),
		],
	}),

	clear: () => ({
		lines: [],
		action: "clear",
	}),

	lemon: () => {
		const lemoji = ALL_LEMOJIS[Math.floor(Math.random() * ALL_LEMOJIS.length)]!;
		return {
			lines: [ln(`:${lemoji}:`, "output", { lemojiSrc: lemojiPath(lemoji) })],
		};
	},
};

export function executeCommand(input: string): CommandResult {
	const trimmed = input.trim().toLowerCase();

	if (trimmed === "") {
		return { lines: [] };
	}

	const handler = COMMANDS[trimmed];
	if (handler) {
		return handler();
	}

	return {
		lines: [ln("?SYNTAX ERROR", "system")],
	};
}

export function makeBootLine(text: string, type: TerminalLine["type"] = "system"): TerminalLine {
	return ln(text, type);
}

export const LOGO_LINES = [
	"\u2591\u2588\u2591\u2591\u2591\u2588\u2580\u2580\u2591\u2588\u2584\u2588\u2591\u2588\u2580\u2588\u2591\u2588\u2580\u2588\u2591\u2591\u2591\u2584\u2580\u2584\u2591\u2580\u2580\u2588",
	"\u2591\u2588\u2591\u2591\u2591\u2588\u2580\u2580\u2591\u2588\u2591\u2588\u2591\u2588\u2591\u2588\u2591\u2588\u2591\u2588\u2591\u2591\u2591\u2584\u2580\u2584\u2591\u2584\u2580\u2591",
	"\u2591\u2580\u2580\u2580\u2591\u2580\u2580\u2580\u2591\u2580\u2591\u2580\u2591\u2580\u2580\u2580\u2591\u2580\u2591\u2580\u2591\u2591\u2591\u2591\u2580\u2591\u2591\u2580\u2591\u2591",
];

export const BOOT_LINES = [
	"",
	...LOGO_LINES,
	"",
	"87K RAM SYSTEM  38911 BASIC BYTES FREE",
	"SCREEN: 40x25  CHARSET: PETSCII  CLOCK: 1.023 MHZ",
	"",
	"READY.",
];
