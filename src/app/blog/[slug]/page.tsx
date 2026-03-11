import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import { mdxComponents } from "@/components/blog/mdx-components";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";
import { SITE_NAME } from "@/lib/constants";
import remarkLemoji from "@/lib/remark-lemoji";

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
	return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const post = getPostBySlug(slug);
	if (!post) return {};

	return {
		title: post.title,
		description: post.description,
		openGraph: {
			title: `${post.title} | ${SITE_NAME}`,
			description: post.description,
			type: "article",
			publishedTime: post.date,
			tags: post.tags,
		},
	};
}

export default async function BlogPostPage({ params }: PageProps) {
	const { slug } = await params;
	const post = getPostBySlug(slug);

	if (!post) {
		notFound();
	}

	const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<article>
			<header className="mb-8">
				<h1 className="mb-4 text-2xl font-bold text-c64-white">{post.title}</h1>
				<div className="flex items-center gap-4 text-sm text-c64-muted">
					<time dateTime={post.date}>{formattedDate}</time>
					<span>{post.readingTime}</span>
				</div>
				{post.tags.length > 0 && (
					<div className="mt-3 flex flex-wrap gap-2">
						{post.tags.map((tag) => (
							<Link
								key={tag}
								href={`/blog?tag=${encodeURIComponent(tag)}`}
								className="border border-c64-green px-2.5 py-0.5 text-xs text-c64-green transition-colors hover:bg-c64-green hover:text-c64-bg"
							>
								{tag}
							</Link>
						))}
					</div>
				)}
			</header>

			<div className="prose prose-lg prose-c64 max-w-none">
				<MDXRemote
					source={post.content}
					components={mdxComponents}
					options={{
						mdxOptions: {
							remarkPlugins: [remarkLemoji],
							rehypePlugins: [[rehypePrettyCode, { theme: "vitesse-dark", keepBackground: true }]],
						},
					}}
				/>
			</div>
		</article>
	);
}
