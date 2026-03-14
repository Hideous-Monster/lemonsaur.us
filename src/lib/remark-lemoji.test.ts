import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import remarkLemoji from "./remark-lemoji";

async function processMarkdown(md: string): Promise<string> {
	const result = await unified()
		.use(remarkParse)
		.use(remarkLemoji)
		.use(remarkRehype)
		.use(rehypeStringify)
		.process(md);
	return String(result);
}

describe("remarkLemoji", () => {
	it("replaces :smile: with lemoji img", async () => {
		const result = await processMarkdown("Hello :smile:");
		expect(result).toContain('src="/images/lemoji/lemon_smile.png"');
		expect(result).toContain('alt="smile"');
	});

	it("replaces :) with lemoji img", async () => {
		const result = await processMarkdown("Hey :)");
		expect(result).toContain('src="/images/lemoji/lemon_smile.png"');
	});

	it("replaces multiple shortcodes in one line", async () => {
		const result = await processMarkdown("Hello :smile: and :wink:");
		expect(result).toContain("lemon_smile.png");
		expect(result).toContain("lemon_wink.png");
	});

	it("leaves unknown shortcodes untouched", async () => {
		const result = await processMarkdown("Hello :unknown_thing:");
		expect(result).toContain(":unknown_thing:");
		expect(result).not.toContain("lemon_");
	});

	it("does not replace inside code blocks", async () => {
		const result = await processMarkdown("```\n:smile:\n```");
		expect(result).not.toContain("lemon_smile.png");
	});

	it("handles text that is only a shortcode with no surrounding text", async () => {
		const result = await processMarkdown(":smile:");
		expect(result).toContain("lemon_smile.png");
		expect(result).not.toContain(":smile:");
	});

	it("handles text emoticon alt text", async () => {
		const result = await processMarkdown("Hi :)");
		expect(result).toContain('alt=":)"');
	});

	it("preserves surrounding text", async () => {
		const result = await processMarkdown("before :happy: after");
		expect(result).toContain("before");
		expect(result).toContain("after");
		expect(result).toContain("lemon_happy.png");
	});
});
