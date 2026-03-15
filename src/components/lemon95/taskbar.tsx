"use client";

import { useEffect, useState } from "react";
import type { WindowState } from "./types";

const BEVEL_RAISED = {
	borderTop: "2px solid #405030",
	borderLeft: "2px solid #405030",
	borderBottom: "2px solid #1a2a1a",
	borderRight: "2px solid #1a2a1a",
};

const BEVEL_SUNKEN = {
	borderTop: "2px solid #1a2a1a",
	borderLeft: "2px solid #1a2a1a",
	borderBottom: "2px solid #405030",
	borderRight: "2px solid #405030",
};

interface TaskbarProps {
	windows: WindowState[];
	focusedId: string | null;
	onStartClick: () => void;
	onWindowClick: (id: string) => void;
	onMinimize: (id: string) => void;
}

function padTime(n: number) {
	return n.toString().padStart(2, "0");
}

export function Taskbar({
	windows,
	focusedId,
	onStartClick,
	onWindowClick,
	onMinimize,
}: TaskbarProps) {
	const [time, setTime] = useState("");

	useEffect(() => {
		function tick() {
			const now = new Date();
			setTime(`${padTime(now.getHours())}:${padTime(now.getMinutes())}`);
		}
		tick();
		const id = setInterval(tick, 60_000);
		return () => clearInterval(id);
	}, []);

	return (
		<div
			style={{
				position: "fixed",
				bottom: 0,
				left: 0,
				right: 0,
				height: 32,
				background: "#2a3a2a",
				borderTop: "2px solid #405030",
				zIndex: 70,
				display: "flex",
				alignItems: "center",
				gap: 4,
				padding: "0 4px",
				fontFamily: "monospace",
				fontSize: 11,
			}}
		>
			{/* Start button */}
			<button
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					onStartClick();
				}}
				style={{
					...BEVEL_RAISED,
					background: "#2a3a2a",
					color: "#e8e040",
					fontFamily: "monospace",
					fontSize: 11,
					fontWeight: "bold",
					padding: "2px 8px",
					cursor: "pointer",
					height: 22,
					display: "flex",
					alignItems: "center",
					gap: 4,
					whiteSpace: "nowrap",
					flexShrink: 0,
				}}
			>
				🍋 Start
			</button>

			{/* Divider */}
			<div
				style={{
					width: 2,
					height: 22,
					borderLeft: "1px solid #1a2a1a",
					borderRight: "1px solid #405030",
					flexShrink: 0,
				}}
			/>

			{/* Window tabs */}
			<div
				style={{
					flex: 1,
					display: "flex",
					gap: 3,
					overflow: "hidden",
					alignItems: "center",
				}}
			>
				{windows.map((w) => {
					const isFocused = w.id === focusedId && !w.minimized;
					return (
						<button
							key={w.id}
							type="button"
							title={w.title}
							onClick={() => {
								if (w.minimized || w.id !== focusedId) {
									onWindowClick(w.id);
								} else {
									onMinimize(w.id);
								}
							}}
							style={{
								...(isFocused ? BEVEL_SUNKEN : BEVEL_RAISED),
								background: isFocused ? "#1a2a1a" : "#2a3a2a",
								color: "#e8e040",
								fontFamily: "monospace",
								fontSize: 11,
								padding: "2px 8px",
								cursor: "pointer",
								height: 22,
								maxWidth: 140,
								overflow: "hidden",
								whiteSpace: "nowrap",
								textOverflow: "ellipsis",
								display: "flex",
								alignItems: "center",
							}}
						>
							{w.title}
						</button>
					);
				})}
			</div>

			{/* Divider */}
			<div
				style={{
					width: 2,
					height: 22,
					borderLeft: "1px solid #1a2a1a",
					borderRight: "1px solid #405030",
					flexShrink: 0,
				}}
			/>

			{/* Clock */}
			<div
				style={{
					...BEVEL_SUNKEN,
					color: "#e8e040",
					fontFamily: "monospace",
					fontSize: 11,
					padding: "2px 6px",
					height: 22,
					display: "flex",
					alignItems: "center",
					flexShrink: 0,
				}}
			>
				{time}
			</div>
		</div>
	);
}
