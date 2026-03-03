import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

function CustomLink(props: ComponentPropsWithoutRef<"a">) {
	const href = props.href;

	if (href?.startsWith("/")) {
		return <Link href={href} {...props} />;
	}

	if (href?.startsWith("#")) {
		return <a {...props} />;
	}

	return <a target="_blank" rel="noopener noreferrer" {...props} />;
}

function CustomImage(props: ComponentPropsWithoutRef<"img">) {
	const src = typeof props.src === "string" ? props.src : "";
	const isLemoji = src.startsWith("/images/lemoji/");

	if (isLemoji) {
		return (
			// biome-ignore lint/performance/noImgElement: 24px inline emoji, next/image optimisation not needed
			<img src={src} alt={props.alt ?? ""} className="inline-block h-6 w-6 align-text-bottom" />
		);
	}

	return <Image src={src} alt={props.alt ?? ""} width={800} height={450} className="rounded-lg" />;
}

export const mdxComponents: MDXComponents = {
	a: CustomLink as MDXComponents["a"],
	img: CustomImage as MDXComponents["img"],
	h1: (props) => <h1 className="mt-8 mb-4 text-3xl font-bold text-lemon-300" {...props} />,
	h2: (props) => <h2 className="mt-6 mb-3 text-2xl font-bold text-lemon-300" {...props} />,
	h3: (props) => <h3 className="mt-4 mb-2 text-xl font-semibold text-lemon-400" {...props} />,
	blockquote: (props) => (
		<blockquote className="border-l-4 border-leaf-500 pl-4 italic text-surface-300" {...props} />
	),
	code: (props) => (
		<code
			className="rounded bg-leaf-900 px-1.5 py-0.5 text-sm font-mono text-lemon-300"
			{...props}
		/>
	),
};
