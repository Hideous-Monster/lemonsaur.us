import { afterEach, describe, expect, it } from "vitest";
import { cat, cd, ls, pwd } from "./filesystem";

describe("filesystem", () => {
	// Reset to root after each test
	afterEach(() => {
		cd("/");
	});

	describe("pwd", () => {
		it("starts at root", () => {
			expect(pwd()).toBe("/");
		});

		it("reflects current directory after cd", () => {
			cd("tracks");
			expect(pwd()).toBe("/TRACKS");
		});
	});

	describe("ls", () => {
		it("lists files in root", () => {
			const lines = ls("");
			expect(lines.length).toBeGreaterThan(0);
			expect(lines.some((l) => l.includes("README.TXT"))).toBe(true);
			expect(lines.some((l) => l.includes("TRACKS"))).toBe(true);
			expect(lines.some((l) => l.includes("<DIR>"))).toBe(true);
		});

		it("hides dotfiles by default", () => {
			const lines = ls("");
			expect(lines.some((l) => l.includes(".HIDDEN"))).toBe(false);
		});

		it("shows dotfiles with -a flag", () => {
			const lines = ls("-a");
			expect(lines.some((l) => l.includes(".HIDDEN"))).toBe(true);
		});

		it("lists a subdirectory by path", () => {
			const lines = ls("projects");
			expect(lines.some((l) => l.includes("BLACKBOX.PRG"))).toBe(true);
		});

		it("returns error for nonexistent path", () => {
			const lines = ls("nonexistent");
			expect(lines[0]).toContain("NO SUCH FILE");
		});
	});

	describe("cd", () => {
		it("changes to a subdirectory", () => {
			const err = cd("tracks");
			expect(err).toBeNull();
			expect(pwd()).toBe("/TRACKS");
		});

		it("returns error for nonexistent directory", () => {
			const err = cd("nowhere");
			expect(err).toContain("NO SUCH DIRECTORY");
		});

		it("returns error when targeting a file", () => {
			const err = cd("readme.txt");
			expect(err).toContain("NOT A DIRECTORY");
		});

		it("supports .. to go up", () => {
			cd("tracks");
			cd("..");
			expect(pwd()).toBe("/");
		});

		it("resets to root with /", () => {
			cd("tracks");
			cd("/");
			expect(pwd()).toBe("/");
		});

		it("resets to root with ~", () => {
			cd("projects");
			cd("~");
			expect(pwd()).toBe("/");
		});
	});

	describe("cat", () => {
		it("reads a file", () => {
			const lines = cat("readme.txt");
			expect(lines.length).toBeGreaterThan(1);
			expect(lines[0]).toContain("WELCOME");
		});

		it("reads a file in a subdirectory via path", () => {
			const lines = cat("projects/blackbox.prg");
			expect(lines.some((l) => l.includes("BLACKBOX"))).toBe(true);
		});

		it("reads a file from current directory after cd", () => {
			cd("projects");
			const lines = cat("blackbox.prg");
			expect(lines.some((l) => l.includes("BLACKBOX"))).toBe(true);
		});

		it("returns error for missing file", () => {
			const lines = cat("nope.txt");
			expect(lines[0]).toContain("NO SUCH FILE");
		});

		it("returns error for directory", () => {
			const lines = cat("tracks");
			expect(lines[0]).toContain("IS A DIRECTORY");
		});

		it("returns error when no filename given", () => {
			const lines = cat("");
			expect(lines[0]).toContain("MISSING FILENAME");
		});
	});
});
