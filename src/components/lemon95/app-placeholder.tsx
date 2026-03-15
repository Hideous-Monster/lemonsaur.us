"use client";

interface AppPlaceholderProps {
	appName: string;
}

export function AppPlaceholder({ appName }: AppPlaceholderProps) {
	return (
		<div
			style={{
				flex: 1,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				background: "#0a140a",
				color: "#e8e040",
				fontFamily: "monospace",
				fontSize: 14,
				gap: 8,
			}}
		>
			<span style={{ fontSize: 36 }}>🚧</span>
			<span style={{ fontWeight: "bold" }}>{appName}</span>
			<span style={{ color: "#688850", fontSize: 11 }}>Coming Soon</span>
		</div>
	);
}
