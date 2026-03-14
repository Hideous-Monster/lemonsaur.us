"use client";

import { useEffect, useRef } from "react";

// C64-inspired color palette
const COLOR_PRIMARY = "#40b848"; // Matrix green
const COLOR_BRIGHT = "#b8d850"; // Lemon green for bright/lead chars
const COLOR_MESSAGE = "#70e070"; // Brighter green for hidden message chars
const COLOR_BG = "#0a140a"; // Near-black background

// Character pool: katakana + latin + numbers
const CHARS =
	"アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン" +
	"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

// Hidden messages that occasionally appear in the rain
const MESSAGES = [
	"HELLO",
	"WAKE UP",
	"FOLLOW THE LEMON",
	"TRY LS -A",
	"THERE IS NO SPOON",
	"FREE YOUR MIND",
	"KNOCK KNOCK",
	"THE MATRIX HAS YOU",
	"WHITE RABBIT",
	"LEMONSAURUS",
	"LOOK CLOSER",
	"YOU ARE THE ONE",
	"SYSTEM FAILURE",
	"REMEMBER",
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
	message?: string; // if set, this drop spells out a hidden message
	messageOffset?: number; // where in the trail the message starts
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
		let lastMessageTime = 0;

		function makeDrop(x: number, offscreen?: boolean): Drop {
			return {
				x,
				y: offscreen ? Math.random() * -10 : (Math.random() * -(canvas?.height ?? 600)) / FONT_SIZE,
				speed: 0.08 + Math.random() * 0.2,
				length: 8 + Math.floor(Math.random() * 20),
				chars: Array.from({ length: 30 }, randomChar),
			};
		}

		function makeMessageDrop(x: number, message: string): Drop {
			const padding = 3 + Math.floor(Math.random() * 4);
			const length = message.length + padding * 2;
			const chars: string[] = [];
			for (let i = 0; i < length; i++) {
				if (i >= padding && i < padding + message.length) {
					chars.push(message[i - padding]!);
				} else {
					chars.push(randomChar());
				}
			}
			return {
				x,
				y: Math.random() * -5,
				speed: 0.12 + Math.random() * 0.12,
				length,
				chars,
				message,
				messageOffset: padding,
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

			// Spawn a message drop every 4-8 seconds
			if (now - lastMessageTime > 4000 + Math.random() * 4000) {
				lastMessageTime = now;
				const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)]!;
				const col = Math.floor(Math.random() * drops.length);
				drops[col] = makeMessageDrop(col, msg);
			}

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

					// Check if this position is part of the hidden message
					const isMessageChar =
						drop.message !== undefined &&
						drop.messageOffset !== undefined &&
						t >= drop.messageOffset &&
						t < drop.messageOffset + drop.message.length;

					if (isHead) {
						ctx.fillStyle = COLOR_BRIGHT;
					} else if (isMessageChar) {
						// Message chars are brighter — subtle but noticeable
						const alpha = Math.floor(Math.max(opacity, 0.7) * 255)
							.toString(16)
							.padStart(2, "0");
						ctx.fillStyle = `${COLOR_MESSAGE}${alpha}`;
					} else {
						const alpha = Math.floor(opacity * 200)
							.toString(16)
							.padStart(2, "0");
						ctx.fillStyle = `${COLOR_PRIMARY}${alpha}`;
					}

					// Occasionally randomize non-message chars in the trail
					if (Math.random() < 0.02 && !isMessageChar) {
						drop.chars[t] = randomChar();
					}

					const ch = drop.chars[t] ?? randomChar();
					ctx.fillText(ch, (drop.x + 0.5) * FONT_SIZE, (row + 1) * FONT_SIZE);
				}

				drop.y += drop.speed;

				// Reset drop when it scrolls off bottom
				if (drop.y - drop.length > canvas.height / FONT_SIZE) {
					const reset = makeDrop(drop.x, true);
					drop.y = reset.y;
					drop.speed = reset.speed;
					drop.length = reset.length;
					drop.chars = reset.chars;
					drop.message = undefined;
					drop.messageOffset = undefined;
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
