"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppPlaceholder } from "./app-placeholder";
import { getAppComponent } from "./apps";
import { DesktopIcon } from "./desktop-icon";
import { StartMenu } from "./start-menu";
import { Taskbar } from "./taskbar";
import type { DesktopApp } from "./types";
import { useWindowManager } from "./use-window-manager";
import { Win95Window } from "./window";

const DESKTOP_APPS: DesktopApp[] = [
	{ id: "snake", title: "Snake", icon: "🐍", defaultWidth: 780, defaultHeight: 520 },
	{ id: "tetris", title: "Tetris", icon: "🧱", defaultWidth: 780, defaultHeight: 600 },
	{ id: "pong", title: "Pong", icon: "🍋", defaultWidth: 850, defaultHeight: 580 },
	{ id: "doom", title: "Doom", icon: "💀", defaultWidth: 850, defaultHeight: 580 },
	{ id: "weather", title: "Weather", icon: "🌤", defaultWidth: 520, defaultHeight: 500 },
	{ id: "about", title: "About", icon: "👤", defaultWidth: 750, defaultHeight: 700 },
	{ id: "links", title: "Links", icon: "🌐", defaultWidth: 800, defaultHeight: 650 },
	{ id: "fortune", title: "Fortune", icon: "🔮", defaultWidth: 550, defaultHeight: 420 },
	{ id: "matrix", title: "Matrix", icon: "💊", defaultWidth: 850, defaultHeight: 580 },
	{ id: "hack", title: "Hack", icon: "💻", defaultWidth: 850, defaultHeight: 580 },
	{ id: "neofetch", title: "Neofetch", icon: "🖥", defaultWidth: 550, defaultHeight: 450 },
	{ id: "blog", title: "Blog", icon: "📰", defaultWidth: 900, defaultHeight: 650 },
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

	// Vitals display — persisted from upgrade command
	const [showVitals] = useState(
		() => typeof window !== "undefined" && localStorage.getItem("show-vitals") === "1",
	);
	const [vitals, setVitals] = useState({ bpm: 89, sys: 112, dia: 72 });

	useEffect(() => {
		if (!showVitals) return;
		const interval = setInterval(() => {
			setVitals((prev) => ({
				bpm: prev.bpm + Math.floor(Math.random() * 5) - 2,
				sys: prev.sys + Math.floor(Math.random() * 3) - 1,
				dia: prev.dia + Math.floor(Math.random() * 3) - 1,
			}));
		}, 1000);
		return () => clearInterval(interval);
	}, [showVitals]);

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
				backgroundImage: "url(/images/windows_bg.avif)",
				backgroundSize: "cover",
				backgroundPosition: "center",
				overflow: "hidden",
				zIndex: 60,
			}}
		>
			{/* Vitals overlay */}
			{showVitals && (
				<>
					<style>{`
						@keyframes heartbeat {
							0%   { transform: scale(1); }
							14%  { transform: scale(1.3); }
							28%  { transform: scale(1); }
							42%  { transform: scale(1.2); }
							70%  { transform: scale(1); }
							100% { transform: scale(1); }
						}
					`}</style>
					<div
						style={{
							position: "absolute",
							top: 8,
							right: 12,
							fontFamily: "monospace",
							fontSize: 16,
							zIndex: 5,
							textShadow: "1px 1px 3px rgba(0,0,0,0.8)",
						}}
					>
						<span style={{ color: "#ff5050" }}>
							<span
								style={{
									display: "inline-block",
									animationName: "heartbeat",
									animationDuration: `${(60 / vitals.bpm).toFixed(3)}s`,
									animationTimingFunction: "ease-in-out",
									animationIterationCount: "infinite",
								}}
							>
								&#x2764;
							</span>{" "}
							{vitals.bpm} BPM
						</span>
						{"  "}
						<span style={{ color: "#70b0ff" }}>
							&#x1FA78; {vitals.sys}/{vitals.dia}
						</span>
					</div>
				</>
			)}

			{/* Desktop icon grid — top-to-bottom, then left-to-right */}
			<div
				style={{
					position: "absolute",
					top: 12,
					left: 12,
					bottom: 0,
					display: "flex",
					flexDirection: "column",
					flexWrap: "wrap",
					alignContent: "flex-start",
					gap: 6,
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
					{(() => {
						const AppComponent = getAppComponent(win.app);
						if (AppComponent) return <AppComponent />;
						return <AppPlaceholder appName={win.title} />;
					})()}
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
