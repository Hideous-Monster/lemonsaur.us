import type { ReactNode } from "react";

export default function BlogLayout({ children }: { children: ReactNode }) {
	return (
		<div className="mx-auto max-w-4xl px-4 py-8">
			<div className="border-2 border-c64-dim bg-c64-bg px-6 py-8 font-mono normal-case sm:px-10 sm:py-12">
				{children}
			</div>
		</div>
	);
}
