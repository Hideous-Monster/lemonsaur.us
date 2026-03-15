"use client";

export function BlogApp() {
	return (
		<div
			style={{
				flex: 1,
				display: "flex",
				flexDirection: "column",
				background: "#c0c0c0",
				overflow: "hidden",
			}}
		>
			{/* Address bar */}
			<div
				style={{
					display: "flex",
					gap: 6,
					padding: "3px 6px",
					background: "#c0c0c0",
					borderBottom: "2px solid #808080",
					flexShrink: 0,
					alignItems: "center",
					fontFamily: "Arial, sans-serif",
				}}
			>
				<span style={{ fontSize: 11, color: "#000" }}>Location:</span>
				<div
					style={{
						flex: 1,
						background: "#fff",
						border: "1px inset #808080",
						padding: "1px 4px",
						fontSize: 11,
						fontFamily: "monospace",
						color: "#000080",
					}}
				>
					http://lemonsaur.us/blog
				</div>
			</div>

			{/* Blog iframe */}
			<iframe
				src="/blog"
				title="Blog"
				style={{
					flex: 1,
					border: "none",
					background: "#fff",
				}}
			/>
		</div>
	);
}
