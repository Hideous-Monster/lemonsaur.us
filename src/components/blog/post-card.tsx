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
			<article className="border-2 border-c64-dim p-6 transition-all duration-300 hover:border-c64-text">
				<h2 className="mb-2 font-pixel text-sm uppercase text-c64-white transition-colors group-hover:text-c64-yellow">
					{post.title}
				</h2>

				{post.description && (
					<p className="mb-4 text-sm text-c64-text line-clamp-2">{post.description}</p>
				)}

				<div className="mb-3 flex flex-wrap gap-2">
					{post.tags.map((tag) => (
						<span
							key={tag}
							className="border border-c64-green px-2.5 py-0.5 text-xs text-c64-green"
						>
							{tag}
						</span>
					))}
				</div>

				<div className="flex items-center gap-4 text-xs text-c64-muted">
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
