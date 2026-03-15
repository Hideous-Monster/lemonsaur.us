"use client";

import { useEffect, useRef } from "react";

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

const LEMON_YELLOW = "#e8e040";
const LEMON_DARK = "#b8a020";
const LEAF_GREEN = "#40a828";

const TRAIL_LEN = 8;
const LEMON_POOL_SIZE = 300;
const PARTICLE_POOL_SIZE = 1000;

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
	active: boolean;
	landed: boolean;
	trailX: Float32Array;
	trailY: Float32Array;
	trailAge: Float32Array;
	trailHead: number;
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
		active: false,
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

export function KonamiEasterEgg() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const animRef = useRef<number>(0);
	const activeRef = useRef(false);
	const triggerRef = useRef<() => void>(() => {});

	useEffect(() => {
		triggerRef.current = function triggerAnimation() {
			if (activeRef.current) return;
			activeRef.current = true;

			const canvas = document.createElement("canvas");
			canvas.style.cssText =
				"position:fixed;inset:0;z-index:9999;pointer-events:none;width:100%;height:100%;";
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			document.body.appendChild(canvas);
			canvasRef.current = canvas;

			const ctx = canvas.getContext("2d")!;
			const W = canvas.width;
			const H = canvas.height;
			const startTime = performance.now();

			// Multiple clouds that drift across
			const cloudW = 350;
			interface Cloud {
				x: number;
				y: number;
				targetX: number;
				speed: number;
				scale: number;
				flash: number;
				flashTimer: number;
			}
			const clouds: Cloud[] = [
				{ x: W + 200, y: 45, targetX: W * 0.7, speed: 0, scale: 1, flash: 0, flashTimer: 500 },
				{ x: W + 400, y: 35, targetX: W * 0.3, speed: 0, scale: 0.9, flash: 0, flashTimer: 800 },
				{ x: W + 600, y: 55, targetX: W * 0.5, speed: 0, scale: 0.85, flash: 0, flashTimer: 1200 },
			];

			// Lemon pool
			const lemons: Lemon[] = Array.from({ length: LEMON_POOL_SIZE }, makeLemon);

			// Pile: simple per-pixel-column height tracking
			const PILE_COLS = Math.ceil(W / 8);
			const pileH = new Float32Array(PILE_COLS).fill(0);
			const colW = W / PILE_COLS;

			// Particles
			const particles: Particle[] = Array.from({ length: PARTICLE_POOL_SIZE }, makeParticle);

			let lastSpawn = 0;
			let exploded = false;

			function spawnLemon(spreadFactor: number) {
				for (const l of lemons) {
					if (l.active) continue;
					l.active = true;
					l.landed = false;
					// Pick a random cloud to spawn from
					const cloud = clouds[Math.floor(Math.random() * clouds.length)]!;
					// As spreadFactor grows, lemons spawn increasingly across full width
					if (Math.random() < spreadFactor * 0.4) {
						l.x = Math.random() * W;
						l.y = -20 - Math.random() * 40;
					} else {
						l.x = cloud.x - cloudW * 0.3 * cloud.scale + Math.random() * cloudW * 0.6 * cloud.scale;
						l.y = cloud.y + 70 + Math.random() * 20;
					}
					l.vx = (Math.random() - 0.5) * 3;
					l.vy = 2 + Math.random() * 3;
					l.rotation = Math.random() * Math.PI * 2;
					l.rotSpeed = (Math.random() - 0.5) * 0.1;
					l.wobblePhase = Math.random() * Math.PI * 2;
					l.wobbleAmp = 10 + Math.random() * 15;
					l.radius = 10 + Math.random() * 12;
					l.trailAge.fill(1);
					l.trailHead = 0;
					return;
				}
			}

			function drawCloud(cx: number, cy: number, flash: number) {
				ctx.save();
				// Draw as a single flat shape using a wide clipped ellipse filled with gradient
				// Bottom layer: dark flat ellipse
				ctx.fillStyle = "#1a2a1a";
				ctx.beginPath();
				ctx.ellipse(cx, cy + 20, cloudW * 0.48, 55, 0, 0, Math.PI * 2);
				ctx.fill();

				// Middle bumps
				ctx.fillStyle = "#222e22";
				ctx.beginPath();
				ctx.ellipse(cx - 80, cy - 10, 90, 50, 0, 0, Math.PI * 2);
				ctx.fill();
				ctx.beginPath();
				ctx.ellipse(cx + 70, cy - 5, 85, 48, 0, 0, Math.PI * 2);
				ctx.fill();

				// Top bumps
				ctx.fillStyle = "#2a3a2a";
				ctx.beginPath();
				ctx.ellipse(cx - 30, cy - 30, 70, 40, 0, 0, Math.PI * 2);
				ctx.fill();
				ctx.beginPath();
				ctx.ellipse(cx + 30, cy - 25, 65, 38, 0, 0, Math.PI * 2);
				ctx.fill();

				// Flat bottom — cover the bottom half to flatten the cloud
				ctx.fillStyle = "#1e2e1e";
				ctx.fillRect(cx - cloudW * 0.48, cy + 15, cloudW * 0.96, 60);

				// Underbelly gradient
				const underGrad = ctx.createLinearGradient(cx, cy + 15, cx, cy + 70);
				underGrad.addColorStop(0, "#1e2e1e");
				underGrad.addColorStop(1, "rgba(26,42,26,0)");
				ctx.fillStyle = underGrad;
				ctx.fillRect(cx - cloudW * 0.48, cy + 15, cloudW * 0.96, 55);

				// Lightning flash overlay
				if (flash > 0) {
					ctx.globalAlpha = flash * 0.4;
					ctx.fillStyle = "#80ff80";
					ctx.beginPath();
					ctx.ellipse(cx, cy, cloudW * 0.4, 60, 0, 0, Math.PI * 2);
					ctx.fill();
					ctx.globalAlpha = 1;
				}

				ctx.restore();
			}

			function drawLemon(l: Lemon) {
				ctx.save();
				ctx.translate(l.x, l.y);
				ctx.rotate(l.rotation);

				// Lemon body
				ctx.fillStyle = LEMON_YELLOW;
				ctx.beginPath();
				ctx.ellipse(0, 0, l.radius, l.radius * 0.7, 0, 0, Math.PI * 2);
				ctx.fill();

				// Highlight
				ctx.fillStyle = "rgba(255,255,255,0.3)";
				ctx.beginPath();
				ctx.ellipse(
					-l.radius * 0.25,
					-l.radius * 0.2,
					l.radius * 0.35,
					l.radius * 0.2,
					-0.3,
					0,
					Math.PI * 2,
				);
				ctx.fill();

				// Leaf
				ctx.fillStyle = LEAF_GREEN;
				ctx.beginPath();
				ctx.ellipse(0, -l.radius * 0.75, l.radius * 0.35, l.radius * 0.15, -0.4, 0, Math.PI * 2);
				ctx.fill();

				ctx.restore();
			}

			function drawTrail(l: Lemon) {
				for (let i = 0; i < TRAIL_LEN; i++) {
					const age = l.trailAge[i]!;
					if (age >= 1) continue;
					const alpha = (1 - age) * 0.5;
					const r = 2.5 * (1 - age);
					ctx.fillStyle = i % 2 === 0 ? `rgba(255,255,255,${alpha})` : `rgba(232,224,64,${alpha})`;
					ctx.beginPath();
					ctx.arc(l.trailX[i]!, l.trailY[i]!, r, 0, Math.PI * 2);
					ctx.fill();
				}
			}

			function drawPile() {
				// Draw pile as a filled shape from bottom
				ctx.fillStyle = LEMON_YELLOW;
				ctx.beginPath();
				ctx.moveTo(0, H);
				for (let c = 0; c < PILE_COLS; c++) {
					const h = pileH[c]!;
					// Smooth the pile edges
					const prevH = c > 0 ? pileH[c - 1]! : h;
					const nextH = c < PILE_COLS - 1 ? pileH[c + 1]! : h;
					const smoothH = (prevH + h * 2 + nextH) / 4;
					ctx.lineTo(c * colW + colW / 2, H - smoothH);
				}
				ctx.lineTo(W, H);
				ctx.closePath();
				ctx.fill();

				// Add some texture/shading on top of pile
				ctx.fillStyle = LEMON_DARK;
				ctx.beginPath();
				ctx.moveTo(0, H);
				for (let c = 0; c < PILE_COLS; c++) {
					const h = pileH[c]!;
					const prevH = c > 0 ? pileH[c - 1]! : h;
					const nextH = c < PILE_COLS - 1 ? pileH[c + 1]! : h;
					const smoothH = (prevH + h * 2 + nextH) / 4;
					// Offset slightly for shadow
					ctx.lineTo(c * colW + colW / 2, H - smoothH + 4);
				}
				ctx.lineTo(W, H);
				ctx.closePath();
				ctx.fill();

				// Draw some lemon outlines on the pile surface for texture
				ctx.strokeStyle = "rgba(184,160,32,0.4)";
				ctx.lineWidth = 1;
				for (let c = 0; c < PILE_COLS; c += 3) {
					const h = pileH[c]!;
					if (h < 10) continue;
					const x = c * colW + colW * 1.5;
					const y = H - h + 5;
					ctx.beginPath();
					ctx.ellipse(x, y, 8, 5, 0, 0, Math.PI * 2);
					ctx.stroke();
				}
			}

			const RAIN_START = 1500;
			const EXPLODE_AT = 12000;
			const STORM_TEXT_START = 2500;
			const STORM_TEXT_END = 5000;

			function frame(now: number) {
				const elapsed = now - startTime;
				ctx.clearRect(0, 0, W, H);

				// Cloud movement — each cloud eases to its target, then drifts slowly
				for (let i = 0; i < clouds.length; i++) {
					const c = clouds[i]!;
					const delay = i * 400;
					const progress = Math.min(1, Math.max(0, elapsed - delay) / 1800);
					const eased = 1 - (1 - progress) ** 3;
					c.x = W + 200 + i * 200 + (c.targetX - W - 200 - i * 200) * eased;
					// Slow drift after arriving
					if (progress >= 1) {
						c.x += Math.sin(elapsed * 0.0003 + i * 2) * 30;
					}
					// Lightning
					c.flashTimer -= 16;
					if (c.flashTimer <= 0 && elapsed < EXPLODE_AT) {
						c.flashTimer = 500 + Math.random() * 2000;
						c.flash = 0.7 + Math.random() * 0.3;
					}
					c.flash = Math.max(0, c.flash - 0.04);
				}

				// Spawn lemons — ramp up aggressively
				if (elapsed > RAIN_START && !exploded) {
					const t = Math.min(1, (elapsed - RAIN_START) / 6000);
					const interval = Math.max(15, 150 - t * 140);
					if (now - lastSpawn > interval) {
						lastSpawn = now;
						const count = t > 0.7 ? 5 : t > 0.4 ? 3 : t > 0.2 ? 2 : 1;
						for (let i = 0; i < count; i++) spawnLemon(t);
					}
				}

				// Update lemons
				for (const l of lemons) {
					if (!l.active || l.landed) continue;

					// Trail
					const ti = l.trailHead % TRAIL_LEN;
					l.trailX[ti] = l.x;
					l.trailY[ti] = l.y;
					l.trailAge[ti] = 0;
					l.trailHead++;
					for (let j = 0; j < TRAIL_LEN; j++) {
						l.trailAge[j] = Math.min(1, l.trailAge[j]! + 0.1);
					}

					// Physics
					l.vy = Math.min(l.vy + 0.2, 16);
					l.x += l.vx + Math.sin(l.wobblePhase) * 0.8;
					l.y += l.vy;
					l.wobblePhase += 0.05;
					l.rotation += l.rotSpeed;

					// Pile collision
					const col = Math.max(0, Math.min(PILE_COLS - 1, Math.floor(l.x / colW)));
					const pileTop = H - pileH[col]!;

					if (l.y + l.radius >= pileTop) {
						l.y = pileTop - l.radius;
						l.landed = true;
						// Grow pile
						const grow = l.radius * 1.4;
						pileH[col] = Math.min(H, pileH[col]! + grow);
						// Spread to neighbors
						for (let spread = 1; spread <= 3; spread++) {
							const factor = grow * (0.5 / spread);
							if (col - spread >= 0)
								pileH[col - spread] = Math.min(H, pileH[col - spread]! + factor);
							if (col + spread < PILE_COLS)
								pileH[col + spread] = Math.min(H, pileH[col + spread]! + factor);
						}
					}
				}

				// Block interaction once pile is tall enough
				const avgPile = pileH.reduce((a, b) => a + b, 0) / PILE_COLS;
				if (avgPile > H * 0.3 && canvas.style.pointerEvents !== "all") {
					canvas.style.pointerEvents = "all";
				}

				// Explosion at fixed time
				if (elapsed > EXPLODE_AT && !exploded) {
					exploded = true;
					canvas.style.pointerEvents = "none";
					const cx = W / 2;
					const cy = H / 2;
					const colors = [LEMON_YELLOW, "#f8f040", LEAF_GREEN, "#ffffff", LEMON_DARK, "#fff880"];
					for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
						const p = particles[i]!;
						const angle = Math.random() * Math.PI * 2;
						const speed = 4 + Math.random() * 18;
						p.x = cx + (Math.random() - 0.5) * W * 0.8;
						p.y = cy + (Math.random() - 0.5) * H * 0.8;
						p.vx = Math.cos(angle) * speed;
						p.vy = Math.sin(angle) * speed - 3;
						p.radius = 3 + Math.random() * 8;
						p.color = colors[Math.floor(Math.random() * colors.length)]!;
						p.alpha = 1;
						p.alphaDelta = 0.01 + Math.random() * 0.025;
						p.active = true;
					}
				}

				// Draw
				if (!exploded) {
					drawPile();
					for (const l of lemons) {
						if (!l.active || l.landed) continue;
						drawTrail(l);
						drawLemon(l);
					}
					// Draw all clouds
					for (const c of clouds) {
						ctx.save();
						ctx.scale(c.scale, c.scale);
						drawCloud(c.x / c.scale, c.y / c.scale, c.flash);
						ctx.restore();
					}
					// LEMONSTORM text — blinks dramatically
					if (elapsed > STORM_TEXT_START && elapsed < STORM_TEXT_END) {
						const textElapsed = elapsed - STORM_TEXT_START;
						const blink = Math.sin(textElapsed * 0.012) > 0;
						if (blink) {
							ctx.save();
							ctx.font = "bold 48px monospace";
							ctx.textAlign = "center";
							ctx.textBaseline = "middle";
							ctx.fillStyle = LEMON_YELLOW;
							ctx.shadowColor = LEMON_YELLOW;
							ctx.shadowBlur = 20;
							ctx.fillText("LEMONSTORM", W / 2, H / 2);
							ctx.shadowBlur = 40;
							ctx.fillText("LEMONSTORM", W / 2, H / 2);
							ctx.restore();
						}
					}
				} else {
					// Fade pile
					const explodeStart = performance.now();
					const fadeProgress = Math.min(1, (now - explodeStart) / 200);
					if (fadeProgress < 1) {
						ctx.save();
						ctx.globalAlpha = 1 - fadeProgress;
						drawPile();
						ctx.restore();
					}

					// Draw explosion particles
					let anyActive = false;
					for (const p of particles) {
						if (!p.active) continue;
						anyActive = true;
						p.x += p.vx;
						p.y += p.vy;
						p.vy += 0.15;
						p.alpha -= p.alphaDelta;
						if (p.alpha <= 0) {
							p.active = false;
							continue;
						}
						ctx.fillStyle =
							p.color +
							Math.round(p.alpha * 255)
								.toString(16)
								.padStart(2, "0");
						ctx.beginPath();
						ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
						ctx.fill();
					}

					if (!anyActive) {
						// All done
						cleanup();
						return;
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

	useEffect(() => {
		return () => {
			cancelAnimationFrame(animRef.current);
			const canvas = canvasRef.current;
			if (canvas) canvas.remove();
		};
	}, []);

	return null;
}
