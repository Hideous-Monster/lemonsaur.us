import type { Metadata } from "next";
import { PostCard } from "@/components/blog/post-card";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
	title: "Blog",
	description: "Thoughts, tutorials, and musings from a lemon dinosaur.",
};

export default function BlogPage() {
	const posts = getAllPosts();

	return (
		<div>
			<h1 className="mb-8 font-pixel text-2xl text-c64-white">BLOG</h1>

			{posts.length === 0 ? (
				<p className="font-pixel text-xs text-c64-muted">NO POSTS YET. CHECK BACK SOON!</p>
			) : (
				<div className="flex flex-col gap-6">
					{posts.map((post) => (
						<PostCard key={post.slug} post={post} />
					))}
				</div>
			)}
		</div>
	);
}
