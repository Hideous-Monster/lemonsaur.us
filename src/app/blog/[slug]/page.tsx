import type { Metadata } from "next";
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
		<article className="mx-auto max-w-3xl px-4 py-12">
			<header className="mb-8">
				<h1 className="mb-4 text-4xl font-bold text-lemon-300">{post.title}</h1>
				<div className="flex items-center gap-4 text-sm text-surface-400">
					<time dateTime={post.date}>{formattedDate}</time>
					<span>{post.readingTime}</span>
				</div>
				{post.tags.length > 0 && (
					<div className="mt-3 flex flex-wrap gap-2">
						{post.tags.map((tag) => (
							<span
								key={tag}
								className="rounded-full bg-leaf-700/50 px-2.5 py-0.5 text-xs font-medium text-leaf-200"
							>
								{tag}
							</span>
						))}
					</div>
				)}
			</header>

			<div className="prose prose-lg prose-lemon max-w-none">
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
