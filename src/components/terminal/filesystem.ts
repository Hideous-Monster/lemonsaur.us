/**
 * Fake filesystem for the terminal. Supports ls, cd, cat, and pwd.
 */

interface FsFile {
	type: "file";
	content: string;
	size: string;
	date: string;
}

interface FsDir {
	type: "dir";
	children: Record<string, FsNode>;
	date: string;
}

type FsNode = FsFile | FsDir;

const FILESYSTEM: FsDir = {
	type: "dir",
	date: "1987-08-01",
	children: {
		"README.TXT": {
			type: "file",
			size: "1.2K",
			date: "2026-03-11",
			content: [
				"WELCOME TO THE LEMONSAURUS MAINFRAME.",
				"",
				"THIS SYSTEM RUNS LEMON/87 ON A MOS 6510 PROCESSOR.",
				"ALL FILES ARE PROPERTY OF THE ROYAL KINGDOM OF ESTONIA, DON'T ASK",
				"",
				"TYPE 'HELP' FOR AVAILABLE COMMANDS.",
				"TYPE 'LS' TO BROWSE FILES.",
				"TYPE 'NEOFETCH' FOR SYSTEM INFO.",
			].join("\n"),
		},
		"ABOUT.TXT": {
			type: "file",
			size: "0.8K",
			date: "2026-01-15",
			content: [
				"NAME:     LEMONSAURUS",
				"CLASS:    SOFTWARE ENGINEER",
				"HOBBIES:  PIANO, GAMEDEV, COMMUNITY BUILDING",
				"LOCATION: OSLO, NORWAY",
				"STATUS:   QUIET CONFIDENCE",
			].join("\n"),
		},
		PROJECTS: {
			type: "dir",
			date: "2026-03-01",
			children: {
				"BLACKBOX.GIT": {
					type: "file",
					size: "3.2K",
					date: "2025-04-18",
					content: [
						"PROJECT: BLACKBOX",
						"LANG: PYTHON",
						"REPO: HTTPS://GITHUB.COM/LEMONSAURUS/BLACKBOX",
						"",
						"AUTOMATED DATABASE BACKUP SERVICE.",
						"CRON-SCHEDULED, DOCKER-READY.",
						"",
						"SUPPORTS: MONGODB, POSTGRESQL, MYSQL, REDIS",
						"STORAGE: S3, DROPBOX",
						"ALERTS: DISCORD, SLACK, TELEGRAM",
					].join("\n"),
				},
				"AGENCY.GIT": {
					type: "file",
					size: "2.8K",
					date: "2026-02-10",
					content: [
						"PROJECT: AGENCY",
						"LANG: GO",
						"REPO: HTTPS://GITHUB.COM/LEMONSAURUS/AGENCY",
						"",
						"TERMINAL MULTIPLEXER FOR AI AGENT SESSIONS.",
						"BLOOMBERG-STYLE GRID LAYOUT FOR ULTRAWIDES.",
						"",
						"COLOR-CODED PANES, DIRECTORY-AWARE SPAWNING,",
						"OPTIONAL FIREJAIL SANDBOXING.",
					].join("\n"),
				},
				"MIRADOR.GIT": {
					type: "file",
					size: "4.1K",
					date: "2026-01-22",
					content: [
						"PROJECT: MIRADOR",
						"LANG: RUST",
						"REPO: HTTPS://GITHUB.COM/LEMONSAURUS/MIRADOR",
						"",
						"TUI DASHBOARD FOR DOCKER COMPOSE.",
						"REPLACES 'DOCKER COMPOSE LOGS -F'.",
						"",
						"REAL-TIME LOG STREAMING, CONTAINER HEALTH,",
						"COLOR-CODED FILTERABLE LOGS, 30FPS RENDERING.",
					].join("\n"),
				},
				"OOMFIES.GAY": {
					type: "file",
					size: "1.4K",
					date: "2025-11-05",
					content: [
						"PROJECT: OOMFIES.GAY",
						"URL: HTTPS://OOMFIES.GAY",
						"",
						"QUEER GAMING COMMUNITY.",
						"STARTED AS A WOW GUILD, NOW A",
						"DISCORD-BASED HUB FOR FRIENDS WHO",
						"GAME AND HANG OUT TOGETHER.",
					].join("\n"),
				},
				"HIDEOUS.MONSTER": {
					type: "file",
					size: "1.8K",
					date: "2026-03-10",
					content: [
						"PROJECT: HIDEOUS MONSTER",
						"URL: HTTPS://HIDEOUS.MONSTER",
						"",
						"CONSULTING FIRM FOR STARTUPS AND SCALE-UPS.",
						"HELPS TEAMS BUILD STRONG ENGINEERING DEPARTMENTS.",
						"",
						"ALSO BUILDS MICRO-SAAS PRODUCTS AND",
						"OPEN-SOURCE DEVELOPER TOOLS.",
					].join("\n"),
				},
				"TINYDOOM.COM": {
					type: "file",
					size: "0.5K",
					date: "2026-03-11",
					content: [
						"PROJECT: TINY DOOM",
						"URL: HTTPS://TINYDOOM.COM",
						"",
						"VIDEO GAME STUDIO.",
						"NOT QUITE READY YET. SOON.",
					].join("\n"),
				},
				"PYDIS.GIT": {
					type: "file",
					size: "2.6K",
					date: "2026-03-01",
					content: [
						"PROJECT: PYTHON DISCORD",
						"URL: HTTPS://PYTHONDISCORD.COM",
						"",
						"ONE OF THE LARGEST PYTHON COMMUNITIES.",
						"100+ VOLUNTEER EXPERT HELPERS.",
						"",
						"CODE JAMS, HACKATHONS, SEASONAL EVENTS.",
						"OPEN-SOURCE BOT AND TOOLING.",
					].join("\n"),
				},
			},
		},
		".HIDDEN": {
			type: "file",
			size: "0.1K",
			date: "1987-08-01",
			content: "YOU FOUND THE HIDDEN FILE. HAVE A LEMON: 🍋",
		},
		".EGG-TODOS": {
			type: "file",
			size: "0.4K",
			date: "2025-12-03",
			content: [
				"EASTER EGG TODO LIST (DO NOT SHIP THIS FILE)",
				"",
				"* HIDE SOMETHING COOL BEHIND THE KONAMI CODE..",
				"  IF I COULD JUST REMEMBER WHAT IT WAS AGAIN?",
				"  UP UP DOWN SOMETHING?",
				"* MAKE THE SNAKE EAT ITSELF?? TOO DARK?",
				"* MAYBE A SECRET GAME IF YOU TYPE THE RIGHT THING",
				"* ASK CARL ABOUT THAT THING WITH THE LEMONS",
			].join("\n"),
		},
		".COMMANDS": {
			type: "file",
			size: "0.6K",
			date: "2026-03-15",
			content: [
				"CHEAT SHEET — ALL TERMINAL COMMANDS",
				"",
				"HELP       SHOW AVAILABLE COMMANDS",
				"ABOUT      WHO IS LEMONSAURUS?",
				"LINKS      SOCIAL LINKS",
				"SNAKE      PLAY LEMON SNAKE",
				"MATRIX     THE ZEN OF DIGITAL RAIN",
				"HACK       HACKER MODE",
				"DOOM       PLAY DOOM (CRISPY DOOM WASM)",
				"TETRIS     PLAY TETRIS",
				"PONG       LEMON PONG VS CPU",
				"WEATHER    CHECK THE WEATHER (TRY: WEATHER TOKYO)",
				"FORTUNE    WORDS OF WISDOM",
				"NEOFETCH   SYSTEM INFO",
				"CLEAR/CLS  CLEAR SCREEN",
				"LS [-A]    LIST FILES (WITH HIDDEN)",
				"CD         CHANGE DIRECTORY",
				"CAT/NANO   READ A FILE",
				"PWD        PRINT WORKING DIRECTORY",
				"ECHO       ECHO TEXT BACK",
				"RM -RF /   DON'T.",
				"SUDO       TRY IT.",
			].join("\n"),
		},
	},
};

