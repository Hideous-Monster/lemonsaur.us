import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

const CONTENT_DIR = path.join(process.cwd(), "src/content/blog");

export interface BlogPost {
	slug: string;
	title: string;
	description: string;
	date: string;
	tags: string[];
	readingTime: string;
	content: string;
}

export function getAllPosts(): BlogPost[] {
	if (!fs.existsSync(CONTENT_DIR)) {
		return [];
	}

	const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));

	const posts = files
		.map((filename) => {
			const slug = filename.replace(/\.mdx$/, "");
			return getPostBySlug(slug);
		})
		.filter((post): post is BlogPost => post !== null);

	return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
	const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);

	if (!fs.existsSync(filePath)) {
		return null;
	}

	const raw = fs.readFileSync(filePath, "utf-8");
	const { data, content } = matter(raw);
	const stats = readingTime(content);

	return {
		slug,
		title: data.title ?? slug,
		description: data.description ?? "",
		date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
		tags: Array.isArray(data.tags) ? data.tags : [],
		readingTime: stats.text,
		content,
	};
}

export function getAllSlugs(): string[] {
	if (!fs.existsSync(CONTENT_DIR)) {
		return [];
	}
	return fs
		.readdirSync(CONTENT_DIR)
		.filter((f) => f.endsWith(".mdx"))
		.map((f) => f.replace(/\.mdx$/, ""));
}
