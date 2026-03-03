import { Calendar, Clock } from "lucide-react";
import Link from "next/link";
import type { BlogPost } from "@/lib/blog";

interface PostCardProps {
	post: BlogPost;
}

export function PostCard({ post }: PostCardProps) {
	const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<Link href={`/blog/${post.slug}`} className="group block">
			<article className="rounded-xl border border-leaf-700/50 bg-leaf-800/50 p-6 transition-all duration-300 hover:border-lemon-500/50 hover:bg-leaf-800/80 hover:shadow-lg hover:shadow-lemon-500/5">
				<h2 className="mb-2 text-xl font-bold text-surface-100 transition-colors group-hover:text-lemon-300">
					{post.title}
				</h2>

				{post.description && (
					<p className="mb-4 text-sm text-surface-400 line-clamp-2">{post.description}</p>
				)}

				<div className="mb-3 flex flex-wrap gap-2">
					{post.tags.map((tag) => (
						<span
							key={tag}
							className="rounded-full bg-leaf-700/50 px-2.5 py-0.5 text-xs font-medium text-leaf-200"
						>
							{tag}
						</span>
					))}
				</div>

				<div className="flex items-center gap-4 text-xs text-surface-500">
					<span className="flex items-center gap-1">
						<Calendar size={12} />
						{formattedDate}
					</span>
					<span className="flex items-center gap-1">
						<Clock size={12} />
						{post.readingTime}
					</span>
				</div>
			</article>
		</Link>
	);
}
