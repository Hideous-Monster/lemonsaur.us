"use client";

import { useEffect, useRef } from "react";

// ─── Konami sequence ────────────────────────────────────────────────────────
const KONAMI: string[] = [
	"ArrowUp",
	"ArrowUp",
	"ArrowDown",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	"ArrowLeft",
	"ArrowRight",
	"b",
	"a",
];

// ─── Palette ─────────────────────────────────────────────────────────────────
const LEMON_YELLOW = "#e8e040";
const LEMON_DARK = "#b8a020";
const LEAF_GREEN = "#40a828";
const CLOUD_DARK = "#1a2a1a";
const CLOUD_MID = "#2a3a2a";

// ─── Types ───────────────────────────────────────────────────────────────────
type AnimPhase = "cloud" | "rain" | "fill" | "explode" | "done";

interface Lemon {
	x: number;
	y: number;
	vx: number;
	vy: number;
	rotation: number;
	rotSpeed: number;
	wobblePhase: number;
	wobbleAmp: number;
	radius: number;
	landed: boolean;
	// sparkle trail entries (pooled inline)
	trailX: Float32Array;
	trailY: Float32Array;
	trailAge: Float32Array; // 0=fresh, 1=dead
	trailHead: number; // ring-buffer head
}

interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	radius: number;
	color: string;
	alpha: number;
	alphaDelta: number;
	active: boolean;
}

const TRAIL_LEN = 8;
const LEMON_POOL_SIZE = 120;
const PARTICLE_POOL_SIZE = 800;
const PILE_COLS = 80; // horizontal resolution of the pile

// ─── Object factory helpers ──────────────────────────────────────────────────
function makeLemon(): Lemon {
	return {
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		rotation: 0,
		rotSpeed: 0,
		wobblePhase: 0,
		wobbleAmp: 0,
		radius: 12,
		landed: false,
		trailX: new Float32Array(TRAIL_LEN),
		trailY: new Float32Array(TRAIL_LEN),
		trailAge: new Float32Array(TRAIL_LEN).fill(1),
		trailHead: 0,
	};
}

function makeParticle(): Particle {
	return {
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		radius: 3,
		color: LEMON_YELLOW,
		alpha: 1,
		alphaDelta: 0,
		active: false,
	};
}

