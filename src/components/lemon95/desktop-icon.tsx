"use client";

import { useState } from "react";
import type { DesktopApp } from "./types";

interface DesktopIconProps {
	app: DesktopApp;
	onDoubleClick: (app: DesktopApp) => void;
}

export function DesktopIcon({ app, onDoubleClick }: DesktopIconProps) {
	const [selected, setSelected] = useState(false);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: icon grid item
		// biome-ignore lint/a11y/useKeyWithClickEvents: desktop icon uses mouse interaction
		<div
			onClick={(e) => {
				e.stopPropagation();
				setSelected(true);
			}}
			onDoubleClick={(e) => {
				e.stopPropagation();
				onDoubleClick(app);
				setSelected(false);
			}}
			onBlur={() => setSelected(false)}
			style={{
				width: 90,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 6,
				padding: "8px 6px",
				cursor: "pointer",
				outline: selected ? "2px dotted #e8e040" : "2px solid transparent",
				background: selected ? "rgba(232, 224, 64, 0.15)" : "transparent",
				userSelect: "none",
			}}
		>
			{/* Icon */}
			<span
				style={{
					fontSize: 44,
					lineHeight: 1,
					display: "block",
					textAlign: "center",
					filter: "drop-shadow(2px 2px 3px rgba(0,0,0,0.7))",
				}}
				aria-hidden="true"
			>
				{app.icon}
			</span>

			{/* Label */}
			<span
				style={{
					color: "#e8e040",
					fontFamily: "monospace",
					fontSize: 11,
					fontWeight: "bold",
					textAlign: "center",
					lineHeight: 1.4,
					textShadow:
						"1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 0 4px #000",
					wordBreak: "break-word",
					maxWidth: "100%",
					background: "rgba(0,0,0,0.5)",
					padding: "1px 4px",
					borderRadius: 2,
				}}
			>
				{app.title}
			</span>
		</div>
	);
}
