import { afterEach, describe, expect, it } from "vitest";
import { cat, cd, ls, pwd, tabComplete } from "./filesystem";

describe("filesystem", () => {
	afterEach(() => {
		cd("/");
	});

	describe("pwd", () => {
		it("starts at root", () => {
			expect(pwd()).toBe("/");
		});

		it("reflects current directory after cd", () => {
			cd("projects");
			expect(pwd()).toBe("/PROJECTS");
		});
	});

	describe("ls", () => {
		it("lists files in root", () => {
			const lines = ls("");
			expect(lines.length).toBeGreaterThan(0);
			expect(lines.some((l) => l.includes("README.TXT"))).toBe(true);
			expect(lines.some((l) => l.includes("PROJECTS"))).toBe(true);
			expect(lines.some((l) => l.includes("<DIR>"))).toBe(true);
		});

		it("hides dotfiles by default", () => {
			const lines = ls("");
			expect(lines.some((l) => l.includes(".KONAMI"))).toBe(false);
		});

		it("shows dotfiles with -a flag", () => {
			const lines = ls("-a");
			expect(lines.some((l) => l.includes(".KONAMI"))).toBe(true);
		});

		it("shows dotfiles with -la flag", () => {
			const lines = ls("-la");
			expect(lines.some((l) => l.includes(".KONAMI"))).toBe(true);
		});

		it("shows dotfiles with -al flag", () => {
			const lines = ls("-al");
			expect(lines.some((l) => l.includes(".KONAMI"))).toBe(true);
		});

		it("shows dotfiles with -lla flag", () => {
			const lines = ls("-lla");
			expect(lines.some((l) => l.includes(".KONAMI"))).toBe(true);
		});

		it("lists a subdirectory by path", () => {
			const lines = ls("projects");
			expect(lines.some((l) => l.includes("BLACKBOX.GIT"))).toBe(true);
			expect(lines.some((l) => l.includes("AGENCY.GIT"))).toBe(true);
		});

		it("returns error for nonexistent path", () => {
			const lines = ls("nonexistent");
			expect(lines[0]).toContain("NO SUCH FILE");
		});

		it("lists current directory after cd", () => {
			cd("projects");
			const lines = ls("");
			expect(lines.some((l) => l.includes("BLACKBOX.GIT"))).toBe(true);
		});

		it("shows file sizes and dates", () => {
			const lines = ls("");
			expect(lines.some((l) => l.includes("1.2K"))).toBe(true);
		});
	});

	describe("cd", () => {
		it("changes to a subdirectory", () => {
			const err = cd("projects");
			expect(err).toBeNull();
			expect(pwd()).toBe("/PROJECTS");
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
			cd("projects");
			cd("..");
			expect(pwd()).toBe("/");
		});

		it("resets to root with /", () => {
			cd("projects");
			cd("/");
			expect(pwd()).toBe("/");
		});

		it("resets to root with ~", () => {
			cd("projects");
			cd("~");
			expect(pwd()).toBe("/");
		});

		it("navigates nested paths", () => {
			const err = cd("projects");
			expect(err).toBeNull();
			expect(pwd()).toBe("/PROJECTS");
		});
	});

	describe("cat", () => {
		it("reads a file", () => {
			const lines = cat("readme.txt");
			expect(lines.length).toBeGreaterThan(1);
			expect(lines[0]).toContain("WELCOME");
		});

		it("reads a file in a subdirectory via path", () => {
			const lines = cat("projects/blackbox.git");
			expect(lines.some((l) => l.includes("BLACKBOX"))).toBe(true);
		});

		it("reads a file from current directory after cd", () => {
			cd("projects");
			const lines = cat("blackbox.git");
			expect(lines.some((l) => l.includes("BLACKBOX"))).toBe(true);
		});

		it("returns error for missing file", () => {
			const lines = cat("nope.txt");
			expect(lines[0]).toContain("NO SUCH FILE");
		});

		it("returns error for directory", () => {
			const lines = cat("projects");
			expect(lines[0]).toContain("IS A DIRECTORY");
		});

		it("returns error when no filename given", () => {
			const lines = cat("");
			expect(lines[0]).toContain("MISSING FILENAME");
		});

		it("reads hidden files", () => {
			const lines = cat(".konami");
			expect(lines[0]).toContain("UP UP DOWN DOWN");
		});

		it("reads .konami file with the code", () => {
			const lines = cat(".konami");
			expect(lines.some((l) => l.includes("UP UP DOWN DOWN"))).toBe(true);
		});

		it("reads .hidden_commands file", () => {
			const lines = cat(".hidden_commands");
			expect(lines.some((l) => l.includes("NOT LISTED IN HELP"))).toBe(true);
			expect(lines.some((l) => l.includes("SUDO"))).toBe(true);
		});
	});

	describe("tabComplete", () => {
		it("completes a partial filename", () => {
			const result = tabComplete("READ");
			expect(result).toBe("readme.txt");
		});

		it("completes a directory with trailing slash", () => {
			const result = tabComplete("PROJ");
			expect(result).toBe("projects/");
		});

		it("returns original if no match", () => {
			const result = tabComplete("ZZZZZ");
			expect(result).toBe("ZZZZZ");
		});

		it("returns original for empty input", () => {
			const result = tabComplete("");
			expect(result).toBe("");
		});

		it("completes inside a subdirectory path", () => {
			const result = tabComplete("projects/BLACK");
			expect(result).toBe("projects/blackbox.git");
		});

		it("returns original when path prefix is a file not a dir", () => {
			const result = tabComplete("readme.txt/something");
			expect(result).toBe("readme.txt/something");
		});
	});
});
