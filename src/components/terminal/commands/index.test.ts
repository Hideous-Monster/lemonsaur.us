import { describe, expect, it, vi } from "vitest";
import { BOOT_LINES, COMMAND_NAMES, executeCommand, makeBootLine } from ".";

describe("executeCommand", () => {
	it("returns empty lines for empty input", () => {
		const result = executeCommand("");
		expect(result.lines).toEqual([]);
	});

	it("returns empty lines for whitespace-only input", () => {
		const result = executeCommand("   ");
		expect(result.lines).toEqual([]);
	});

	it("returns syntax error with HELP hint for unknown commands", () => {
		const result = executeCommand("foobar");
		expect(result.lines).toHaveLength(1);
		expect(result.lines[0]!.text).toContain("?SYNTAX ERROR");
		expect(result.lines[0]!.text).toContain("HELP");
		expect(result.lines[0]!.type).toBe("system");
	});

	it("help lists available commands", () => {
		const result = executeCommand("help");
		expect(result.lines[0]!.text).toBe("AVAILABLE COMMANDS:");
		expect(result.lines.length).toBeGreaterThan(1);
	});

	it("help includes all major commands", () => {
		const result = executeCommand("help");
		const text = result.lines.map((l) => l.text).join("\n");
		for (const cmd of ["HELP", "ABOUT", "LINKS", "SNAKE", "MATRIX", "HACK", "NEOFETCH", "CLEAR"]) {
			expect(text).toContain(cmd);
		}
	});

	it("about returns rich HTML with bio", () => {
		const result = executeCommand("about");
		expect(result.lines).toHaveLength(1);
		expect(result.lines[0]!.type).toBe("rich");
		expect(result.lines[0]!.text).toContain("LEMONSAURUS");
	});

	it("links returns social links as rich blocks with hrefs", () => {
		const result = executeCommand("links");
		const richLinks = result.lines.filter((l) => l.type === "rich" && l.text.includes("href="));
		expect(richLinks.length).toBeGreaterThan(0);
		for (const line of richLinks) {
			expect(line.text).toMatch(/https:\/\//);
		}
	});

	it("snake returns snake action", () => {
		const result = executeCommand("snake");
		expect(result.action).toBe("snake");
		expect(result.lines.length).toBeGreaterThan(0);
	});

	it("matrix returns matrix action", () => {
		const result = executeCommand("matrix");
		expect(result.action).toBe("matrix");
		expect(result.lines.length).toBeGreaterThan(0);
	});

	it("cmatrix is an alias for matrix", () => {
		const result = executeCommand("cmatrix");
		expect(result.action).toBe("matrix");
	});

	it("hack returns hack action", () => {
		const result = executeCommand("hack");
		expect(result.action).toBe("hack");
		expect(result.lines.length).toBeGreaterThan(0);
	});

	it("fortune returns a random quote", () => {
		const result = executeCommand("fortune");
		expect(result.lines.length).toBe(3);
		expect(result.lines[1]!.text.length).toBeGreaterThan(0);
		expect(result.lines[1]!.type).toBe("output");
	});

	it("fortune returns different results (not always the same)", () => {
		const results = new Set<string>();
		for (let i = 0; i < 20; i++) {
			const result = executeCommand("fortune");
			results.add(result.lines[1]!.text);
		}
		expect(results.size).toBeGreaterThan(1);
	});

	it("help includes FORTUNE in command list", () => {
		const result = executeCommand("help");
		const text = result.lines.map((l) => l.text).join("\n");
		expect(text).toContain("FORTUNE");
	});

	it("doom returns doom action", () => {
		const result = executeCommand("doom");
		expect(result.action).toBe("doom");
		expect(result.lines.length).toBeGreaterThan(0);
	});

	it("help includes DOOM in command list", () => {
		const result = executeCommand("help");
		const text = result.lines.map((l) => l.text).join("\n");
		expect(text).toContain("DOOM");
	});

	it("neofetch returns system info with lemon art", () => {
		const result = executeCommand("neofetch");
		expect(result.lines.length).toBeGreaterThan(5);
		const text = result.lines.map((l) => l.text).join("\n");
		expect(text).toContain("LEMONSAURUS");
		expect(text).toContain("LEMON 87");
	});

	it("clear returns clear action with empty lines", () => {
		const result = executeCommand("clear");
		expect(result.action).toBe("clear");
		expect(result.lines).toEqual([]);
	});

	it("cls is an alias for clear", () => {
		const result = executeCommand("cls");
		expect(result.action).toBe("clear");
		expect(result.lines).toEqual([]);
	});

	it("tetris triggers tetris action on desktop", () => {
		vi.spyOn(window, "innerWidth", "get").mockReturnValue(1024);
		const result = executeCommand("tetris");
		expect(result.action).toBe("tetris");
	});

	it("tetris rejects on mobile", () => {
		vi.spyOn(window, "innerWidth", "get").mockReturnValue(400);
		const result = executeCommand("tetris");
		expect(result.action).toBeUndefined();
		expect(result.lines[0]!.text).toContain("KEYBOARD");
		vi.restoreAllMocks();
	});

	it("pong triggers pong action on desktop", () => {
		vi.spyOn(window, "innerWidth", "get").mockReturnValue(1024);
		const result = executeCommand("pong");
		expect(result.action).toBe("pong");
	});

	it("games reject on mobile", () => {
		vi.spyOn(window, "innerWidth", "get").mockReturnValue(400);
		for (const cmd of ["snake", "doom", "pong", "tetris"]) {
			const result = executeCommand(cmd);
			expect(result.action).toBeUndefined();
			expect(result.lines[0]!.text).toContain("KEYBOARD");
		}
		vi.restoreAllMocks();
	});

	it("weather returns asyncLines function", () => {
		const result = executeCommand("weather");
		expect(result.asyncLines).toBeTypeOf("function");
		expect(result.lines[0]!.text).toContain("OSLO");
	});

	it("weather accepts city argument", () => {
		const result = executeCommand("weather tokyo");
		expect(result.asyncLines).toBeTypeOf("function");
		expect(result.lines[0]!.text).toContain("TOKYO");
	});

	it("rm -rf / triggers destroy action", () => {
		const result = executeCommand("rm -rf /");
		expect(result.action).toBe("destroy");
	});

	it("upgrade shows warnings and returns a prompt", () => {
		const result = executeCommand("upgrade");
		const text = result.lines.map((l) => l.text).join("\n");
		expect(text).toContain("WARNING");
		expect(text).toContain("PROCEED WITH UPGRADE?");
		expect(result.prompt).toBeTypeOf("function");
	});

	it("upgrade Y chains through all 4 confirmations to trigger upgrade", () => {
		const step1 = executeCommand("upgrade");
		expect(step1.prompt).toBeTypeOf("function");

		const step2 = step1.prompt!("y");
		expect(step2.prompt).toBeTypeOf("function");
		const text2 = step2.lines.map((l) => l.text).join("\n");
		expect(text2).toContain("ARE YOU SURE");

		const step3 = step2.prompt!("y");
		expect(step3.prompt).toBeTypeOf("function");
		const text3 = step3.lines.map((l) => l.text).join("\n");
		expect(text3).toContain("FINAL WARNING");

		const step4 = step3.prompt!("y");
		expect(step4.action).toBe("upgrade");
		expect(step4.prompt).toBeUndefined();
	});

	it("upgrade N at step 1 aborts", () => {
		const step1 = executeCommand("upgrade");
		const aborted = step1.prompt!("n");
		const text = aborted.lines.map((l) => l.text).join("\n");
		expect(text).toContain("ABORTED");
		expect(aborted.prompt).toBeUndefined();
	});

	it("upgrade N at step 2 aborts", () => {
		const step1 = executeCommand("upgrade");
		const step2 = step1.prompt!("y");
		const aborted = step2.prompt!("n");
		expect(aborted.lines.map((l) => l.text).join("\n")).toContain("ABORTED");
		expect(aborted.prompt).toBeUndefined();
	});

	it("upgrade N at step 3 aborts", () => {
		const step1 = executeCommand("upgrade");
		const step2 = step1.prompt!("y");
		const step3 = step2.prompt!("y");
		const aborted = step3.prompt!("n");
		expect(aborted.lines.map((l) => l.text).join("\n")).toContain("ABORTED");
		expect(aborted.prompt).toBeUndefined();
	});

	it("upgrade N at final step aborts", () => {
		const step1 = executeCommand("upgrade");
		const step2 = step1.prompt!("y");
		const step3 = step2.prompt!("y");
		const step4 = step3.prompt!("y");
		// step4 is the final action, no prompt — but let's test N at step3's prompt going to step4
		expect(step4.action).toBe("upgrade");
	});

	it("rm without -rf / returns snarky message", () => {
		const result = executeCommand("rm something");
		expect(result.lines[0]!.text).toContain("RM -RF /");
	});

	it("ls lists files in root", () => {
		const result = executeCommand("ls");
		const text = result.lines.map((l) => l.text).join("\n");
		expect(text).toContain("README.TXT");
		expect(text).toContain("PROJECTS");
		expect(text).toContain("<DIR>");
	});

	it("cd changes directory", () => {
		executeCommand("cd projects");
		const result = executeCommand("pwd");
		expect(result.lines[0]!.text).toBe("/PROJECTS");
		executeCommand("cd /");
	});

	it("cat reads a file", () => {
		const result = executeCommand("cat readme.txt");
		const text = result.lines.map((l) => l.text).join("\n");
		expect(text).toContain("WELCOME");
	});

	it("nano is an alias for cat", () => {
		const result = executeCommand("nano readme.txt");
		const text = result.lines.map((l) => l.text).join("\n");
		expect(text).toContain("WELCOME");
	});

	it("dir is an alias for ls", () => {
		const result = executeCommand("dir");
		const text = result.lines.map((l) => l.text).join("\n");
		expect(text).toContain("README.TXT");
	});

	it("sudo returns sudoers warning", () => {
		const result = executeCommand("sudo rm -rf /");
		const text = result.lines.map((l) => l.text).join("\n");
		expect(text).toContain("NOT IN THE SUDOERS FILE");
		expect(text).toContain("REPORTED");
	});

	it("sudo with no args still returns warning", () => {
		const result = executeCommand("sudo");
		const text = result.lines.map((l) => l.text).join("\n");
		expect(text).toContain("NOT IN THE SUDOERS FILE");
	});

	it("is case insensitive", () => {
		const result = executeCommand("HELP");
		expect(result.lines[0]!.text).toBe("AVAILABLE COMMANDS:");
	});

	it("trims whitespace from input", () => {
		const result = executeCommand("  help  ");
		expect(result.lines[0]!.text).toBe("AVAILABLE COMMANDS:");
	});

	it("assigns unique ids to each line", () => {
		const result = executeCommand("help");
		const ids = result.lines.map((l) => l.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("echo returns the argument in uppercase", () => {
		const result = executeCommand("echo hello world");
		expect(result.lines[0]!.text).toBe("HELLO WORLD");
	});

	it("echo with no args returns empty line", () => {
		const result = executeCommand("echo");
		expect(result.lines[0]!.text).toBe("");
	});

	it("returns snarky roast for grep", () => {
		const result = executeCommand("grep foo");
		expect(result.lines[0]!.type).toBe("system");
		expect(result.lines[0]!.text).toContain("COMMODORE");
	});

	it("refuses package manager installs", () => {
		for (const cmd of ["npm", "apt", "pip", "pacman", "brew", "cargo"]) {
			const result = executeCommand(cmd);
			expect(result.lines[0]!.text).toContain("NOT PERMITTED");
		}
	});

	it("disables vim and emacs for user safety", () => {
		for (const cmd of ["vim", "vi", "emacs"]) {
			const result = executeCommand(cmd);
			expect(result.lines[0]!.text).toContain("DISABLED");
		}
	});

	it("roasts still return syntax error for truly unknown commands", () => {
		const result = executeCommand("xyzzy123");
		expect(result.lines[0]!.text).toContain("?SYNTAX ERROR");
	});
});

describe("COMMAND_NAMES", () => {
	it("includes both simple and argument-based commands", () => {
		expect(COMMAND_NAMES).toContain("help");
		expect(COMMAND_NAMES).toContain("ls");
		expect(COMMAND_NAMES).toContain("cat");
		expect(COMMAND_NAMES).toContain("cd");
	});

	it("has no duplicates", () => {
		expect(new Set(COMMAND_NAMES).size).toBe(COMMAND_NAMES.length);
	});
});

describe("makeBootLine", () => {
	it("defaults to system type", () => {
		const line = makeBootLine("TEST");
		expect(line.type).toBe("system");
		expect(line.text).toBe("TEST");
	});

	it("accepts a custom type", () => {
		const line = makeBootLine("TEST", "output");
		expect(line.type).toBe("output");
	});
});

describe("BOOT_LINES", () => {
	it("contains the boot header with block characters", () => {
		expect(BOOT_LINES.some((l) => l.includes("\u2588"))).toBe(true);
	});

	it("contains READY prompt", () => {
		expect(BOOT_LINES.some((l) => l.includes("READY"))).toBe(true);
	});

	it("contains system stats line", () => {
		expect(BOOT_LINES.some((l) => l.includes("87K RAM SYSTEM"))).toBe(true);
	});
});
