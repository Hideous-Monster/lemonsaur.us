"use client";

import { useCallback, useRef, useState } from "react";
import type { DesktopApp, WindowState } from "./types";

export function useWindowManager() {
	const [windows, setWindows] = useState<WindowState[]>([]);
	const zCounter = useRef(10);

	const openWindow = useCallback((app: DesktopApp) => {
		setWindows((prev) => {
			// If already open, focus it
			const existing = prev.find((w) => w.app === app.id);
			if (existing) {
				const z = zCounter.current + 1;
				zCounter.current = z;
				return prev.map((w) => (w.id === existing.id ? { ...w, minimized: false, zIndex: z } : w));
			}

			const z = zCounter.current + 1;
			zCounter.current = z;

			// Cascade position slightly for each new window
			const offset = (prev.length % 8) * 24;
			const newWindow: WindowState = {
				id: `${app.id}-${Date.now()}`,
				title: app.title,
				app: app.id,
				x: 80 + offset,
				y: 40 + offset,
				width: app.defaultWidth,
				height: app.defaultHeight,
				minimized: false,
				maximized: false,
				zIndex: z,
			};
			return [...prev, newWindow];
		});
	}, []);

	const closeWindow = useCallback((id: string) => {
		setWindows((prev) => prev.filter((w) => w.id !== id));
	}, []);

	const minimizeWindow = useCallback((id: string) => {
		setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)));
	}, []);

	const maximizeWindow = useCallback((id: string) => {
		setWindows((prev) =>
			prev.map((w) => (w.id === id ? { ...w, maximized: !w.maximized, minimized: false } : w)),
		);
	}, []);

	const focusWindow = useCallback((id: string) => {
		setWindows((prev) => {
			const z = zCounter.current + 1;
			zCounter.current = z;
			return prev.map((w) => (w.id === id ? { ...w, zIndex: z, minimized: false } : w));
		});
	}, []);

	const moveWindow = useCallback((id: string, x: number, y: number) => {
		setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x, y } : w)));
	}, []);

	const resizeWindow = useCallback((id: string, width: number, height: number) => {
		setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, width, height } : w)));
	}, []);

	return {
		windows,
		openWindow,
		closeWindow,
		minimizeWindow,
		maximizeWindow,
		focusWindow,
		moveWindow,
		resizeWindow,
	};
}
