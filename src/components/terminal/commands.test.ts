import { describe, expect, it } from "vitest";
import { BOOT_LINES, executeCommand } from "./commands";

describe("executeCommand", () => {
	it("returns empty lines for empty input", () => {
		const result = executeCommand("");
		expect(result.lines).toEqual([]);
	});

	it("returns empty lines for whitespace-only input", () => {
		const result = executeCommand("   ");
		expect(result.lines).toEqual([]);
	});

	it("returns syntax error for unknown commands", () => {
		const result = executeCommand("foobar");
		expect(result.lines).toHaveLength(1);
		expect(result.lines[0]!.text).toBe("?SYNTAX ERROR");
		expect(result.lines[0]!.type).toBe("system");
	});

	it("help lists available commands", () => {
		const result = executeCommand("help");
		expect(result.lines[0]!.text).toBe("AVAILABLE COMMANDS:");
		expect(result.lines.length).toBeGreaterThan(1);
	});

	it("about returns bio information", () => {
		const result = executeCommand("about");
		expect(result.lines[0]!.text).toBe("LEMONSAURUS");
		expect(result.lines.some((l) => l.text.includes("SOFTWARE ENGINEER"))).toBe(true);
	});

	it("links returns social links with hrefs", () => {
		const result = executeCommand("links");
		const linkLines = result.lines.filter((l) => l.href);
		expect(linkLines.length).toBeGreaterThan(0);
		for (const line of linkLines) {
			expect(line.href).toMatch(/^https:\/\//);
		}
	});

	it("blog returns navigate action to /blog", () => {
		const result = executeCommand("blog");
		expect(result.action).toBe("navigate");
		expect(result.href).toBe("/blog");
	});

	it("music returns soundcloud link", () => {
		const result = executeCommand("music");
		const linkLines = result.lines.filter((l) => l.href);
		expect(linkLines.length).toBe(1);
		expect(linkLines[0]!.href).toContain("soundcloud.com");
	});

	it("clear returns clear action", () => {
		const result = executeCommand("clear");
		expect(result.action).toBe("clear");
		expect(result.lines).toEqual([]);
	});

	it("lemon returns a lemoji with image src", () => {
		const result = executeCommand("lemon");
		expect(result.lines).toHaveLength(1);
		expect(result.lines[0]!.lemojiSrc).toMatch(/^\/images\/lemoji\//);
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

describe("BOOT_LINES", () => {
	it("contains the boot header", () => {
		expect(BOOT_LINES.some((l) => l.includes("\u2588"))).toBe(true);
	});

	it("contains READY prompt", () => {
		expect(BOOT_LINES.some((l) => l.includes("READY"))).toBe(true);
	});

	it("contains system stats line", () => {
		expect(BOOT_LINES.some((l) => l.includes("87K RAM SYSTEM"))).toBe(true);
	});
});
