"use client";

import { useEffect, useRef } from "react";

// C64-inspired color palette
const COLOR_PRIMARY = "#40b848"; // Matrix green
const COLOR_BRIGHT = "#b8d850"; // Lemon green for bright/lead chars
const COLOR_MESSAGE = "#ffffff"; // White for revealed message chars
const COLOR_BG = "#0a140a"; // Near-black background

// Character pool: katakana + latin + numbers
const CHARS =
	"アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン" +
	"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

// PEP 20 — The Zen of Python, hidden in the rain
const MESSAGES = [
	"BEAUTIFUL IS BETTER THAN UGLY",
	"EXPLICIT IS BETTER THAN IMPLICIT",
	"SIMPLE IS BETTER THAN COMPLEX",
	"COMPLEX IS BETTER THAN COMPLICATED",
	"FLAT IS BETTER THAN NESTED",
	"SPARSE IS BETTER THAN DENSE",
	"READABILITY COUNTS",
	"SPECIAL CASES ARENT SPECIAL ENOUGH TO BREAK THE RULES",
	"ALTHOUGH PRACTICALITY BEATS PURITY",
	"ERRORS SHOULD NEVER PASS SILENTLY",
	"UNLESS EXPLICITLY SILENCED",
	"IN THE FACE OF AMBIGUITY REFUSE THE TEMPTATION TO GUESS",
	"THERE SHOULD BE ONE OBVIOUS WAY TO DO IT",
	"NOW IS BETTER THAN NEVER",
	"ALTHOUGH NEVER IS OFTEN BETTER THAN RIGHT NOW",
	"IF THE IMPLEMENTATION IS HARD TO EXPLAIN ITS A BAD IDEA",
	"NAMESPACES ARE ONE HONKING GREAT IDEA",
];

function randomChar(): string {
	return CHARS[Math.floor(Math.random() * CHARS.length)] ?? "0";
}

interface Drop {
	x: number; // column index
	y: number; // current head row (float for smooth motion)
	speed: number; // rows per frame
	length: number; // trail length in chars
	chars: string[]; // character buffer for trail
}

/** A horizontal message that reveals letter-by-letter as drops hit it. */
interface FloatingMessage {
	text: string;
	row: number; // fixed row position
	col: number; // starting column
	revealed: boolean[]; // per-character: has a drop hit this letter yet?
	spawnTime: number;
	duration: number; // ms to stay visible after fully revealed (or after spawn)
}

interface MatrixRainProps {
	onExit: () => void;
}

