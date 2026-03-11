"use client";

import { useEffect, useRef } from "react";

// C64-inspired color palette
const COLOR_PRIMARY = "#40b848"; // Matrix green
const COLOR_BRIGHT = "#b8d850"; // Lemon green for bright/lead chars
const COLOR_BG = "#0a140a"; // Near-black background

// Character pool: katakana + latin + numbers
const CHARS =
	"アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン" +
	"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

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
		let animFrame: number;

		function resize() {
			if (!canvas || !ctx) return;
			canvas.width = canvas.offsetWidth;
			canvas.height = canvas.offsetHeight;

			const cols = Math.floor(canvas.width / FONT_SIZE);
			drops = Array.from({ length: cols }, (_, i) => ({
				x: i,
				y: (Math.random() * -(canvas?.height ?? 600)) / FONT_SIZE,
				speed: 0.2 + Math.random() * 0.5,
				length: 8 + Math.floor(Math.random() * 20),
				chars: Array.from({ length: 30 }, randomChar),
			}));
		}

		function draw() {
			if (!canvas || !ctx) return;

			// Fade background — semi-transparent fill creates the trail effect
			ctx.fillStyle = `${COLOR_BG}18`;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.font = `bold ${FONT_SIZE}px monospace`;
			ctx.textAlign = "center";

			for (const drop of drops) {
				const headRow = Math.floor(drop.y);

				// Draw trail chars from oldest to newest
				for (let t = drop.length; t >= 0; t--) {
					const row = headRow - t;
					if (row < 0 || row > canvas.height / FONT_SIZE + 2) continue;

					const opacity = 1 - t / drop.length;
					const isHead = t === 0;

					if (isHead) {
						// Bright lead character
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
				if (drop.y - drop.length > canvas.height / FONT_SIZE) {
					drop.y = Math.random() * -10;
					drop.speed = 0.2 + Math.random() * 0.5;
					drop.length = 8 + Math.floor(Math.random() * 20);
					drop.chars = Array.from({ length: 30 }, randomChar);
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
