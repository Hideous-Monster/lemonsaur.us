"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateFortune } from "@/components/terminal/commands/fortune";

const BALL_SIZE = 120;

function drawCrystalBall(canvas: HTMLCanvasElement, glowPhase: number) {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	const w = canvas.width;
	const h = canvas.height;
	const cx = w / 2;
	const cy = h / 2 - 8;
	const r = BALL_SIZE / 2 - 6;

	ctx.clearRect(0, 0, w, h);

	// Outer glow — pulses with glowPhase
	const glowAlpha = 0.3 + 0.2 * Math.sin(glowPhase);
	const glowR = r + 14 + 4 * Math.sin(glowPhase);
	const glow = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, glowR);
	glow.addColorStop(0, `rgba(160, 80, 220, ${glowAlpha})`);
	glow.addColorStop(1, "rgba(80, 40, 180, 0)");
	ctx.beginPath();
	ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
	ctx.fillStyle = glow;
	ctx.fill();

	// Main orb
	const orb = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r);
	orb.addColorStop(0, "#d0b0ff");
	orb.addColorStop(0.25, "#9060d0");
	orb.addColorStop(0.6, "#5030a0");
	orb.addColorStop(1, "#200840");
	ctx.beginPath();
	ctx.arc(cx, cy, r, 0, Math.PI * 2);
	ctx.fillStyle = orb;
	ctx.fill();

	// Inner nebula swirl
	const nebula = ctx.createRadialGradient(cx + r * 0.1, cy + r * 0.1, 2, cx, cy, r * 0.7);
	nebula.addColorStop(0, "rgba(100, 200, 255, 0.25)");
	nebula.addColorStop(0.5, "rgba(180, 80, 255, 0.15)");
	nebula.addColorStop(1, "rgba(0, 0, 0, 0)");
	ctx.beginPath();
	ctx.arc(cx, cy, r, 0, Math.PI * 2);
	ctx.fillStyle = nebula;
	ctx.fill();

	// Highlight specular
	const spec = ctx.createRadialGradient(
		cx - r * 0.3,
		cy - r * 0.35,
		0,
		cx - r * 0.25,
		cy - r * 0.3,
		r * 0.35,
	);
	spec.addColorStop(0, "rgba(255,255,255,0.55)");
	spec.addColorStop(1, "rgba(255,255,255,0)");
	ctx.beginPath();
	ctx.arc(cx, cy, r, 0, Math.PI * 2);
	ctx.fillStyle = spec;
	ctx.fill();

	// Orb rim (dark edge)
	ctx.beginPath();
	ctx.arc(cx, cy, r, 0, Math.PI * 2);
	ctx.strokeStyle = "rgba(80, 20, 120, 0.8)";
	ctx.lineWidth = 2;
	ctx.stroke();

	// Base/stand
	const standY = cy + r + 2;
	const standW = r * 0.9;
	const standH = 14;

	ctx.beginPath();
	ctx.ellipse(cx, standY + standH * 0.4, standW * 0.7, standH * 0.35, 0, 0, Math.PI * 2);
	ctx.fillStyle = "#cc4488";
	ctx.fill();
	ctx.strokeStyle = "#ff66aa";
	ctx.lineWidth = 1;
	ctx.stroke();

	// Connector between ball and stand
	ctx.beginPath();
	ctx.moveTo(cx - standW * 0.25, standY);
	ctx.lineTo(cx - standW * 0.45, standY + standH * 0.4);
	ctx.lineTo(cx + standW * 0.45, standY + standH * 0.4);
	ctx.lineTo(cx + standW * 0.25, standY);
	ctx.fillStyle = "#dd5599";
	ctx.fill();
	ctx.strokeStyle = "#ff66aa";
	ctx.lineWidth = 1;
	ctx.stroke();
}

export function FortuneApp() {
	const [fortune, setFortune] = useState<string | null>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const glowPhaseRef = useRef(0);
	const rafRef = useRef<number | null>(null);

	const animate = useCallback(() => {
		glowPhaseRef.current += 0.04;
		if (canvasRef.current) {
			drawCrystalBall(canvasRef.current, glowPhaseRef.current);
		}
		rafRef.current = requestAnimationFrame(animate);
	}, []);

	useEffect(() => {
		rafRef.current = requestAnimationFrame(animate);
		return () => {
			if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
		};
	}, [animate]);

	const handleClick = useCallback(() => {
		setFortune(generateFortune());
	}, []);

	return (
		<div
			style={{
				flex: 1,
				display: "flex",
				flexDirection: "row",
				background: "#0a140a",
				overflow: "hidden",
			}}
		>
			{/* Left: fortune text */}
			<div
				style={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					padding: "24px 20px",
					gap: 16,
				}}
			>
				<div
					style={{
						fontFamily: "monospace",
						fontSize: 11,
						color: "#688850",
						letterSpacing: "0.1em",
						textTransform: "uppercase",
					}}
				>
					THE ORACLE SPEAKS
				</div>
				{fortune ? (
					<div
						style={{
							fontFamily: "monospace",
							fontSize: 15,
							color: "#e8e040",
							lineHeight: 1.7,
							fontWeight: "bold",
						}}
					>
						{fortune}
					</div>
				) : (
					<div
						style={{
							fontFamily: "monospace",
							fontSize: 13,
							color: "#405030",
							lineHeight: 1.7,
							fontStyle: "italic",
						}}
					>
						CLICK THE CRYSTAL BALL...
					</div>
				)}
			</div>

			{/* Right: crystal ball canvas */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: crystal ball is a decorative interactive canvas */}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: crystal ball is a decorative interactive canvas */}
			<div
				onClick={handleClick}
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					padding: "16px 20px",
					cursor: "pointer",
					flexShrink: 0,
				}}
				title="Click to reveal your fortune"
			>
				<canvas
					ref={canvasRef}
					width={BALL_SIZE + 20}
					height={BALL_SIZE + 40}
					style={{ display: "block" }}
				/>
				<div
					style={{
						fontFamily: "monospace",
						fontSize: 9,
						color: "#405030",
						marginTop: 4,
						letterSpacing: "0.05em",
					}}
				>
					CLICK TO CONSULT
				</div>
			</div>
		</div>
	);
}
