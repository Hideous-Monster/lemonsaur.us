"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const VISITOR_NUMBER = 1_337_042 + Math.floor(Math.random() * 9999);

// ── Star canvas background ───────────────────────────────────────────────────

function StarField() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		function paint() {
			if (!canvas || !ctx) return;
			canvas.width = canvas.offsetWidth;
			canvas.height = canvas.offsetHeight;
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Scattered stars and sparkles
			for (let i = 0; i < 60; i++) {
				const x = Math.random() * canvas.width;
				const y = Math.random() * canvas.height;
				const r = Math.random() < 0.3 ? 2 : 1;
				ctx.fillStyle = `rgba(255, 230, 0, ${0.3 + Math.random() * 0.5})`;
				ctx.beginPath();
				ctx.arc(x, y, r, 0, Math.PI * 2);
				ctx.fill();
			}
		}

		paint();
	}, []);

	return (
		<canvas
			ref={canvasRef}
			style={{
				position: "absolute",
				inset: 0,
				width: "100%",
				height: "100%",
				pointerEvents: "none",
			}}
		/>
	);
}

// ── Marquee scroll via CSS animation ────────────────────────────────────────

const MARQUEE_STYLE: React.CSSProperties = {
	overflow: "hidden",
	whiteSpace: "nowrap",
	background: "#000080",
	padding: "3px 0",
	borderTop: "2px solid #ff00ff",
	borderBottom: "2px solid #ff00ff",
};

const MARQUEE_INNER_STYLE: React.CSSProperties = {
	display: "inline-block",
	animation: "marqueeScroll 20s linear infinite",
	color: "#ffff00",
	fontFamily: "Comic Sans MS, cursive, monospace",
	fontSize: 13,
	fontWeight: "bold",
};

const FAKE_GUESTBOOK = [
	{ name: "xX_CodeMonkey_Xx", msg: "OMFG COOOOOL PAGE!!!!! ★★★★★" },
	{ name: "pizzaprincess1987", msg: "lol ur so nerdy i luv it!! signed ur bestie 4ever" },
	{ name: "hackmaster5000", msg: "dude ur python skills = LEGENDARY. teach me senpai" },
	{ name: "lemonfan_forever", msg: "first!!!! jk ur page is so fetch. keep coding!!" },
];

