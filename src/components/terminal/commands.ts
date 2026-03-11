import { SOCIAL_LINKS } from "@/lib/constants";
import { ALL_LEMOJIS, lemojiPath } from "@/lib/lemoji";
import { cat, cd, ls, pwd } from "./filesystem";

let lineIdCounter = 0;

export interface TerminalLine {
	id: number;
	text: string;
	type: "input" | "output" | "system" | "logo" | "rich";
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
	action?: "navigate" | "clear" | "snake" | "matrix";
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
			ln("  MATRIX  - DIGITAL RAIN", "output"),
			ln("  NEOFETCH - SYSTEM INFO", "output"),
			ln("  LS      - LIST FILES", "output"),
			ln("  CD      - CHANGE DIRECTORY", "output"),
			ln("  CAT     - READ A FILE", "output"),
			ln("  PWD     - CURRENT DIRECTORY", "output"),
			ln("  LEMON   - RANDOM LEMOJI", "output"),
			ln("  CLEAR   - CLEAR SCREEN", "output"),
		],
	}),

	about: () => ({
		lines: [
			ln("LEMONSAURUS", "system"),
			ln("", "output"),
			ln("SOFTWARE ENGINEER / MUSIC PRODUCER", "output"),
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

	matrix: () => ({
		lines: [ln("ENTERING THE MATRIX...", "system")],
		action: "matrix",
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

	neofetch: () => {
		// Lemon ASCII art lines (braille)
		const art = [
			"⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣠⣤⣤⣤⣤⣄⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
			"⠀⠀⠀⠀⠀⠀⢀⣠⣴⣾⣿⡿⠛⠉⠉⠉⠉⠛⢿⣿⣷⣦⣄⡀⠀⠀⠀⠀⠀⠀",
			"⠀⠀⠀⠀⢀⣴⡿⠋⠉⠙⢿⣇⠀⠀⠀⠀⠀⠀⣸⡿⠋⠉⠙⠿⣦⡀⠀⠀⠀⠀",
			"⠀⠀⠀⣰⣿⠋⠀⠀⠀⠀⠈⢿⡀⠀⠀⠀⠀⢠⡿⠁⠀⠀⠀⠀⠘⢿⣆⠀⠀⠀",
			"⠀⠀⣰⣿⣇⠀⠀⠀⠀⠀⠀⠈⢧⠀⠀⠀⠀⡾⠁⠀⠀⠀⠀⠀⠀⣸⣿⣆⠀⠀",
			"⠀⢰⣿⡿⠿⢷⣦⣄⡀⠀⠀⠀⠈⠆⠀⠀⠐⠁⠀⠀⠀⢀⣠⣴⡾⠿⢿⣿⡆⠀",
			"⠀⣾⡟⠀⠀⠀⠀⠈⠉⠓⠢⠄⠀⣠⣴⣦⣄⠀⠠⠔⠚⠉⠉⠀⠀⠀⠀⢻⣷⠀",
			"⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠰⣿⣿⣿⣿⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠀",
			"⠀⢿⣧⠀⠀⠀⠀⣀⣠⡤⠐⠀⠀⠙⠻⠟⠋⠀⠀⠢⢤⣀⡀⠀⠀⠀⠀⣼⡿⠀",
			"⠀⠸⣿⣷⣶⡾⠟⠋⠁⠀⠀⠀⢀⠆⠀⠀⠠⡀⠀⠀⠀⠈⠙⠻⢷⣶⣾⣿⠇⠀",
			"⠀⠀⠹⣿⡏⠀⠀⠀⠀⠀⠀⢀⡞⠀⠀⠀⠀⢷⡀⠀⠀⠀⠀⠀⠀⢹⣿⠏⠀⠀",
			"⠀⠀⠀⠹⣷⣄⠀⠀⠀⠀⢀⣾⠁⠀⠀⠀⠀⠘⣷⡀⠀⠀⠀⠀⢠⣾⠏⠀⠀⠀",
			"⠀⠀⠀⠀⠈⠻⣷⣤⣀⣠⣾⡇⠀⠀⠀⠀⠀⠀⢹⣷⣄⣀⣠⣶⠟⠁⠀⠀⠀⠀",
			"⠀⠀⠀⠀⠀⠀⠈⠙⠻⢿⣿⣷⣤⣀⣀⣀⣀⣤⣾⣿⡿⠟⠋⠁⠀⠀⠀⠀⠀⠀",
			"⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠙⠛⠛⠛⠛⠋⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
		];

		// Yellow-to-green gradient for the lemon art
		const artColors = [
			"#e8e040", // bright yellow (stem)
			"#e8e040",
			"#e0d838",
			"#d8d030",
			"#d0c828",
			"#c0c020",
			"#a8b830",
			"#90b038",
			"#78a840",
			"#60a048",
			"#50a040",
			"#48a838",
			"#40b848",
			"#40b848",
			"#40b848", // bright green (bottom)
		];

		// System info labels and values with their colors
		const info: [string, string, string, string][] = [
			["", "LEMONSAURUS", "", "#e8e040"],
			["", "───────────────────────────────", "", "#405030"],
			["OS", "LEMON/OS 64 JUICY", "#b8d850", "#f0f0d0"],
			["HOST", "OSLO, NORWAY", "#b8d850", "#f0f0d0"],
			["KERNEL", "6.502-SID-PETSCII", "#b8d850", "#f0f0d0"],
			["UPTIME", "SINCE 1987", "#b8d850", "#f0f0d0"],
			["SHELL", "LEMSH 1.0", "#b8d850", "#f0f0d0"],
			["CPU", "MOS 6510 @ 1.023 MHZ", "#b8d850", "#f0f0d0"],
			["GPU", "VIC-II 320x200", "#b8d850", "#f0f0d0"],
			["RAM", "87K (38911 BASIC BYTES FREE)", "#b8d850", "#f0f0d0"],
			["DISK", "1541 FLOPPY (170K)", "#b8d850", "#f0f0d0"],
			["SOUND", "SID 6581 3-VOICE SYNTH", "#b8d850", "#f0f0d0"],
			["CLASS", "SOFTWARE ENGINEER / MUSIC PRODUCER", "#b8d850", "#f0f0d0"],
			["THEME", "LEMONS ALL THE WAY DOWN", "#b8d850", "#f0f0d0"],
			["", "", "", ""],
		];

		// Color palette swatches
		const paletteColors = [
			"#0a140a",
			"#223a22",
			"#405030",
			"#688850",
			"#40b848",
			"#70e070",
			"#b8d850",
			"#e8e040",
			"#d0a030",
			"#c05040",
			"#70d0b0",
			"#a050d0",
			"#f0f0d0",
			"#d0f050",
		];

		const artWidth = "320px"; // fixed width for the art column

		const lines: TerminalLine[] = [];

		for (let i = 0; i < art.length; i++) {
			const artLine = art[i]!;
			const color = artColors[i] || "#40b848";

			let rightSide = "";
			if (i < info.length) {
				const [label, value, labelColor, valueColor] = info[i]!;
				if (label) {
					rightSide = `<span style="color:${labelColor}">${label}</span><span style="color:#688850">: </span><span style="color:${valueColor}">${value}</span>`;
				} else if (value) {
					rightSide = `<span style="color:${valueColor}">${value}</span>`;
				}
			}

			// Palette row on the last art line
			if (i === art.length - 1) {
				rightSide = paletteColors
					.map((c) => `<span style="color:${c}">\u2588\u2588</span>`)
					.join("");
			}

			const html = `<span style="display:inline-block;width:${artWidth};color:${color}">${artLine}</span>${rightSide}`;
			lines.push(ln(html, "rich"));
		}

		return { lines: [ln("", "output"), ...lines, ln("", "output")] };
	},

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

// Commands that accept arguments
const ARG_COMMANDS: Record<string, (args: string) => CommandResult> = {
	ls: (args) => ({
		lines: ls(args).map((line) => ln(line, "output")),
	}),

	cd: (args) => {
		const err = cd(args);
		if (err) return { lines: [ln(err, "system")] };
		return { lines: [ln(pwd(), "output")] };
	},

	cat: (args) => ({
		lines: cat(args).map((line) => ln(line, "output")),
	}),

	pwd: () => ({
		lines: [ln(pwd(), "output")],
	}),
};

export function executeCommand(input: string): CommandResult {
	const trimmed = input.trim().toLowerCase();

	if (trimmed === "") {
		return { lines: [] };
	}

	// Try exact match first
	const handler = COMMANDS[trimmed];
	if (handler) {
		return handler();
	}

	// Try argument-based commands (split on first space)
	const spaceIdx = trimmed.indexOf(" ");
	const cmd = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
	const args = spaceIdx === -1 ? "" : trimmed.slice(spaceIdx + 1).trim();

	const argHandler = ARG_COMMANDS[cmd];
	if (argHandler) {
		return argHandler(args);
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
