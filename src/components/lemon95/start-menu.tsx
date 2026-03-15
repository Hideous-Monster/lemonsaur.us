"use client";

import { useEffect, useRef } from "react";
import type { DesktopApp } from "./types";

const BEVEL_RAISED = {
	borderTop: "2px solid #405030",
	borderLeft: "2px solid #405030",
	borderBottom: "2px solid #1a2a1a",
	borderRight: "2px solid #1a2a1a",
};

interface StartMenuProps {
	apps: DesktopApp[];
	onOpenApp: (app: DesktopApp) => void;
	onShutDown: () => void;
	onClose: () => void;
}

export function StartMenu({ apps, onOpenApp, onShutDown, onClose }: StartMenuProps) {
	const menuRef = useRef<HTMLDivElement>(null);

	// Close when clicking outside (delayed to avoid capturing the opening click)
	useEffect(() => {
		let handler: ((e: MouseEvent) => void) | null = null;
		const timer = setTimeout(() => {
			handler = (e: MouseEvent) => {
				if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
					onClose();
				}
			};
			document.addEventListener("mousedown", handler, true);
		}, 100);
		return () => {
			clearTimeout(timer);
			if (handler) document.removeEventListener("mousedown", handler, true);
		};
	}, [onClose]);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: stop click from closing menu via desktop handler
		// biome-ignore lint/a11y/useKeyWithClickEvents: menu items handle keyboard interaction individually
		<div
			ref={menuRef}
			onClick={(e) => e.stopPropagation()}
			style={{
				...BEVEL_RAISED,
				position: "fixed",
				bottom: 34,
				left: 4,
				background: "#0a140a",
				zIndex: 9100,
				display: "flex",
				fontFamily: "monospace",
				fontSize: 15,
				minWidth: 300,
				userSelect: "none",
			}}
		>
			{/* Sidebar */}
			<div
				style={{
					width: 24,
					background: "#2a3a2a",
					display: "flex",
					alignItems: "flex-end",
					justifyContent: "center",
					padding: "8px 0",
					flexShrink: 0,
					borderRight: "1px solid #1a2a1a",
				}}
			>
				<span
					style={{
						color: "#e8e040",
						fontWeight: "bold",
						fontSize: 11,
						writingMode: "vertical-rl",
						transform: "rotate(180deg)",
						letterSpacing: 2,
						whiteSpace: "nowrap",
					}}
				>
					Lemon 95
				</span>
			</div>

			{/* Menu items */}
			<div style={{ flex: 1, padding: "4px 0" }}>
				{apps.map((app) => (
					<StartMenuItem
						key={app.id}
						icon={app.icon}
						label={app.title}
						onClick={() => {
							onOpenApp(app);
							onClose();
						}}
					/>
				))}

				{/* Divider */}
				<div
					style={{
						margin: "4px 8px",
						borderTop: "1px solid #405030",
						borderBottom: "1px solid #1a2a1a",
					}}
				/>

				{/* Shut Down */}
				<StartMenuItem
					icon="⏻"
					label="Exit to LEMON/87"
					onClick={() => {
						onShutDown();
						onClose();
					}}
				/>
			</div>
		</div>
	);
}

interface StartMenuItemProps {
	icon: string;
	label: string;
	onClick: () => void;
}

function StartMenuItem({ icon, label, onClick }: StartMenuItemProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			style={{
				width: "100%",
				display: "flex",
				alignItems: "center",
				gap: 10,
				padding: "8px 16px",
				background: "transparent",
				color: "#b8d850",
				fontFamily: "monospace",
				fontSize: 15,
				cursor: "pointer",
				textAlign: "left",
				border: "none",
				outline: "none",
			}}
			onMouseEnter={(e) => {
				(e.currentTarget as HTMLButtonElement).style.background = "#2a3a2a";
				(e.currentTarget as HTMLButtonElement).style.color = "#e8e040";
			}}
			onMouseLeave={(e) => {
				(e.currentTarget as HTMLButtonElement).style.background = "transparent";
				(e.currentTarget as HTMLButtonElement).style.color = "#b8d850";
			}}
		>
			<span style={{ fontSize: 18, width: 24, textAlign: "center", flexShrink: 0 }}>{icon}</span>
			<span>{label}</span>
		</button>
	);
}
