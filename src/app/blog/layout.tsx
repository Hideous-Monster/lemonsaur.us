import type { ReactNode } from "react";

export default function BlogLayout({ children }: { children: ReactNode }) {
	return (
		<div className="relative min-h-screen bg-leaf-900/30">
			{/* Subtle citrus pattern overlay */}
			<div
				className="pointer-events-none absolute inset-0 opacity-[0.02]"
				style={{
					backgroundImage: `radial-gradient(circle at 20% 50%, #FFD700 1px, transparent 1px),
						radial-gradient(circle at 80% 20%, #4caf50 1px, transparent 1px),
						radial-gradient(circle at 60% 80%, #FFD700 1px, transparent 1px)`,
					backgroundSize: "100px 100px, 150px 150px, 120px 120px",
				}}
			/>
			<div className="relative">{children}</div>
		</div>
	);
}
