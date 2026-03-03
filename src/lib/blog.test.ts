import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockExistsSync = vi.fn();
const mockReadFileSync = vi.fn();
const mockReaddirSync = vi.fn();

vi.mock("node:fs", () => ({
	default: {
		existsSync: (...args: unknown[]) => mockExistsSync(...args),
		readFileSync: (...args: unknown[]) => mockReadFileSync(...args),
		readdirSync: (...args: unknown[]) => mockReaddirSync(...args),
	},
	existsSync: (...args: unknown[]) => mockExistsSync(...args),
	readFileSync: (...args: unknown[]) => mockReadFileSync(...args),
	readdirSync: (...args: unknown[]) => mockReaddirSync(...args),
}));

const SAMPLE_MDX = `---
title: "Test Post"
description: "A test blog post"
date: "2026-01-15"
tags: ["test", "sample"]
---

# Hello

This is a test post with some content for reading time.
`;

describe("blog utilities", () => {
	beforeEach(() => {
		vi.resetModules();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("getPostBySlug", () => {
		it("returns a parsed blog post", async () => {
			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue(SAMPLE_MDX);

			const { getPostBySlug } = await import("./blog");
			const post = getPostBySlug("test-post");

			expect(post).not.toBeNull();
			expect(post!.title).toBe("Test Post");
			expect(post!.description).toBe("A test blog post");
			expect(post!.tags).toEqual(["test", "sample"]);
			expect(post!.readingTime).toBeTruthy();
			expect(post!.slug).toBe("test-post");
		});

		it("returns null for missing files", async () => {
			mockExistsSync.mockReturnValue(false);

			const { getPostBySlug } = await import("./blog");
			const post = getPostBySlug("nonexistent");

			expect(post).toBeNull();
		});
	});

	describe("getAllPosts", () => {
		it("returns empty array when no content directory", async () => {
			mockExistsSync.mockReturnValue(false);

			const { getAllPosts } = await import("./blog");
			expect(getAllPosts()).toEqual([]);
		});

		it("returns sorted posts", async () => {
			mockExistsSync.mockReturnValue(true);
			mockReaddirSync.mockReturnValue(["first.mdx", "second.mdx"]);

			const mdx1 = `---
title: "First"
date: "2026-01-01"
---
Content one.`;

			const mdx2 = `---
title: "Second"
date: "2026-02-01"
---
Content two.`;

			mockReadFileSync.mockImplementation((filePath: string) => {
				if (String(filePath).includes("first")) return mdx1;
				return mdx2;
			});

			const { getAllPosts } = await import("./blog");
			const posts = getAllPosts();

			expect(posts).toHaveLength(2);
			expect(posts[0]!.title).toBe("Second");
			expect(posts[1]!.title).toBe("First");
		});
	});

	describe("getAllSlugs", () => {
		it("returns empty array when no content directory", async () => {
			mockExistsSync.mockReturnValue(false);

			const { getAllSlugs } = await import("./blog");
			expect(getAllSlugs()).toEqual([]);
		});

		it("strips .mdx extension from filenames", async () => {
			mockExistsSync.mockReturnValue(true);
			mockReaddirSync.mockReturnValue(["hello-world.mdx", "another-post.mdx"]);

			const { getAllSlugs } = await import("./blog");
			const slugs = getAllSlugs();

			expect(slugs).toEqual(["hello-world", "another-post"]);
		});
	});
});
