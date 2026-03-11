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
			<img
				src={src}
				alt={props.alt ?? ""}
				className="not-prose inline-block h-6 w-6 align-text-bottom"
			/>
		);
	}

	return <Image src={src} alt={props.alt ?? ""} width={800} height={450} />;
}

export const mdxComponents: MDXComponents = {
	a: CustomLink as MDXComponents["a"],
	img: CustomImage as MDXComponents["img"],
	h1: (props) => <h1 className="mt-8 mb-4 text-2xl font-bold text-c64-white" {...props} />,
	h2: (props) => <h2 className="mt-6 mb-3 text-xl font-bold text-c64-white" {...props} />,
	h3: (props) => <h3 className="mt-4 mb-2 text-lg font-semibold text-c64-text" {...props} />,
	blockquote: (props) => (
		<blockquote className="border-l-4 border-c64-green pl-4 italic text-c64-text" {...props} />
	),
	code: (props) => (
		<code className="bg-c64-black px-1.5 py-0.5 text-sm text-c64-lgreen" {...props} />
	),
};