export function AboutApp() {
	return (
		<div
			style={{
				flex: 1,
				background: "#1a0033",
				overflow: "auto",
				position: "relative",
				fontFamily: "Comic Sans MS, cursive, monospace",
			}}
		>
			{/* Star field background */}
			<StarField />

			{/* CSS for marquee animation and blink */}
			<style>{`
				@keyframes marqueeScroll {
					from { transform: translateX(100vw); }
					to   { transform: translateX(-100%); }
				}
				@keyframes blink95 {
					0%, 49% { opacity: 1; }
					50%, 100% { opacity: 0; }
				}
			`}</style>

			{/* Marquee banner */}
			<div style={MARQUEE_STYLE}>
				<span style={MARQUEE_INNER_STYLE}>
					★ WELCOME TO LEMONSAURUS' HOMEPAGE ★ &nbsp;&nbsp; BEST VIEWED IN NETSCAPE NAVIGATOR 4.0
					&nbsp;&nbsp; 1024x768 OR HIGHER &nbsp;&nbsp; ★ SIGN MY GUESTBOOK ★ &nbsp;&nbsp; OSLO,
					NORWAY &nbsp;&nbsp; 🍋 🍋 🍋
				</span>
			</div>

			{/* Main content — positioned above canvas */}
			<div style={{ position: "relative", zIndex: 1, padding: "12px 16px" }}>
				{/* Header */}
				<div style={{ textAlign: "center", marginBottom: 16 }}>
					<div
						style={{
							fontSize: 26,
							fontWeight: "bold",
							color: "#e8e040",
							textShadow: "2px 2px #ff00ff, -1px -1px #00ffff",
							fontFamily: "Impact, Comic Sans MS, cursive",
							letterSpacing: "0.05em",
						}}
					>
						LEMONSAURUS REX
					</div>
					<div
						style={{
							fontSize: 12,
							color: "#ff99ff",
							fontFamily: "Comic Sans MS, cursive",
							marginTop: 2,
						}}
					>
						Software Engineer · Oslo, Norway · Since 1987
					</div>
					<div
						style={{
							fontSize: 11,
							color: "#00ffff",
							fontFamily: "monospace",
							marginTop: 4,
							animation: "blink95 1s step-end infinite",
						}}
					>
						🚧 UNDER CONSTRUCTION 🚧
					</div>
				</div>

				{/* Profile layout */}
				<div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
					{/* Portrait */}
					<div
						style={{
							flexShrink: 0,
							border: "4px solid #ff00ff",
							background: "#000",
							padding: 2,
						}}
					>
						<Image
							src="/images/lemon_portrait.avif"
							alt="Lemonsaurus portrait"
							width={100}
							height={100}
							style={{ display: "block", imageRendering: "pixelated" }}
						/>
						<div
							style={{
								textAlign: "center",
								fontSize: 9,
								color: "#ffff00",
								fontFamily: "monospace",
								marginTop: 3,
							}}
						>
							it's-a me
						</div>
					</div>

					{/* Info box */}
					<div
						style={{
							flex: 1,
							background: "#000080",
							border: "3px outset #c0c0c0",
							padding: "8px 10px",
							fontSize: 12,
						}}
					>
						<div
							style={{
								color: "#00ffff",
								fontWeight: "bold",
								marginBottom: 6,
								fontSize: 13,
								textDecoration: "underline",
							}}
						>
							About Me!!
						</div>
						<InfoRow label="Name:" value="LEMONSAURUS" />
						<InfoRow label="Job:" value="SOFTWARE ENGINEER" />
						<InfoRow label="Location:" value="VESTBY, NORWAY" />
						<InfoRow label="Hobbies:" value="PIANO / GAMING / GAMEDEV / COMMUNITY" />
						<InfoRow label="Fave lang:" value="PYTHON (obv)" />
						<InfoRow label="Status:" value="ONLINE AND CAFFEINATED" />
					</div>
				</div>

				{/* Divider */}
				<div
					style={{
						height: 4,
						background: "linear-gradient(to right, #ff00ff, #00ffff, #ff00ff)",
						margin: "14px 0",
					}}
				/>

				{/* Visitor counter */}
				<div
					style={{
						textAlign: "center",
						background: "#000",
						border: "2px inset #808080",
						padding: "6px 0",
						marginBottom: 14,
					}}
				>
					<div style={{ fontSize: 11, color: "#ffff00", fontFamily: "monospace" }}>
						YOU ARE VISITOR #
						<span
							style={{
								color: "#00ff00",
								fontWeight: "bold",
								fontSize: 14,
								letterSpacing: "0.1em",
							}}
						>
							{VISITOR_NUMBER.toLocaleString()}
						</span>
					</div>
				</div>

				{/* Guestbook */}
				<div
					style={{
						background: "#000040",
						border: "3px outset #808080",
						padding: "8px 10px",
					}}
				>
					<div
						style={{
							color: "#ff99ff",
							fontWeight: "bold",
							fontSize: 13,
							marginBottom: 8,
							textDecoration: "underline",
						}}
					>
						✨ Guestbook Entries ✨
					</div>
					{FAKE_GUESTBOOK.map((entry) => (
						<div
							key={entry.name}
							style={{
								marginBottom: 8,
								paddingBottom: 8,
								borderBottom: "1px dashed #404080",
								fontSize: 11,
							}}
						>
							<span style={{ color: "#00ffff", fontWeight: "bold" }}>{entry.name}</span>
							<span style={{ color: "#c0c0c0", marginLeft: 6 }}>{entry.msg}</span>
						</div>
					))}
				</div>

				{/* Footer badge */}
				<div
					style={{
						textAlign: "center",
						marginTop: 12,
						fontSize: 9,
						color: "#606060",
						fontFamily: "monospace",
					}}
				>
					[ BEST VIEWED IN NETSCAPE NAVIGATOR 4.0 ] [ 1024×768 ] [ LEMON/95 COMPATIBLE ]
				</div>
			</div>
		</div>
	);
}

function InfoRow({ label, value }: { label: string; value: string }) {
	return (
		<div style={{ display: "flex", gap: 6, marginBottom: 4, fontSize: 11 }}>
			<span style={{ color: "#ffff00", width: 76, flexShrink: 0 }}>{label}</span>
			<span style={{ color: "#ffffff" }}>{value}</span>
		</div>
	);
}
