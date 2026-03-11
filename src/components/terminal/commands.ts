import { SOCIAL_LINKS } from "@/lib/constants";
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
	action?: "navigate" | "clear" | "snake" | "matrix" | "hack" | "destroy";
	href?: string;
}

const COMMANDS: Record<string, () => CommandResult> = {
	help: () => ({
		lines: [
			ln("AVAILABLE COMMANDS:", "system"),
			ln("", "output"),
			ln("  HELP     - SHOW THIS LIST", "output"),
			ln("  ABOUT    - WHO IS LEMONSAURUS?", "output"),
			ln("  LINKS    - SOCIAL LINKS", "output"),
			ln("  SNAKE    - PLAY LEMON SNAKE", "output"),
			ln("  MATRIX   - DIGITAL RAIN", "output"),
			ln("  HACK     - HACKER MODE", "output"),
			ln("  NEOFETCH - SYSTEM INFO", "output"),
			ln("  CLEAR    - CLEAR SCREEN", "output"),
		],
	}),

	about: () => ({
		lines: [
			ln(
				`<style>` +
					`@keyframes crt-glitch{0%,85%,100%{transform:translate(0,0);filter:saturate(.3) contrast(1.1) brightness(.8)}86%{transform:translate(-3px,0);filter:saturate(.3) contrast(1.5) brightness(1.2)}87%{transform:translate(2px,0);filter:saturate(.3) contrast(1.1) brightness(.6)}88%{transform:translate(0,0);filter:saturate(.3) contrast(1.1) brightness(.8)}93%{transform:translate(0,1px);filter:saturate(.5) contrast(1.1) brightness(.9)}94%{transform:translate(-1px,0);filter:saturate(.3) contrast(1.1) brightness(.8)}}` +
					`@keyframes crt-glow{0%,100%{box-shadow:inset 0 0 20px rgba(64,184,72,.4),0 0 8px rgba(64,184,72,.2)}50%{box-shadow:inset 0 0 30px rgba(64,184,72,.6),0 0 15px rgba(64,184,72,.3)}}` +
					`@keyframes crt-scan1{0%{top:-10%;opacity:.4}40%{opacity:.25}60%{opacity:.5}100%{top:110%;opacity:.3}}` +
					`@keyframes crt-scan2{0%{top:110%;opacity:.2}30%{opacity:.35}70%{opacity:.15}100%{top:-10%;opacity:.3}}` +
					`@keyframes crt-scan3{0%{top:-10%;opacity:.3}50%{opacity:.5}100%{top:110%;opacity:.2}}` +
					`@keyframes crt-flicker{0%,96%,100%{opacity:1}97%{opacity:.4}97.5%{opacity:1}98%{opacity:.6}98.5%{opacity:1}}` +
					`.portrait-crt{position:relative;overflow:hidden;animation:crt-glow 3s ease-in-out infinite,crt-flicker 12s steps(1) infinite}` +
					`.portrait-crt img{animation:crt-glitch 4s infinite steps(1)}` +
					`.portrait-crt::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:1;background:repeating-linear-gradient(0deg,transparent 0px,transparent 2px,rgba(0,0,0,.4) 2px,rgba(0,0,0,.4) 3px)}` +
					`.portrait-crt::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:2;background:radial-gradient(ellipse at center,rgba(64,184,72,.15) 0%,transparent 30%,rgba(0,10,0,.85) 100%),linear-gradient(180deg,rgba(64,184,72,.25) 0%,transparent 30%,transparent 70%,rgba(64,184,72,.2) 100%)}` +
					`.portrait-scan{position:absolute;left:0;width:100%;z-index:3;pointer-events:none}` +
					`.ps1{height:3px;background:rgba(64,184,72,.35);animation:crt-scan1 2.7s linear infinite;box-shadow:0 0 8px rgba(64,184,72,.5)}` +
					`.ps2{height:2px;background:rgba(184,216,80,.25);animation:crt-scan2 4.3s linear 1.2s infinite;box-shadow:0 0 6px rgba(184,216,80,.4)}` +
					`.ps3{height:5px;background:rgba(112,208,176,.2);animation:crt-scan3 7.1s linear 3s infinite;box-shadow:0 0 12px rgba(112,208,176,.3)}` +
					`</style>` +
					`<div style="display:flex;align-items:center;gap:1em;width:fit-content;white-space:normal;line-height:normal">` +
					`<div style="line-height:1.6">` +
					`<span style="color:#e8e040;font-weight:bold;font-size:1.2em">LEMONSAURUS</span><br><br>` +
					`JUST A REGULAR-ASS GUY WITH A BIG-ASS BEARD.<br><br>` +
					`I MAKE THINGS. YOU CAN FIND SOME OF THE<br>` +
					`THINGS I MAKE ON THIS SITE.<br>` +
					`I EVEN MADE THIS SITE!<br><br>` +
					`TYPE 'LINKS' TO SEE SOME OTHER STUFF I MADE!` +
					`</div>` +
					`<div class="portrait-crt" style="flex-shrink:0;width:130px;height:130px;border:3px double #e8e040;padding:3px;background:#0a140a;overflow:hidden">` +
					`<img src="/images/lemon_portrait.png" alt="LEMONSAURUS" style="width:100%;height:100%;object-fit:cover;image-rendering:pixelated" />` +
					`<div class="portrait-scan ps1"></div><div class="portrait-scan ps2"></div><div class="portrait-scan ps3"></div>` +
					`</div>` +
					`</div>`,
				"rich",
			),
		],
	}),

	links: () => ({
		lines: [
			ln("SOCIAL/MEDIA", "system"),
			...SOCIAL_LINKS.map((link) => ln(`  ${link.url}`, "output", { href: link.url })),
			ln("", "output"),
			ln("COMMUNITIES I HELPED BUILD", "system"),
			ln("  https://oomfies.gay", "output", { href: "https://oomfies.gay" }),
			ln("  https://pythondiscord.com", "output", { href: "https://pythondiscord.com" }),
			ln("", "output"),
			ln("COMPANIES I STARTED", "system"),
			ln("  https://tinydoom.com", "output", { href: "https://tinydoom.com" }),
			ln("  https://hideous.monster", "output", { href: "https://hideous.monster" }),
			ln("", "output"),
			ln("SOFTWARE I MADE", "system"),
			ln("  https://github.com/lemonsaurus/blackbox", "output", {
				href: "https://github.com/lemonsaurus/blackbox",
			}),
			ln("  https://github.com/lemonsaurus/agency", "output", {
				href: "https://github.com/lemonsaurus/agency",
			}),
			ln("  https://github.com/lemonsaurus/mirador", "output", {
				href: "https://github.com/lemonsaurus/mirador",
			}),
		],
	}),

	snake: () => ({
		lines: [ln("LOADING LEMON SNAKE...", "system")],
		action: "snake",
	}),

	matrix: () => ({
		lines: [ln("ENTERING THE MATRIX...", "system")],
		action: "matrix",
	}),

	hack: () => ({
		lines: [ln("INITIALIZING HACK SEQUENCE...", "system")],
		action: "hack",
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
			["OS", "LEMON 87 JUICY", "#b8d850", "#f0f0d0"],
			["HOST", "OSLO, NORWAY", "#b8d850", "#f0f0d0"],
			["KERNEL", "6.502-SID-PETSCII", "#b8d850", "#f0f0d0"],
			["UPTIME", "SINCE 1987", "#b8d850", "#f0f0d0"],
			["SHELL", "LEMSH 1.0", "#b8d850", "#f0f0d0"],
			["CPU", "MOS 6510 @ 1.023 MHZ", "#b8d850", "#f0f0d0"],
			["GPU", "VIC-II 320x200", "#b8d850", "#f0f0d0"],
			["RAM", "87K (38911 BASIC BYTES FREE)", "#b8d850", "#f0f0d0"],
			["DISK", "1541 FLOPPY (170K)", "#b8d850", "#f0f0d0"],
			["SOUND", "SID 6581 3-VOICE SYNTH", "#b8d850", "#f0f0d0"],
			["THEME", "ALGEBRAIC", "#b8d850", "#f0f0d0"],
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

	cls: () => ({
		lines: [],
		action: "clear",
	}),
};

// Commands that accept arguments
const ARG_COMMANDS: Record<string, (args: string) => CommandResult> = {
	rm: (args) => {
		if (args.includes("-rf") && args.includes("/")) {
			return {
				lines: [ln("rm: DESTROYING ALL FILES...", "system")],
				action: "destroy",
			};
		}
		return { lines: [ln("RM: COMMAND NOT 'FUCK YOU' ENOUGH. TRY RM -RF /", "system")] };
	},

	ls: (args) => ({
		lines: ls(args).map((line) => ln(line, "output")),
	}),

	cd: (args) => {
		const err = cd(args);
		if (err) return { lines: [ln(err, "system")] };
		return { lines: [ln(pwd(), "output")] };
	},

	cat: (args) => ({
		lines: cat(args).map((line) => {
			const urlMatch = line.match(/HTTPS?:\/\/\S+/i);
			if (urlMatch) return ln(line, "output", { href: urlMatch[0].toLowerCase() });
			return ln(line, "output");
		}),
	}),

	nano: (args) => ({
		lines: cat(args).map((line) => {
			const urlMatch = line.match(/HTTPS?:\/\/\S+/i);
			if (urlMatch) return ln(line, "output", { href: urlMatch[0].toLowerCase() });
			return ln(line, "output");
		}),
	}),

	dir: (args) => ({
		lines: ls(args).map((line) => ln(line, "output")),
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
