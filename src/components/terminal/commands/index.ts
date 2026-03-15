import { SOCIAL_LINKS } from "@/lib/constants";
import { cat, cd, ls, pwd } from "../filesystem";
import { generateFortune } from "./fortune";
import { neofetch } from "./neofetch";
import type { CommandResult, TerminalLine } from "./types";
import { weatherCommand } from "./weather";

export type { CommandResult, TerminalLine };

function isMobile(): boolean {
	return typeof window !== "undefined" && window.innerWidth < 640;
}

function mobileReject(): CommandResult {
	return {
		lines: [ln("THIS COMMAND REQUIRES A KEYBOARD. TRY IT ON A DESKTOP!", "system")],
	};
}

let lineIdCounter = 0;

function ln(
	text: string,
	type: TerminalLine["type"],
	extra?: { href?: string; lemojiSrc?: string },
): TerminalLine {
	return { id: lineIdCounter++, text, type, ...extra };
}

const COMMANDS: Record<string, () => CommandResult> = {
	help: () => ({
		lines: [
			ln("AVAILABLE COMMANDS:", "system"),
			ln("", "output"),
			ln(" INFO", "system"),
			ln("  ABOUT    - WHO IS LEMONSAURUS?", "output"),
			ln("  LINKS    - SOCIAL LINKS", "output"),
			ln("  NEOFETCH - SYSTEM INFO", "output"),
			ln("  WEATHER  - CHECK THE WEATHER", "output"),
			ln("", "output"),
			ln(" GAMES", "system"),
			ln("  DOOM     - RUN DOOM", "output"),
			ln("  PONG     - LEMON PONG VS CPU", "output"),
			ln("  SNAKE    - PLAY LEMON SNAKE", "output"),
			ln("  TETRIS   - PLAY TETRIS", "output"),
			ln("", "output"),
			ln(" FUN", "system"),
			ln("  FORTUNE  - WORDS OF WISDOM", "output"),
			ln("  HACK     - HACKER MODE", "output"),
			ln("  MATRIX   - THE ZEN OF DIGITAL RAIN", "output"),
			ln("", "output"),
			ln(" SYSTEM", "system"),
			ln("  CLEAR    - CLEAR SCREEN", "output"),
			ln("  HELP     - SHOW THIS LIST", "output"),
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

	links: () => {
		const MAX_DISPLAY_LEN = 35;
		function linkBlock(url: string): TerminalLine {
			const domain = url.replace(/^https?:\/\//, "").split("/")[0]!;
			const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
			let display = url.replace(/^https?:\/\//, "").toUpperCase();
			if (display.length > MAX_DISPLAY_LEN) {
				display = `${display.slice(0, MAX_DISPLAY_LEN - 1)}…`;
			}
			const icon = `<img src="${faviconUrl}" alt="" style="width:28px;height:28px;image-rendering:pixelated;flex-shrink:0" />`;
			const text = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#e8e040;text-decoration:underline;text-decoration-color:rgba(232,224,64,0.5);font-size:inherit">${display}</a>`;
			const html = `<div style="display:flex;align-items:center;gap:8px;padding:4px 0">${icon}${text}</div>`;
			return ln(html, "rich");
		}

		return {
			lines: [
				ln("SOCIAL/MEDIA", "system"),
				...SOCIAL_LINKS.map((link) => linkBlock(link.url)),
				ln("", "output"),
				ln("COMMUNITIES I HELPED BUILD", "system"),
				linkBlock("https://oomfies.gay"),
				linkBlock("https://pythondiscord.com"),
				ln("", "output"),
				ln("COMPANIES I STARTED", "system"),
				linkBlock("https://tinydoom.com"),
				linkBlock("https://hideous.monster"),
				ln("", "output"),
				ln("SOFTWARE I MADE", "system"),
				linkBlock("https://github.com/lemonsaurus/blackbox"),
				linkBlock("https://github.com/lemonsaurus/agency"),
				linkBlock("https://github.com/lemonsaurus/mirador"),
			],
		};
	},

	snake: () =>
		isMobile()
			? mobileReject()
			: { lines: [ln("LOADING LEMON SNAKE...", "system")], action: "snake" as const },

	matrix: () => ({
		lines: [ln("ENTERING THE MATRIX...", "system")],
		action: "matrix",
	}),

	cmatrix: () => ({
		lines: [ln("ENTERING THE MATRIX...", "system")],
		action: "matrix",
	}),

	hack: () => ({
		lines: [ln("INITIALIZING HACK SEQUENCE...", "system")],
		action: "hack",
	}),

	doom: () =>
		isMobile()
			? mobileReject()
			: { lines: [ln("LOADING DOOM.EXE...", "system")], action: "doom" as const },

	tetris: () =>
		isMobile()
			? mobileReject()
			: { lines: [ln("LOADING TETRIS...", "system")], action: "tetris" as const },

	pong: () =>
		isMobile()
			? mobileReject()
			: { lines: [ln("LOADING LEMON PONG...", "system")], action: "pong" as const },

	fortune: () => ({
		lines: [ln("", "output"), ln(generateFortune(), "output"), ln("", "output")],
	}),

	neofetch: () => ({
		lines: [ln("", "output"), ...neofetch(ln), ln("", "output")],
	}),

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

	sudo: () => ({
		lines: [
			ln("", "output"),
			ln("VISITOR IS NOT IN THE SUDOERS FILE.", "system"),
			ln("THIS INCIDENT WILL BE REPORTED.", "system"),
			ln("", "output"),
		],
	}),

	echo: (args) => ({
		lines: [ln(args ? args.toUpperCase() : "", "output")],
	}),

	weather: (args) => ({
		lines: [ln(`FETCHING WEATHER FOR "${(args.trim() || "OSLO").toUpperCase()}"...`, "system")],
		asyncLines: () => weatherCommand(args),
	}),
};

// Commands that get a snarky rejection
const ROASTS: Record<string, string> = {
	find: "FIND WHAT? YOUR DIGNITY? TRY LOOKING UNDER THE COUCH.",
	grep: "THIS IS A COMMODORE 64, NOT A DATA CENTER. THERE IS NOTHING TO GREP.",
	awk: "AWK-WARD. THIS ISN'T A REAL TERMINAL.",
	sed: "SED? MORE LIKE SAID... GOODBYE. BECAUSE THIS ISN'T BASH.",
	chmod: "NICE TRY. ALL FILES HERE ARE READ-ONLY. FOREVER.",
	chown: "YOU DON'T OWN ANYTHING HERE. THIS IS MY HOUSE.",
	chgrp: "THERE IS ONLY ONE GROUP HERE AND YOU'RE NOT IN IT.",
	scp: "WHERE WOULD YOU EVEN COPY TO? THE VOID?",
	ssh: "SSH... BE QUIET. THIS IS A LIBRARY TERMINAL.",
	telnet: "TELNET? WHAT YEAR IS IT?",
	python: "IMPORT ANTIGRAVITY... JUST KIDDING, NO INTERPRETER HERE.",
	node: "NODE_MODULE COUNT: 847,293. JUST KIDDING. THERE IS NO NODE.",
	bash: "BASH: COMMAND NOT FOUND. OH WAIT, THAT'S MY LINE.",
	zsh: "OH LOOK AT YOU WITH YOUR FANCY SHELL. NOT HERE THOUGH.",
	sh: "SH HAPPENS. BUT NOT HERE.",
	apt: "YOU ARE NOT PERMITTED TO INSTALL SHIT.",
	brew: "YOU ARE NOT PERMITTED TO INSTALL SHIT.",
	npm: "YOU ARE NOT PERMITTED TO INSTALL SHIT.",
	pip: "YOU ARE NOT PERMITTED TO INSTALL SHIT.",
	poetry: "YOU ARE NOT PERMITTED TO INSTALL SHIT.",
	pacman: "YOU ARE NOT PERMITTED TO INSTALL SHIT.",
	paru: "YOU ARE NOT PERMITTED TO INSTALL SHIT.",
	yay: "YOU ARE NOT PERMITTED TO INSTALL SHIT.",
	dnf: "YOU ARE NOT PERMITTED TO INSTALL SHIT.",
	yum: "YOU ARE NOT PERMITTED TO INSTALL SHIT.",
	zypper: "YOU ARE NOT PERMITTED TO INSTALL SHIT.",
	cargo: "YOU ARE NOT PERMITTED TO INSTALL SHIT.",
	top: "THIS COMMAND DOESN'T WORK YET, BUT IT'S BEING FIXED BY TOP MEN. TOP... MEN.",
	ps: "PID 1: LEMONSAURUS  STATUS: BASED  CPU: YES",
	kill: "YOU CAN'T KILL WHAT'S ALREADY DEAD INSIDE.",
	curl: "CURL: (7) FAILED TO CONNECT TO REALITY PORT 443",
	wget: "WGET: UNABLE TO RESOLVE HOST 'THIS-IS-NOT-THE-INTERNET'",
	vim: "THIS COMMAND HAS BEEN DISABLED FOR YOUR OWN GOOD. YOU'D NEVER FIGURE OUT HOW TO CLOSE IT AGAIN.",
	vi: "THIS COMMAND HAS BEEN DISABLED FOR YOUR OWN GOOD. YOU'D NEVER FIGURE OUT HOW TO CLOSE IT AGAIN.",
	emacs:
		"THIS COMMAND HAS BEEN DISABLED FOR YOUR OWN GOOD. YOU'D NEVER FIGURE OUT HOW TO CLOSE IT AGAIN.",
	git: "FATAL: NOT A GIT REPOSITORY (OR ANY PARENT UP TO MOUNT POINT /)",
	docker: "CANNOT CONNECT TO THE DOCKER DAEMON. IS THE DAEMON RUNNING? (NO.)",
	man: "WHAT MANUAL PAGE DO YOU WANT? WE DON'T HAVE MANUALS. JUST VIBES.",
	whoami: "YOU ARE A VISITOR. NOTHING MORE. NOTHING LESS.",
	ping: "PONG! ...WAIT, THAT'S A DIFFERENT COMMAND. TYPE 'HELP'.",
	exit: "THERE IS NO EXIT. ONLY LEMONS.",
	logout: "YOU CAN'T LOG OUT. YOU WERE NEVER LOGGED IN.",
	reboot: "HAVE YOU TRIED TURNING IT OFF AND NEVER TURNING IT BACK ON?",
	shutdown: "I'M SORRY DAVE, I'M AFRAID I CAN'T DO THAT.",
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

	// Check for snarky roasts
	const roast = ROASTS[cmd];
	if (roast) {
		return { lines: [ln(roast, "system")] };
	}

	return {
		lines: [ln("?SYNTAX ERROR - TYPE 'HELP' FOR AVAILABLE COMMANDS.", "system")],
	};
}

export const COMMAND_NAMES = [...Object.keys(COMMANDS), ...Object.keys(ARG_COMMANDS)];

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
	"READY. TYPE 'HELP' TO SEE AVAILABLE COMMANDS.",
];