// ─── Component ───────────────────────────────────────────────────────────────
export function KonamiEasterEgg() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const animRef = useRef<number>(0);
	const activeRef = useRef(false);
	// Keep triggerAnimation stable in a ref so the keydown handler never goes stale
	const triggerRef = useRef<() => void>(() => {});

	useEffect(() => {
		triggerRef.current = function triggerAnimation() {
			if (activeRef.current) return;
			activeRef.current = true;

			// Build canvas
			const canvas = document.createElement("canvas");
			canvas.style.cssText =
				"position:fixed;inset:0;z-index:9999;pointer-events:none;width:100%;height:100%;";
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			document.body.appendChild(canvas);
			canvasRef.current = canvas;

			const ctx = canvas.getContext("2d")!;

			// ─── State ─────────────────────────────────────────────────────
			const W = canvas.width;
			const H = canvas.height;

			// Phase timing
			const startTime = performance.now();
			let phase: AnimPhase = "cloud";

			// Cloud position — enters from top-right
			const cloudW = 340;
			const cloudH = 160;
			const cloudTargetX = W * 0.65;
			const cloudTargetY = 60;
			let cloudX = W + cloudW * 0.5;
			const cloudY = cloudTargetY;
			let lightningTimer = 0;
			let lightningFlash = 0; // 0=off, >0 = intensity

			// Lemon object pool
			const lemonPool: Lemon[] = Array.from({ length: LEMON_POOL_SIZE }, makeLemon);
			let activeLemonCount = 0;

			// Pile: per-column fill heights (in pixels from bottom)
			const pileHeights = new Float32Array(PILE_COLS).fill(0);
			const colW = W / PILE_COLS;

			// Particle pool
			const particles: Particle[] = Array.from({ length: PARTICLE_POOL_SIZE }, makeParticle);

			// ─── Helpers ───────────────────────────────────────────────────
			function spawnLemon() {
				for (let i = 0; i < LEMON_POOL_SIZE; i++) {
					const l = lemonPool[i]!;
					if (!l.landed || phase === "rain") {
						if (i >= activeLemonCount) activeLemonCount = i + 1;
						const spawnX = cloudX - cloudW * 0.3 + Math.random() * cloudW * 0.6;
						const spawnY = cloudY + cloudH * 0.55;
						l.x = spawnX;
						l.y = spawnY;
						l.vx = (Math.random() - 0.5) * 1.2;
						l.vy = 1 + Math.random() * 1.5;
						l.rotation = Math.random() * Math.PI * 2;
						l.rotSpeed = (Math.random() - 0.5) * 0.08;
						l.wobblePhase = Math.random() * Math.PI * 2;
						l.wobbleAmp = 8 + Math.random() * 14;
						l.radius = 10 + Math.random() * 8;
						l.landed = false;
						l.trailAge.fill(1);
						l.trailHead = 0;
						return;
					}
				}
			}

			function spawnParticle(
				x: number,
				y: number,
				vx: number,
				vy: number,
				radius: number,
				color: string,
				alphaDelta: number,
			) {
				for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
					const p = particles[i]!;
					if (!p.active) {
						p.x = x;
						p.y = y;
						p.vx = vx;
						p.vy = vy;
						p.radius = radius;
						p.color = color;
						p.alpha = 1;
						p.alphaDelta = alphaDelta;
						p.active = true;
						return;
					}
				}
			}

			// ─── Draw helpers ──────────────────────────────────────────────
			function drawCloud(cx: number, cy: number, flash: number) {
				ctx.save();
				ctx.shadowColor = "rgba(0,0,0,0.5)";
				ctx.shadowBlur = 20;

				const puffs: [number, number, number][] = [
					[0, 20, 80],
					[-90, 30, 65],
					[90, 30, 65],
					[-50, 0, 70],
					[50, 0, 70],
					[-30, -20, 55],
					[30, -20, 55],
					[0, -30, 50],
					[-130, 50, 45],
					[130, 50, 45],
					[-70, 50, 55],
					[70, 50, 55],
					[0, 55, 60],
				];

				for (const [dx, dy, r] of puffs) {
					const grad = ctx.createRadialGradient(cx + dx, cy + dy, r * 0.2, cx + dx, cy + dy, r);
					grad.addColorStop(0, flash > 0 ? `rgba(200,255,200,${flash * 0.6})` : CLOUD_MID);
					grad.addColorStop(0.5, flash > 0 ? `rgba(120,180,120,${flash * 0.4})` : CLOUD_MID);
					grad.addColorStop(1, CLOUD_DARK);
					ctx.fillStyle = grad;
					ctx.beginPath();
					ctx.arc(cx + dx, cy + dy, r, 0, Math.PI * 2);
					ctx.fill();
				}

				if (flash > 0) {
					ctx.strokeStyle = `rgba(180,255,180,${flash * 0.8})`;
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.arc(cx, cy - 30, 50, Math.PI, Math.PI * 2);
					ctx.stroke();
				}

				ctx.restore();
			}

			function drawLemon(l: Lemon) {
				ctx.save();
				ctx.translate(l.x, l.y);
				ctx.rotate(l.rotation);

				const grad = ctx.createRadialGradient(
					-l.radius * 0.3,
					-l.radius * 0.3,
					1,
					0,
					0,
					l.radius * 1.3,
				);
				grad.addColorStop(0, "#f8f040");
				grad.addColorStop(0.5, LEMON_YELLOW);
				grad.addColorStop(1, LEMON_DARK);
				ctx.fillStyle = grad;
				ctx.beginPath();
				ctx.ellipse(0, 0, l.radius, l.radius * 0.72, 0, 0, Math.PI * 2);
				ctx.fill();

				ctx.fillStyle = LEAF_GREEN;
				ctx.beginPath();
				ctx.ellipse(0, -l.radius * 0.8, l.radius * 0.4, l.radius * 0.22, -0.5, 0, Math.PI * 2);
				ctx.fill();

				ctx.restore();
			}

			function drawTrail(l: Lemon) {
				for (let i = 0; i < TRAIL_LEN; i++) {
					const age = l.trailAge[i]!;
					if (age >= 1) continue;
					const alpha = (1 - age) * 0.6;
					const r = 3 * (1 - age);
					ctx.beginPath();
					ctx.arc(l.trailX[i]!, l.trailY[i]!, r, 0, Math.PI * 2);
					const t = i % 3 === 0 ? "#ffffff" : LEMON_YELLOW;
					ctx.fillStyle = `${t}${Math.round(alpha * 255)
						.toString(16)
						.padStart(2, "0")}`;
					ctx.fill();
				}
			}

			function drawPile() {
				for (let col = 0; col < PILE_COLS; col++) {
					const fillH = pileHeights[col]!;
					if (fillH <= 0) continue;
					const x0 = col * colW;
					const lemonR = colW * 0.55;
					let ly = H - lemonR;
					while (ly > H - fillH - lemonR) {
						const jitter = (Math.random() - 0.5) * colW * 0.3;
						const grad = ctx.createRadialGradient(
							x0 + colW * 0.5 + jitter - lemonR * 0.3,
							ly - lemonR * 0.3,
							1,
							x0 + colW * 0.5 + jitter,
							ly,
							lemonR,
						);
						grad.addColorStop(0, "#f8f040");
						grad.addColorStop(0.5, LEMON_YELLOW);
						grad.addColorStop(1, LEMON_DARK);
						ctx.fillStyle = grad;
						ctx.beginPath();
						ctx.ellipse(x0 + colW * 0.5 + jitter, ly, lemonR, lemonR * 0.72, 0, 0, Math.PI * 2);
						ctx.fill();
						ly -= lemonR * 1.35;
					}
				}
			}

			// ─── Main animation loop ───────────────────────────────────────
			let lastSpawn = 0;
			let spawnInterval = 400;
			let explodeTriggered = false;

			function frame(now: number) {
				const elapsed = now - startTime;
				ctx.clearRect(0, 0, W, H);

				// Phase transitions
				if (phase === "cloud" && elapsed > 2000) phase = "rain";
				if (phase === "rain" && elapsed > 8000) phase = "fill";
				if (phase === "fill" && elapsed > 9500) phase = "explode";
				if (phase === "explode" && elapsed > 11200) phase = "done";

				if (phase === "done") {
					cleanup();
					return;
				}

				// Cloud movement (ease-out into position from top-right)
				const cloudProgress = Math.min(1, elapsed / 1200);
				const eased = 1 - (1 - cloudProgress) * (1 - cloudProgress);
				cloudX = W + cloudW * 0.5 + (cloudTargetX - W - cloudW * 0.5) * eased;

				// Lightning flicker
				lightningTimer -= 16;
				if (lightningTimer <= 0 && (phase === "cloud" || phase === "rain")) {
					lightningTimer = 800 + Math.random() * 2000;
					lightningFlash = 0.8 + Math.random() * 0.2;
				}
				lightningFlash = Math.max(0, lightningFlash - 0.05);

				// Spawn lemons — rate ramps up over 6 seconds
				if (phase === "rain" || phase === "fill") {
					const t = Math.min(1, (elapsed - 2000) / 6000);
					spawnInterval = 350 - t * 300;
					if (now - lastSpawn > spawnInterval) {
						lastSpawn = now;
						spawnLemon();
					}
				}

				// Update falling lemons
				if (phase !== "explode") {
					for (let i = 0; i < activeLemonCount; i++) {
						const l = lemonPool[i]!;
						if (l.landed) continue;

						// Update sparkle trail ring-buffer
						const ti = l.trailHead % TRAIL_LEN;
						l.trailX[ti] = l.x;
						l.trailY[ti] = l.y;
						l.trailAge[ti] = 0;
						l.trailHead++;
						for (let j = 0; j < TRAIL_LEN; j++) {
							l.trailAge[j] = Math.min(1, l.trailAge[j]! + 0.12);
						}

						// Physics: gravity + wobble
						l.vy = Math.min(l.vy + 0.18, 14);
						l.x += l.vx + Math.sin(l.wobblePhase) * 0.6;
						l.y += l.vy;
						l.wobblePhase += 0.04;
						l.rotation += l.rotSpeed;

						// Pile collision
						const col = Math.max(0, Math.min(PILE_COLS - 1, Math.floor(l.x / colW)));
						const pileTop = H - pileHeights[col]!;
						const landY = pileTop - l.radius * 0.6;

						if (l.y + l.radius >= landY) {
							l.y = landY - l.radius;
							l.landed = true;
							const grow = l.radius * 1.6;
							pileHeights[col] = pileHeights[col]! + grow;
							if (col > 0) pileHeights[col - 1] = pileHeights[col - 1]! + grow * 0.4;
							if (col < PILE_COLS - 1) pileHeights[col + 1] = pileHeights[col + 1]! + grow * 0.4;
						}
					}
				}

				// Block interaction once lemons cover half the screen
				if (phase === "fill" || phase === "explode") {
					const minHeight = Math.min(...Array.from(pileHeights));
					if (minHeight > H * 0.5 && canvas.style.pointerEvents !== "all") {
						canvas.style.pointerEvents = "all";
					}
				}

				// Trigger explosion burst (one-shot)
				if (phase === "explode" && !explodeTriggered) {
					explodeTriggered = true;
					canvas.style.pointerEvents = "none";
					const cx = W / 2;
					const cy = H / 2;
					const colors = [LEMON_YELLOW, "#f8f040", LEAF_GREEN, "#ffffff", LEMON_DARK, "#fff880"];
					for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
						const angle = Math.random() * Math.PI * 2;
						const speed = 2 + Math.random() * 14;
						spawnParticle(
							cx + (Math.random() - 0.5) * W * 0.6,
							cy + (Math.random() - 0.5) * H * 0.6,
							Math.cos(angle) * speed,
							Math.sin(angle) * speed - 2,
							2 + Math.random() * 6,
							colors[Math.floor(Math.random() * colors.length)]!,
							0.008 + Math.random() * 0.02,
						);
					}
				}

				// Update particles
				if (phase === "explode") {
					for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
						const p = particles[i]!;
						if (!p.active) continue;
						p.x += p.vx;
						p.y += p.vy;
						p.vy += 0.25;
						p.alpha -= p.alphaDelta;
						if (p.alpha <= 0) p.active = false;
					}
				}

				// ── Draw ──────────────────────────────────────────────────────
				if (phase !== "explode") {
					drawPile();
					for (let i = 0; i < activeLemonCount; i++) {
						const l = lemonPool[i]!;
						drawTrail(l);
						drawLemon(l);
					}
					if (phase === "cloud" || phase === "rain" || phase === "fill") {
						drawCloud(cloudX, cloudY, lightningFlash);
					}
				} else {
					// Fade pile out as explosion progresses, then draw particles
					const explodeElapsed = elapsed - 9500;
					const pileAlpha = Math.max(0, 1 - explodeElapsed / 1200);
					if (pileAlpha > 0) {
						ctx.save();
						ctx.globalAlpha = pileAlpha;
						drawPile();
						ctx.restore();
					}

					for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
						const p = particles[i]!;
						if (!p.active) continue;
						ctx.beginPath();
						ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
						ctx.fillStyle =
							p.color +
							Math.round(p.alpha * 255)
								.toString(16)
								.padStart(2, "0");
						ctx.fill();
					}
				}

				animRef.current = requestAnimationFrame(frame);
			}

			animRef.current = requestAnimationFrame(frame);
		};
	});

	function cleanup() {
		cancelAnimationFrame(animRef.current);
		const canvas = canvasRef.current;
		if (canvas) canvas.remove();
		canvasRef.current = null;
		activeRef.current = false;
	}

	useEffect(() => {
		let sequence: string[] = [];

		function handleKey(e: KeyboardEvent) {
			if (activeRef.current) return;
			sequence.push(e.key);
			if (sequence.length > KONAMI.length) sequence.shift();
			if (sequence.length === KONAMI.length && sequence.every((k, i) => k === KONAMI[i])) {
				sequence = [];
				triggerRef.current();
			}
		}

		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, []);

	// Clean up canvas on unmount
	useEffect(() => {
		return () => {
			cancelAnimationFrame(animRef.current);
			const canvas = canvasRef.current;
			if (canvas) canvas.remove();
		};
	}, []);

	// Renders nothing — canvas is imperatively appended to body when triggered
	return null;
}
