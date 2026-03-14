import { describe, expect, it } from "vitest";
import { BOOT_LINES, executeCommand, makeBootLine } from ".";

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

	it("links returns social links with hrefs", () => {
		const result = executeCommand("links");
		const linkLines = result.lines.filter((l) => l.href);
		expect(linkLines.length).toBeGreaterThan(0);
		for (const line of linkLines) {
			expect(line.href).toMatch(/^https:\/\//);
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

	it("rm -rf / triggers destroy action", () => {
		const result = executeCommand("rm -rf /");
		expect(result.action).toBe("destroy");
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
