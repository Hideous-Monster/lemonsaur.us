"use client";

import { useEffect, useState } from "react";

// ── Lemon ASCII art (compact, 8 lines) ──────────────────────────────────────

const LEMON_ART = [
	"  ⠀⢀⣴⣾⣿⣷⣦⡀",
	"  ⢠⣿⣿⣿⣿⣿⣿⣷",
	"  ⣾⣿⠀⠀⠀⠀⠻⣿⡄",
	"  ⣿⣿⠀⠀⠀⠀⢸⣿",
	"  ⢿⣿⡀⠀⠀⠀⣸⣿",
	"  ⠸⣿⣿⣤⣤⣾⣿⠇",
	"  ⠀⠈⠻⢿⡿⠟⠁",
];

const ART_COLORS = ["#e8e040", "#e0d838", "#d8d030", "#c8c828", "#b0b830", "#80a838", "#40b848"];

// ── Win3.1 group box ─────────────────────────────────────────────────────────

function GroupBox({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div
			style={{
				border: "1px solid #405030",
				borderTop: "1px solid #1a2a1a",
				borderLeft: "1px solid #1a2a1a",
				borderRight: "1px solid #405030",
				borderBottom: "1px solid #405030",
				position: "relative",
				padding: "12px 10px 8px",
				marginBottom: 10,
			}}
		>
			<span
				style={{
					position: "absolute",
					top: -8,
					left: 8,
					background: "#0a140a",
					padding: "0 4px",
					fontFamily: "monospace",
					fontSize: 10,
					color: "#688850",
					letterSpacing: "0.05em",
				}}
			>
				{title}
			</span>
			{children}
		</div>
	);
}

// ── Component ────────────────────────────────────────────────────────────────

export function NeofetchApp() {
	const [resolution, setResolution] = useState("...");

	useEffect(() => {
		setResolution(`${window.innerWidth} × ${window.innerHeight}`);
	}, []);

	const sysInfo = [
		["OS", "LEMON/95"],
		["KERNEL", "3.7.1-lemon"],
		["HOST", "OSLO, NORWAY"],
		["UPTIME", "SINCE 1987"],
		["SHELL", "LEMON SHELL v2.0"],
		["CPU", "MOS 6510 @ 1.023 MHz"],
		["GPU", "VIC-II 320×200"],
		["MEMORY", "87K (FREE: 38911 BYTES)"],
		["RESOLUTION", resolution],
		["THEME", "ALGEBRAIC"],
	] as const;

	return (
		<div
			style={{
				flex: 1,
				background: "#0a140a",
				color: "#e8e040",
				fontFamily: "monospace",
				fontSize: 11,
				overflow: "auto",
				display: "flex",
				flexDirection: "column",
			}}
		>
			{/* Fake property sheet tabs */}
			<div
				style={{
					display: "flex",
					borderBottom: "1px solid #405030",
					paddingTop: 6,
					paddingLeft: 8,
					flexShrink: 0,
				}}
			>
				<div
					style={{
						background: "#0a140a",
						border: "1px solid #405030",
						borderBottom: "none",
						padding: "3px 14px",
						color: "#e8e040",
						fontSize: 11,
						fontFamily: "monospace",
						cursor: "default",
					}}
				>
					General
				</div>
			</div>

			{/* Tab content */}
			<div style={{ padding: "14px 12px", flex: 1, overflow: "auto" }}>
				{/* System identity — lemon icon + name */}
				<div
					style={{
						display: "flex",
						gap: 14,
						alignItems: "flex-start",
						marginBottom: 14,
					}}
				>
					{/* Lemon art */}
					<div style={{ flexShrink: 0, lineHeight: 1.3 }}>
						{LEMON_ART.map((line, i) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: static art lines
								key={i}
								style={{
									color: ART_COLORS[i] ?? "#40b848",
									fontSize: 11,
									fontFamily: "monospace",
									whiteSpace: "pre",
								}}
							>
								{line}
							</div>
						))}
					</div>

					{/* Identity text */}
					<div style={{ flex: 1 }}>
						<div
							style={{
								fontSize: 16,
								fontWeight: "bold",
								color: "#e8e040",
								letterSpacing: "0.1em",
								marginBottom: 2,
							}}
						>
							LEMONSAURUS
						</div>
						<div style={{ color: "#688850", fontSize: 10, marginBottom: 8 }}>
							SOFTWARE ENGINEER · OSLO, NORWAY
						</div>
						<div
							style={{
								height: 1,
								background: "#223a22",
								marginBottom: 8,
							}}
						/>
						<div style={{ color: "#405030", fontSize: 10 }}>LEMON/95 System Properties</div>
					</div>
				</div>

				{/* System info group box */}
				<GroupBox title="SYSTEM INFORMATION">
					{sysInfo.map(([label, value]) => (
						<div
							key={label}
							style={{
								display: "flex",
								gap: 8,
								marginBottom: 4,
								fontSize: 11,
							}}
						>
							<span
								style={{
									color: "#688850",
									width: 96,
									flexShrink: 0,
									fontFamily: "monospace",
								}}
							>
								{label}
							</span>
							<span style={{ color: "#e8e040", fontFamily: "monospace" }}>{value}</span>
						</div>
					))}
				</GroupBox>

				{/* Color palette strip */}
				<GroupBox title="PALETTE">
					<div style={{ display: "flex", gap: 3 }}>
						{[
							"#0a140a",
							"#223a22",
							"#405030",
							"#688850",
							"#40b848",
							"#70e070",
							"#b8d850",
							"#e8e040",
							"#d0a030",
							"#c05040",
							"#70d0b0",
							"#a050d0",
							"#f0f0d0",
						].map((color) => (
							<div
								key={color}
								style={{
									width: 18,
									height: 18,
									background: color,
									border: "1px solid #223a22",
									flexShrink: 0,
								}}
								title={color}
							/>
						))}
					</div>
				</GroupBox>
			</div>

			{/* Bottom buttons bar */}
			<div
				style={{
					display: "flex",
					justifyContent: "flex-end",
					gap: 6,
					padding: "8px 12px",
					borderTop: "1px solid #223a22",
					flexShrink: 0,
				}}
			>
				<button
					type="button"
					style={{
						background: "#1a2a1a",
						color: "#e8e040",
						fontFamily: "monospace",
						fontSize: 11,
						padding: "3px 16px",
						borderTop: "2px solid #405030",
						borderLeft: "2px solid #405030",
						borderBottom: "2px solid #1a2a1a",
						borderRight: "2px solid #1a2a1a",
						cursor: "default",
					}}
				>
					OK
				</button>
			</div>
		</div>
	);
}
