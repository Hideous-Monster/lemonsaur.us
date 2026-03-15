import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/blog";

export const dynamic = "force-static";

export function GET() {
	const posts = getAllPosts();
	return NextResponse.json(
		posts.map((p) => ({
			slug: p.slug,
			title: p.title,
			description: p.description,
			date: p.date,
			tags: p.tags,
			readingTime: p.readingTime,
			content: p.content,
		})),
	);
}
