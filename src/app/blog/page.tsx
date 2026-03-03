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
			<h1 className="mb-8 text-4xl font-bold text-lemon-300">Blog</h1>

			{posts.length === 0 ? (
				<p className="text-surface-400">No posts yet. Check back soon!</p>
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