let currentPath: string[] = [];

function resolvePath(path: string): string[] {
	if (path === "/") return [];
	if (path === "~") return [];

	const parts = path === ".." ? [".."] : path.split("/").filter(Boolean);
	const resolved = path.startsWith("/") ? [] : [...currentPath];

	for (const part of parts) {
		if (part === "." || part === "") continue;
		if (part === "..") {
			resolved.pop();
		} else {
			resolved.push(part.toUpperCase());
		}
	}

	return resolved;
}

function getNode(path: string[]): FsNode | null {
	let node: FsNode = FILESYSTEM;
	for (const part of path) {
		if (node.type !== "dir") return null;
		const child: FsNode | undefined = node.children[part];
		if (!child) return null;
		node = child;
	}
	return node;
}

export function pwd(): string {
	return `/${currentPath.join("/")}`;
}

export function ls(args: string): string[] {
	// Show hidden files if any flag argument contains 'a' (e.g. -a, -la, -lla, -al)
	const flags = args.split(/\s+/).filter((a) => a.startsWith("-"));
	const showHidden = flags.some((f) => f.slice(1).includes("a"));
	const targetArg = args
		.split(/\s+/)
		.filter((a) => !a.startsWith("-"))
		.join("");
	const targetPath = targetArg ? resolvePath(targetArg) : currentPath;
	const node = getNode(targetPath);

	if (!node) return [`LS: CANNOT ACCESS '${targetArg.toUpperCase()}': NO SUCH FILE OR DIRECTORY`];
	if (node.type === "file") return [`${targetArg.toUpperCase()}`];

	const entries = Object.entries(node.children);
	const lines: string[] = [];

	for (const [name, child] of entries) {
		if (name.startsWith(".") && !showHidden) continue;
		if (child.type === "dir") {
			lines.push(`  ${name.padEnd(20)} <DIR>      ${child.date}`);
		} else {
			lines.push(`  ${name.padEnd(20)} ${child.size.padEnd(10)} ${child.date}`);
		}
	}

	return lines.length > 0 ? lines : ["  (EMPTY DIRECTORY)"];
}

