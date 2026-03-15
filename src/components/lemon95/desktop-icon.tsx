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
				width: 72,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 4,
				padding: "6px 4px",
				cursor: "pointer",
				outline: selected ? "1px dotted #e8e040" : "1px solid transparent",
				background: selected ? "rgba(232, 224, 64, 0.15)" : "transparent",
				userSelect: "none",
			}}
		>
			{/* Icon */}
			<span
				style={{
					fontSize: 32,
					lineHeight: 1,
					display: "block",
					textAlign: "center",
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
					fontSize: 10,
					textAlign: "center",
					lineHeight: 1.3,
					textShadow: "1px 1px 2px #000, -1px -1px 2px #000",
					wordBreak: "break-word",
					maxWidth: "100%",
				}}
			>
				{app.title}
			</span>
		</div>
	);
}
