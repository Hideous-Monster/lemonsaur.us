"use client";

import { type ReactNode, useCallback, useEffect, useRef } from "react";
import type { WindowState } from "./types";

// Bevel helpers — Win 3.1 raised / sunken look
const BEVEL_RAISED = {
	borderTop: "2px solid #405030",
	borderLeft: "2px solid #405030",
	borderBottom: "2px solid #1a2a1a",
	borderRight: "2px solid #1a2a1a",
};

interface Win95WindowProps {
	state: WindowState;
	onClose: (id: string) => void;
	onMinimize: (id: string) => void;
	onMaximize: (id: string) => void;
	onFocus: (id: string) => void;
	onMove: (id: string, x: number, y: number) => void;
	onResize: (id: string, width: number, height: number) => void;
	children: ReactNode;
}

export function Win95Window({
	state,
	onClose,
	onMinimize,
	onMaximize,
	onFocus,
	onMove,
	onResize,
	children,
}: Win95WindowProps) {
	// Use refs so drag handlers never capture stale state
	const dragRef = useRef<{ startX: number; startY: number; winX: number; winY: number } | null>(
		null,
	);
	const resizeRef = useRef<{
		startX: number;
		startY: number;
		startW: number;
		startH: number;
	} | null>(null);
	const stateRef = useRef(state);
	stateRef.current = state;

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (dragRef.current) {
				const dx = e.clientX - dragRef.current.startX;
				const dy = e.clientY - dragRef.current.startY;
				onMove(stateRef.current.id, dragRef.current.winX + dx, dragRef.current.winY + dy);
			}
			if (resizeRef.current) {
				const dx = e.clientX - resizeRef.current.startX;
				const dy = e.clientY - resizeRef.current.startY;
				const newW = Math.max(200, resizeRef.current.startW + dx);
				const newH = Math.max(120, resizeRef.current.startH + dy);
				onResize(stateRef.current.id, newW, newH);
			}
		},
		[onMove, onResize],
	);

	const handleMouseUp = useCallback(() => {
		dragRef.current = null;
		resizeRef.current = null;
	}, []);

	useEffect(() => {
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [handleMouseMove, handleMouseUp]);

	if (state.minimized) return null;

	const windowStyle: React.CSSProperties = state.maximized
		? {
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 32, // leave space for taskbar
				width: "auto",
				height: "auto",
				zIndex: state.zIndex,
				display: "flex",
				flexDirection: "column",
				...BEVEL_RAISED,
			}
		: {
				position: "fixed",
				top: state.y,
				left: state.x,
				width: state.width,
				height: state.height,
				zIndex: state.zIndex,
				display: "flex",
				flexDirection: "column",
				...BEVEL_RAISED,
			};

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: window container needs click-to-focus
		<div style={windowStyle} onMouseDown={() => onFocus(state.id)}>
			{/* Title bar */}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: title bar drag handler */}
			<div
				style={{
					background: "#2a3a2a",
					display: "flex",
					alignItems: "center",
					padding: "2px 4px",
					gap: 4,
					cursor: "move",
					userSelect: "none",
					flexShrink: 0,
					borderBottom: "1px solid #1a2a1a",
				}}
				onMouseDown={(e) => {
					if (state.maximized) return;
					// Only start drag on the bar itself, not the buttons
					if ((e.target as HTMLElement).dataset.btn) return;
					e.preventDefault();
					dragRef.current = {
						startX: e.clientX,
						startY: e.clientY,
						winX: stateRef.current.x,
						winY: stateRef.current.y,
					};
				}}
				onDoubleClick={(e) => {
					if ((e.target as HTMLElement).dataset.btn) return;
					onMaximize(state.id);
				}}
			>
				{/* Title */}
				<span
					style={{
						flex: 1,
						color: "#e8e040",
						fontFamily: "monospace",
						fontSize: 11,
						fontWeight: "bold",
						overflow: "hidden",
						whiteSpace: "nowrap",
						textOverflow: "ellipsis",
					}}
				>
					{state.title}
				</span>

				{/* Minimize button */}
				<TitleButton
					label="▼"
					title="Minimize"
					onClick={(e) => {
						e.stopPropagation();
						onMinimize(state.id);
					}}
				/>

				{/* Maximize button */}
				<TitleButton
					label={state.maximized ? "❐" : "▲"}
					title={state.maximized ? "Restore" : "Maximize"}
					onClick={(e) => {
						e.stopPropagation();
						onMaximize(state.id);
					}}
				/>

				{/* Close button */}
				<TitleButton
					label="✕"
					title="Close"
					onClick={(e) => {
						e.stopPropagation();
						onClose(state.id);
					}}
				/>
			</div>

			{/* Window body */}
			<div
				style={{
					flex: 1,
					background: "#0a140a",
					overflow: "auto",
					display: "flex",
					flexDirection: "column",
				}}
			>
				{children}
			</div>

			{/* Resize handle (bottom-right corner) */}
			{!state.maximized && (
				// biome-ignore lint/a11y/noStaticElementInteractions: resize grip
				<div
					style={{
						position: "absolute",
						bottom: 0,
						right: 0,
						width: 12,
						height: 12,
						cursor: "nwse-resize",
						zIndex: 1,
					}}
					onMouseDown={(e) => {
						e.stopPropagation();
						e.preventDefault();
						resizeRef.current = {
							startX: e.clientX,
							startY: e.clientY,
							startW: stateRef.current.width,
							startH: stateRef.current.height,
						};
					}}
				/>
			)}
		</div>
	);
}

interface TitleButtonProps {
	label: string;
	title: string;
	onClick: (e: React.MouseEvent) => void;
}

function TitleButton({ label, title, onClick }: TitleButtonProps) {
	return (
		<button
			type="button"
			title={title}
			data-btn="1"
			onClick={onClick}
			style={{
				...BEVEL_RAISED,
				background: "#1a2a1a",
				color: "#e8e040",
				fontFamily: "monospace",
				fontSize: 10,
				width: 16,
				height: 14,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				cursor: "pointer",
				flexShrink: 0,
				padding: 0,
				lineHeight: 1,
			}}
		>
			{label}
		</button>
	);
}