export function cd(args: string): string | null {
	const target = args.trim();
	if (!target || target === "~" || target === "/") {
		currentPath = [];
		return null;
	}

	const newPath = resolvePath(target);
	const node = getNode(newPath);

	if (!node) return `CD: NO SUCH DIRECTORY: ${target.toUpperCase()}`;
	if (node.type !== "dir") return `CD: NOT A DIRECTORY: ${target.toUpperCase()}`;

	currentPath = newPath;
	return null;
}

/**
 * Tab-complete a partial filename/dirname relative to the current directory
 * (or a partially typed path like "projects/bl").
 * Returns the completed token, or the original if no unique match.
 */
export function tabComplete(partial: string): string {
	if (!partial) return partial;

	// Split into directory part and the fragment being completed
	const upper = partial.toUpperCase();
	const slashIdx = upper.lastIndexOf("/");
	const dirPart = slashIdx === -1 ? "" : upper.slice(0, slashIdx);
	const fragment = slashIdx === -1 ? upper : upper.slice(slashIdx + 1);

	// Resolve the directory we're completing inside
	const dirPath = dirPart ? resolvePath(dirPart) : [...currentPath];
	const dirNode = getNode(dirPath);

	if (!dirNode || dirNode.type !== "dir") return partial;

	const matches = Object.keys(dirNode.children).filter((name) => name.startsWith(fragment));

	if (matches.length === 0) return partial;

	// Find the longest common prefix among matches
	let common = matches[0]!;
	for (const m of matches) {
		while (!m.startsWith(common)) {
			common = common.slice(0, -1);
		}
	}

	// If the completed name is a directory, add a trailing slash
	const isDir = matches.length === 1 && dirNode.children[common]?.type === "dir";
	const suffix = isDir ? "/" : "";

	const prefix = dirPart ? `${dirPart}/` : "";
	return `${prefix}${common}${suffix}`.toLowerCase();
}

export function cat(args: string): string[] {
	const target = args.trim();
	if (!target) return ["CAT: MISSING FILENAME"];

	const targetPath = resolvePath(target);
	const node = getNode(targetPath);

	if (!node) return [`CAT: ${target.toUpperCase()}: NO SUCH FILE`];
	if (node.type === "dir") return [`CAT: ${target.toUpperCase()}: IS A DIRECTORY`];

	return node.content.split("\n");
}
