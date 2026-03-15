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

			// Preload boot image
			const bootImg = new Image();
			bootImg.src = "/images/lemon87_bootup.png";

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
			let juiceLevel = 0; // rises from 0 to H

			function spawnLemon(spreadFactor: number) {
				for (const l of lemons) {
					if (l.active) continue;
					l.active = true;
					l.landed = false;
					// Pick a random cloud to spawn from
					const cloud = clouds[Math.floor(Math.random() * clouds.length)]!;
					// As spreadFactor grows, lemons spawn increasingly across full width
					if (Math.random() < spreadFactor * 0.6) {
						l.x = Math.random() * W;
						l.y = -20 - Math.random() * 60;
					} else {
						l.x = cloud.x - cloudW * 0.4 * cloud.scale + Math.random() * cloudW * 0.8 * cloud.scale;
						l.y = cloud.y + 50 + Math.random() * 30;
					}
					l.vx = (Math.random() - 0.5) * 5;
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

				// Build cloud as overlapping soft ellipses — bottom ones wider/flatter
				const puffs: [number, number, number, number, string][] = [
					// [dx, dy, rx, ry, color]
					// Wide dark base with bumpy bottom
					[-120, 40, 80, 30, "#1a2a1a"],
					[-40, 45, 90, 28, "#1a2a1a"],
					[40, 42, 85, 32, "#1a2a1a"],
					[120, 38, 75, 28, "#1a2a1a"],
					// Main body
					[-100, 15, 95, 45, "#1e2e1e"],
					[0, 20, 110, 42, "#1e2e1e"],
					[100, 15, 90, 44, "#1e2e1e"],
					// Upper bumps
					[-70, -10, 80, 40, "#222e22"],
					[50, -15, 85, 42, "#222e22"],
					[-20, -5, 90, 38, "#252f25"],
					// Top puffs
					[-40, -35, 60, 32, "#2a3a2a"],
					[30, -30, 55, 30, "#2a3a2a"],
					[0, -40, 45, 25, "#2d3d2d"],
				];

				for (const [dx, dy, rx, ry, color] of puffs) {
					ctx.fillStyle = color;
					ctx.beginPath();
					ctx.ellipse(cx + dx, cy + dy, rx, ry, 0, 0, Math.PI * 2);
					ctx.fill();
				}

				// Lightning: flash the WHOLE cloud brighter, not a circle
				if (flash > 0) {
					for (const [dx, dy, rx, ry] of puffs) {
						ctx.globalAlpha = flash * 0.35;
						ctx.fillStyle = "#60c060";
						ctx.beginPath();
						ctx.ellipse(cx + dx, cy + dy, rx * 0.9, ry * 0.9, 0, 0, Math.PI * 2);
						ctx.fill();
					}
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

			function drawJuice(level: number, time: number) {
				if (level <= 0) return;
				const juiceTop = H - level;
				// Wavy surface
				ctx.fillStyle = "#d8c830";
				ctx.beginPath();
				ctx.moveTo(0, H);
				ctx.lineTo(0, juiceTop);
				for (let x = 0; x <= W; x += 4) {
					const wave1 = Math.sin(x * 0.02 + time * 0.003) * 6;
					const wave2 = Math.sin(x * 0.035 + time * 0.005 + 1) * 4;
					const wave3 = Math.sin(x * 0.008 + time * 0.002) * 8;
					ctx.lineTo(x, juiceTop + wave1 + wave2 + wave3);
				}
				ctx.lineTo(W, H);
				ctx.closePath();
				ctx.fill();

				// Lighter surface highlight
				ctx.fillStyle = "#e8d840";
				ctx.beginPath();
				ctx.moveTo(0, H);
				ctx.lineTo(0, juiceTop + 3);
				for (let x = 0; x <= W; x += 4) {
					const wave1 = Math.sin(x * 0.02 + time * 0.003) * 6;
					const wave2 = Math.sin(x * 0.035 + time * 0.005 + 1) * 4;
					const wave3 = Math.sin(x * 0.008 + time * 0.002) * 8;
					ctx.lineTo(x, juiceTop + wave1 + wave2 + wave3 + 3);
				}
				ctx.lineTo(W, H);
				ctx.closePath();
				ctx.fill();

				// Foam/bubbles near surface
				ctx.fillStyle = "rgba(255,255,200,0.3)";
				for (let i = 0; i < 15; i++) {
					const bx = ((time * 0.05 + i * 97) % (W + 40)) - 20;
					const by = juiceTop + Math.sin(time * 0.004 + i) * 5 + 10;
					if (by < H) {
						ctx.beginPath();
						ctx.arc(bx, by, 3 + (i % 3), 0, Math.PI * 2);
						ctx.fill();
					}
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

				// Spawn lemons — keep going until explosion
				if (elapsed > RAIN_START && elapsed < EXPLODE_AT) {
					const t = Math.min(1, (elapsed - RAIN_START) / 4000);
					const interval = Math.max(10, 100 - t * 90);
					if (now - lastSpawn > interval) {
						lastSpawn = now;
						const count = t > 0.6 ? 8 : t > 0.3 ? 5 : t > 0.1 ? 3 : 1;
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

				// Rising juice level — starts after 3s, accelerates (cubic)
				if (elapsed > 3000 && !exploded) {
					const juiceT = Math.min(1, (elapsed - 3000) / (EXPLODE_AT - 3000));
					juiceLevel = juiceT * juiceT * juiceT * H; // cubic — slow start, fast finish
				}

				// Block interaction once juice covers half the screen
				if (juiceLevel > H * 0.4 && canvas.style.pointerEvents !== "all") {
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
					// Juice level (behind everything)
					drawJuice(juiceLevel, elapsed);
					drawPile();
					for (const l of lemons) {
						if (!l.active || l.landed) continue;
						drawTrail(l);
						drawLemon(l);
					}
					// Clouds
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
					const e = elapsed - EXPLODE_AT;
					canvas.style.pointerEvents = "all";

					if (e < 100) {
						// White flash
						ctx.fillStyle = "#ffffcc";
						ctx.fillRect(0, 0, W, H);
					} else if (e < 800) {
						// BSOD
						ctx.fillStyle = "#0000aa";
						ctx.fillRect(0, 0, W, H);
						ctx.font = "bold 16px monospace";
						ctx.fillStyle = "#ffffff";
						ctx.textAlign = "center";
						ctx.fillText("*** LEMON/87 SYSTEM FAILURE ***", W / 2, H / 2 - 60);
						ctx.font = "13px monospace";
						ctx.fillText(
							"A fatal exception 0xC0FFEE has occurred at 0028:C0DE1337",
							W / 2,
							H / 2 - 20,
						);
						ctx.fillText(
							"LEMONSTORM.SYS caused a citrus overflow in module LEMON.DRV",
							W / 2,
							H / 2 + 10,
						);
						ctx.fillText("", W / 2, H / 2 + 40);
						ctx.fillText("*  Press any key to reboot the system.  *", W / 2, H / 2 + 60);
						ctx.fillText("*  Press CTRL+ALT+DEL if system hangs.  *", W / 2, H / 2 + 80);
					} else if (e < 1200) {
						// Black pause
						ctx.fillStyle = "#0a140a";
						ctx.fillRect(0, 0, W, H);
					} else if (e < 3200) {
						// POST screen — yellow on dark green, fast and punchy
						ctx.fillStyle = "#0a140a";
						ctx.fillRect(0, 0, W, H);
						ctx.fillStyle = LEMON_YELLOW;

						// Big BIOS title
						ctx.textAlign = "center";
						ctx.font = "bold 18px monospace";
						ctx.fillText("LEMON BIOS v87.1", W / 2, 30);
						ctx.font = "11px monospace";
						ctx.fillStyle = "#a0a060";
						ctx.fillText("Copyright (C) 1987 Lemon Microsystems Ltd.", W / 2, 50);
						ctx.fillText("MOS 6510 CPU @ 1.023 MHz", W / 2, 66);

						// Divider
						ctx.fillStyle = LEMON_YELLOW;
						ctx.fillRect(20, 78, W - 40, 1);

						// POST lines — fast timing
						const postT = e - 1200;
						const postLines: string[] = [];
						ctx.textAlign = "left";
						ctx.font = "13px monospace";

						if (postT > 50) {
							const memK = Math.min(87, Math.floor(postT / 8));
							postLines.push(`Memory Test: ${String(memK).padStart(3)}K OK`);
						}
						if (postT > 750) postLines.push("");
						if (postT > 800) postLines.push("Keyboard.......... Detected");
						if (postT > 900) postLines.push("Display........... 40x25 CRT Color");
						if (postT > 1000) postLines.push("Drive A........... 1541 Floppy");
						if (postT > 1100) postLines.push("Sound............. SID 6581 (3 voices)");
						if (postT > 1200) postLines.push("Citrus Engine..... v3.7 OPERATIONAL");
						if (postT > 1400) postLines.push("");
						if (postT > 1400) postLines.push("All systems nominal. Booting LEMON/87...");

						ctx.fillStyle = LEMON_YELLOW;
						for (let i = 0; i < postLines.length; i++) {
							ctx.fillText(postLines[i]!, 24, 100 + i * 17);
						}
					} else if (e < 6700) {
						// Boot logo with loading bar
						ctx.fillStyle = "#0a140a";
						ctx.fillRect(0, 0, W, H);

						// Draw boot image fullscreen (cover)
						if (bootImg.complete && bootImg.naturalWidth > 0) {
							const imgRatio = bootImg.naturalWidth / bootImg.naturalHeight;
							const canvasRatio = W / H;
							let drawW: number;
							let drawH: number;
							if (canvasRatio > imgRatio) {
								drawW = W;
								drawH = W / imgRatio;
							} else {
								drawH = H;
								drawW = H * imgRatio;
							}
							ctx.drawImage(bootImg, (W - drawW) / 2, (H - drawH) / 2, drawW, drawH);
						}

						// Loading bar near bottom
						const barW = Math.min(500, W * 0.7);
						const barH = 18;
						const barX = (W - barW) / 2;
						const barY = H * 0.85;
						const loadT = Math.min(1, (e - 3200) / 3200);

						// Bar outline
						ctx.strokeStyle = LEMON_YELLOW;
						ctx.lineWidth = 2;
						ctx.strokeRect(barX, barY, barW, barH);

						// Rainbow gradient fill ROYGBIV
						const fillW = barW * loadT;
						if (fillW > 0) {
							const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
							grad.addColorStop(0, "#ff5050"); // Red
							grad.addColorStop(0.16, "#ff9040"); // Orange
							grad.addColorStop(0.33, "#e8e040"); // Yellow
							grad.addColorStop(0.5, "#40b848"); // Green
							grad.addColorStop(0.66, "#5090ff"); // Blue
							grad.addColorStop(0.83, "#8050d0"); // Indigo
							grad.addColorStop(1, "#c050ff"); // Violet
							ctx.fillStyle = grad;
							ctx.fillRect(barX + 2, barY + 2, fillW - 4, barH - 4);
						}

						// Loading text
						ctx.textAlign = "center";
						ctx.font = "12px monospace";
						ctx.fillStyle = LEMON_YELLOW;
						ctx.fillText(loadT < 1 ? "LOADING LEMON/87..." : "READY.", W / 2, barY + barH + 24);
					} else {
						cleanup();
						window.location.reload();
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