export function MatrixRain({ onExit }: MatrixRainProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const onExitRef = useRef(onExit);
	onExitRef.current = onExit;

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const FONT_SIZE = 14;
		let drops: Drop[] = [];
		let messages: FloatingMessage[] = [];
		let animFrame: number;
		let lastMessageTime = 0;
		let messageIndex = 0;

		function makeDrop(x: number, offscreen?: boolean): Drop {
			return {
				x,
				y: offscreen ? Math.random() * -10 : (Math.random() * -(canvas?.height ?? 600)) / FONT_SIZE,
				speed: 0.08 + Math.random() * 0.2,
				length: 8 + Math.floor(Math.random() * 20),
				chars: Array.from({ length: 30 }, randomChar),
			};
		}

		function resize() {
			if (!canvas || !ctx) return;
			canvas.width = canvas.offsetWidth;
			canvas.height = canvas.offsetHeight;

			const cols = Math.floor(canvas.width / FONT_SIZE);
			drops = Array.from({ length: cols }, (_, i) => makeDrop(i));
		}

		function draw() {
			if (!canvas || !ctx) return;

			const now = Date.now();
			const cols = Math.floor(canvas.width / FONT_SIZE);
			const rows = Math.floor(canvas.height / FONT_SIZE);

			// Spawn a horizontal message every 4-8 seconds
			if (now - lastMessageTime > 4000 + Math.random() * 4000) {
				lastMessageTime = now;
				const text = MESSAGES[messageIndex % MESSAGES.length]!;
				messageIndex++;
				const maxCol = Math.max(0, cols - text.length);
				messages.push({
					text,
					row: 2 + Math.floor(Math.random() * (rows - 4)),
					col: Math.floor(Math.random() * maxCol),
					revealed: Array.from({ length: text.length }, () => false),
					spawnTime: now,
					duration: 8000 + Math.random() * 4000,
				});
			}

			// Expire old messages
			messages = messages.filter((m) => now - m.spawnTime < m.duration);

			// Build a set of message cell positions for quick lookup during drop rendering
			// Maps "col,row" -> { msgIndex, charIndex } for reveal tracking
			const messageCells = new Map<string, { msg: FloatingMessage; idx: number }>();
			for (const msg of messages) {
				for (let i = 0; i < msg.text.length; i++) {
					messageCells.set(`${msg.col + i},${msg.row}`, { msg, idx: i });
				}
			}

			// Fade background
			ctx.fillStyle = `${COLOR_BG}18`;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.font = `bold ${FONT_SIZE}px monospace`;
			ctx.textAlign = "center";

			for (const drop of drops) {
				const headRow = Math.floor(drop.y);

				for (let t = drop.length; t >= 0; t--) {
					const row = headRow - t;
					if (row < 0 || row > rows + 2) continue;

					const key = `${drop.x},${row}`;
					const cell = messageCells.get(key);

					// A drop is touching this message cell — reveal it
					if (cell) {
						cell.msg.revealed[cell.idx] = true;
					}

					const opacity = 1 - t / drop.length;
					const isHead = t === 0;

					if (isHead) {
						ctx.fillStyle = COLOR_BRIGHT;
					} else {
						const alpha = Math.floor(opacity * 200)
							.toString(16)
							.padStart(2, "0");
						ctx.fillStyle = `${COLOR_PRIMARY}${alpha}`;
					}

					// Occasionally randomize a char in the trail
					if (Math.random() < 0.02) {
						drop.chars[t] = randomChar();
					}

					const ch = drop.chars[t] ?? randomChar();
					ctx.fillText(ch, (drop.x + 0.5) * FONT_SIZE, (row + 1) * FONT_SIZE);
				}

				drop.y += drop.speed;

				// Reset drop when it scrolls off bottom
				if (drop.y - drop.length > rows) {
					const reset = makeDrop(drop.x, true);
					drop.y = reset.y;
					drop.speed = reset.speed;
					drop.length = reset.length;
					drop.chars = reset.chars;
				}
			}

			// Draw revealed message characters on top
			for (const msg of messages) {
				const age = now - msg.spawnTime;
				const fadeStart = msg.duration * 0.7;
				const alpha =
					age > fadeStart
						? Math.floor(((msg.duration - age) / (msg.duration - fadeStart)) * 255)
						: 255;
				if (alpha <= 0) continue;
				const hex = alpha.toString(16).padStart(2, "0");
				ctx.fillStyle = `${COLOR_MESSAGE}${hex}`;

				for (let i = 0; i < msg.text.length; i++) {
					if (!msg.revealed[i]) continue;
					const col = msg.col + i;
					ctx.fillText(msg.text[i]!, (col + 0.5) * FONT_SIZE, (msg.row + 1) * FONT_SIZE);
				}
			}

			animFrame = requestAnimationFrame(draw);
		}

		resize();
		const observer = new ResizeObserver(resize);
		observer.observe(canvas);

		animFrame = requestAnimationFrame(draw);

		const handleKey = () => onExitRef.current();
		window.addEventListener("keydown", handleKey);

		return () => {
			cancelAnimationFrame(animFrame);
			observer.disconnect();
			window.removeEventListener("keydown", handleKey);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			onClick={() => onExitRef.current()}
			className="h-full w-full cursor-pointer"
			aria-label="Matrix rain effect — press any key or click to exit"
		/>
	);
}
