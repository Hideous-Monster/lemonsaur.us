import type { ReactNode } from "react";

export default function BlogLayout({ children }: { children: ReactNode }) {
	return (
		<div className="mx-auto max-w-4xl px-4 py-8">
			<div className="rounded-2xl bg-leaf-900/85 px-6 py-8 shadow-2xl backdrop-blur-sm sm:px-10 sm:py-12">
				{children}
			</div>
		</div>
	);
}
