"use client";

import { useCallback, useMemo, useState } from "react";
import { AppPlaceholder } from "./app-placeholder";
import { DesktopIcon } from "./desktop-icon";
import { StartMenu } from "./start-menu";
import { Taskbar } from "./taskbar";
import type { DesktopApp } from "./types";
import { useWindowManager } from "./use-window-manager";
import { Win95Window } from "./window";

const DESKTOP_APPS: DesktopApp[] = [
	{ id: "snake", title: "Snake", icon: "🐍", defaultWidth: 640, defaultHeight: 480 },
	{ id: "tetris", title: "Tetris", icon: "🧱", defaultWidth: 300, defaultHeight: 520 },
	{ id: "pong", title: "Pong", icon: "🍋", defaultWidth: 700, defaultHeight: 500 },
	{ id: "doom", title: "Doom", icon: "💀", defaultWidth: 700, defaultHeight: 500 },
	{ id: "weather", title: "Weather", icon: "🌤", defaultWidth: 400, defaultHeight: 350 },
	{ id: "about", title: "About", icon: "👤", defaultWidth: 500, defaultHeight: 400 },
	{ id: "links", title: "Links", icon: "🌐", defaultWidth: 600, defaultHeight: 500 },
	{ id: "fortune", title: "Fortune", icon: "🔮", defaultWidth: 400, defaultHeight: 350 },
	{ id: "matrix", title: "Matrix", icon: "💊", defaultWidth: 700, defaultHeight: 500 },
	{ id: "hack", title: "Hack", icon: "💻", defaultWidth: 700, defaultHeight: 500 },
	{ id: "neofetch", title: "Neofetch", icon: "🖥", defaultWidth: 450, defaultHeight: 350 },
];

interface DesktopProps {
	onShutDown: () => void;
}

export function Desktop({ onShutDown }: DesktopProps) {
	const {
		windows,
		openWindow,
		closeWindow,
		minimizeWindow,
		maximizeWindow,
		focusWindow,
		moveWindow,
		resizeWindow,
	} = useWindowManager();

	const [startMenuOpen, setStartMenuOpen] = useState(false);

	// The topmost non-minimized window is the "focused" one for taskbar highlight
	const focusedId = useMemo(() => {
		const visible = windows.filter((w) => !w.minimized);
		if (visible.length === 0) return null;
		return visible.reduce((a, b) => (a.zIndex > b.zIndex ? a : b)).id;
	}, [windows]);

	const handleDesktopClick = useCallback(() => {
		setStartMenuOpen(false);
	}, []);

	const handleStartClick = useCallback(() => {
		setStartMenuOpen((v) => !v);
	}, []);

	const handleOpenApp = useCallback(
		(app: DesktopApp) => {
			openWindow(app);
		},
		[openWindow],
	);

	const handleTaskbarWindowClick = useCallback(
		(id: string) => {
			focusWindow(id);
		},
		[focusWindow],
	);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: desktop background handles deselect
		// biome-ignore lint/a11y/useKeyWithClickEvents: desktop canvas uses mouse interaction
		<div
			onClick={handleDesktopClick}
			style={{
				position: "fixed",
				inset: 0,
				bottom: 32,
				background: "#1a2e1a",
				overflow: "hidden",
			}}
		>
			{/* Desktop icon grid — top-to-bottom, then left-to-right */}
			<div
				style={{
					position: "absolute",
					top: 8,
					left: 8,
					bottom: 0,
					display: "flex",
					flexDirection: "column",
					flexWrap: "wrap",
					alignContent: "flex-start",
					gap: 8,
					padding: 4,
				}}
			>
				{DESKTOP_APPS.map((app) => (
					<DesktopIcon key={app.id} app={app} onDoubleClick={handleOpenApp} />
				))}
			</div>

			{/* Open windows */}
			{windows.map((win) => (
				<Win95Window
					key={win.id}
					state={win}
					onClose={closeWindow}
					onMinimize={minimizeWindow}
					onMaximize={maximizeWindow}
					onFocus={focusWindow}
					onMove={moveWindow}
					onResize={resizeWindow}
				>
					<AppPlaceholder appName={win.title} />
				</Win95Window>
			))}

			{/* Start menu (renders above taskbar) */}
			{startMenuOpen && (
				<StartMenu
					apps={DESKTOP_APPS}
					onOpenApp={handleOpenApp}
					onShutDown={onShutDown}
					onClose={() => setStartMenuOpen(false)}
				/>
			)}

			{/* Taskbar */}
			<Taskbar
				windows={windows}
				focusedId={focusedId}
				onStartClick={handleStartClick}
				onWindowClick={handleTaskbarWindowClick}
				onMinimize={minimizeWindow}
			/>
		</div>
	);
}
