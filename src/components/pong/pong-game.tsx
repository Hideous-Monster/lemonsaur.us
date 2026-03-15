"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type GameState = "waiting" | "playing" | "paused" | "gameover";

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 64;
const BALL_RADIUS = 10;
const PADDLE_SPEED = 5;
const BALL_INITIAL_SPEED = 4;
const BALL_MAX_SPEED = 10;
const SPEED_INCREASE = 0.3;
const WINNING_SCORE = 7;

// AI: how quickly the AI paddle tracks the ball (0–1 scale, lower = dumber)
const AI_TRACK_SPEED = 0.06;
// Deadzone: AI won't move if within this many px of the ball center
const AI_DEADZONE = 12;

const BG_COLOR = "#0a140a";
const PADDLE_COLOR = "#40b848";
const LEMON_COLOR = "#e8e040";
const LEMON_LEAF_COLOR = "#40b848";
const CENTER_LINE_COLOR = "#40b848";
const SCORE_COLOR = "#e8e040";
const DIM_COLOR = "#405030";

interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	life: number; // 0–1, decreasing
	color: string;
}

interface PongGameProps {
	onExit: () => void;
}

export function PongGame({ onExit }: PongGameProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [gameState, setGameState] = useState<GameState>("waiting");
	const [playerScore, setPlayerScore] = useState(0);
	const [aiScore, setAiScore] = useState(0);
	const [highScore, setHighScore] = useState(0);
	const [winner, setWinner] = useState<"player" | "ai" | null>(null);

	// Game state refs (avoid stale closures in rAF loop)
	const gameStateRef = useRef<GameState>("waiting");
	const playerScoreRef = useRef(0);
	const aiScoreRef = useRef(0);
	const winnerRef = useRef<"player" | "ai" | null>(null);
	const currentStreakRef = useRef(0);

	// Paddle positions (y = top of paddle)
	const playerYRef = useRef(0);
	const aiYRef = useRef(0);

	// Ball state
	const ballXRef = useRef(0);
	const ballYRef = useRef(0);
	const ballVxRef = useRef(BALL_INITIAL_SPEED);
	const ballVyRef = useRef(BALL_INITIAL_SPEED);

	// Player input
	const keysRef = useRef({ up: false, down: false });

	// Particles
	const particlesRef = useRef<Particle[]>([]);

	// Pause-after-score timer
	const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// rAF handle
	const rafRef = useRef<number | null>(null);

	// Canvas dimensions (filled from container)
	const widthRef = useRef(600);
	const heightRef = useRef(400);

	// Load high score
	useEffect(() => {
		const saved = localStorage.getItem("pong-high-score");
		if (saved) setHighScore(Number.parseInt(saved, 10));
	}, []);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
		};
	}, []);

	const resetBall = useCallback((serveDirection: 1 | -1 = 1) => {
		const w = widthRef.current;
		const h = heightRef.current;
		ballXRef.current = w / 2;
		ballYRef.current = h / 2;
		const angle = (Math.random() * Math.PI) / 4 - Math.PI / 8; // -22.5° to +22.5°
		ballVxRef.current = serveDirection * BALL_INITIAL_SPEED * Math.cos(angle);
		ballVyRef.current = BALL_INITIAL_SPEED * Math.sin(angle);
	}, []);

	const initPaddles = useCallback(() => {
		const h = heightRef.current;
		playerYRef.current = h / 2 - PADDLE_HEIGHT / 2;
		aiYRef.current = h / 2 - PADDLE_HEIGHT / 2;
	}, []);

	const spawnParticles = useCallback((x: number, y: number) => {
		const count = 10;
		for (let i = 0; i < count; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = 1.5 + Math.random() * 3;
			particlesRef.current.push({
				x,
				y,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				life: 1,
				color: Math.random() > 0.4 ? LEMON_COLOR : "#f0f0d0",
			});
		}
	}, []);

	const drawLemon = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number) => {
		// Body: slightly oval yellow shape
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(1.15, 1); // slight horizontal squish for lemon shape
		ctx.beginPath();
		ctx.arc(0, 0, BALL_RADIUS, 0, Math.PI * 2);
		ctx.fillStyle = LEMON_COLOR;
		ctx.fill();
		ctx.restore();

		// Highlight
		ctx.beginPath();
		ctx.arc(x - 3, y - 3, 3, 0, Math.PI * 2);
		ctx.fillStyle = "rgba(255,255,220,0.6)";
		ctx.fill();

		// Tiny leaf on top
		ctx.save();
		ctx.translate(x, y - BALL_RADIUS + 1);
		ctx.beginPath();
		ctx.ellipse(1, -4, 3, 5, -0.3, 0, Math.PI * 2);
		ctx.fillStyle = LEMON_LEAF_COLOR;
		ctx.fill();
		ctx.restore();

		// Tiny nub at the bottom tip of the lemon
		ctx.beginPath();
		ctx.arc(x + 9, y, 2, 0, Math.PI * 2);
		ctx.fillStyle = "#c8c030";
		ctx.fill();
	}, []);

	const draw = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const w = widthRef.current;
		const h = heightRef.current;

		// Background
		ctx.fillStyle = BG_COLOR;
		ctx.fillRect(0, 0, w, h);

		// Center dashed line
		ctx.setLineDash([8, 10]);
		ctx.strokeStyle = CENTER_LINE_COLOR;
		ctx.lineWidth = 2;
		ctx.globalAlpha = 0.4;
		ctx.beginPath();
		ctx.moveTo(w / 2, 0);
		ctx.lineTo(w / 2, h);
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.globalAlpha = 1;

		// Scores
		ctx.font = "bold 28px monospace";
		ctx.textAlign = "center";
		ctx.textBaseline = "top";
		ctx.fillStyle = SCORE_COLOR;
		ctx.fillText(String(playerScoreRef.current), w / 2 - 60, 12);
		ctx.fillStyle = DIM_COLOR;
		ctx.fillText(":", w / 2, 12);
		ctx.fillStyle = SCORE_COLOR;
		ctx.fillText(String(aiScoreRef.current), w / 2 + 60, 12);

		// Player paddle (left)
		ctx.fillStyle = PADDLE_COLOR;
		ctx.beginPath();
		ctx.roundRect(12, playerYRef.current, PADDLE_WIDTH, PADDLE_HEIGHT, 3);
		ctx.fill();

		// AI paddle (right)
		ctx.fillStyle = PADDLE_COLOR;
		ctx.beginPath();
		ctx.roundRect(w - 12 - PADDLE_WIDTH, aiYRef.current, PADDLE_WIDTH, PADDLE_HEIGHT, 3);
		ctx.fill();

		// Ball (lemon)
		if (gameStateRef.current !== "waiting") {
			drawLemon(ctx, ballXRef.current, ballYRef.current);
		}

		// Particles
		for (const p of particlesRef.current) {
			ctx.globalAlpha = p.life;
			ctx.beginPath();
			ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
			ctx.fillStyle = p.color;
			ctx.fill();
		}
		ctx.globalAlpha = 1;
	}, [drawLemon]);

	const startGame = useCallback(() => {
		const h = heightRef.current;
		playerYRef.current = h / 2 - PADDLE_HEIGHT / 2;
		aiYRef.current = h / 2 - PADDLE_HEIGHT / 2;
		playerScoreRef.current = 0;
		aiScoreRef.current = 0;
		winnerRef.current = null;
		particlesRef.current = [];
		setPlayerScore(0);
		setAiScore(0);
		setWinner(null);
		resetBall(Math.random() > 0.5 ? 1 : -1);
		gameStateRef.current = "playing";
		setGameState("playing");
	}, [resetBall]);

	// Resize canvas to container
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const resizeObserver = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (!entry) return;
			const { width, height } = entry.contentRect;
			if (width > 0 && height > 0) {
				widthRef.current = width;
				heightRef.current = height;
				const canvas = canvasRef.current;
				if (canvas) {
					canvas.width = width;
					canvas.height = height;
				}
				initPaddles();
				draw();
			}
		});

		resizeObserver.observe(container);
		return () => resizeObserver.disconnect();
	}, [draw, initPaddles]);

	// Main game loop
	useEffect(() => {
		if (gameState !== "playing") {
			draw();
			return;
		}

		const tick = () => {
			if (gameStateRef.current !== "playing") {
				draw();
				return;
			}

			const w = widthRef.current;
			const h = heightRef.current;

			// Move player paddle
			const keys = keysRef.current;
			if (keys.up) {
				playerYRef.current = Math.max(0, playerYRef.current - PADDLE_SPEED);
			}
			if (keys.down) {
				playerYRef.current = Math.min(h - PADDLE_HEIGHT, playerYRef.current + PADDLE_SPEED);
			}

			// AI paddle movement: track ball Y with delay and imperfection
			const ballCenterY = ballYRef.current;
			const aiCenterY = aiYRef.current + PADDLE_HEIGHT / 2;
			const diff = ballCenterY - aiCenterY;

			if (Math.abs(diff) > AI_DEADZONE) {
				const move = diff * AI_TRACK_SPEED * (0.85 + Math.random() * 0.3);
				aiYRef.current = Math.max(0, Math.min(h - PADDLE_HEIGHT, aiYRef.current + move));
			}

			// Move ball
			ballXRef.current += ballVxRef.current;
			ballYRef.current += ballVyRef.current;

			// Top/bottom wall bounce
			if (ballYRef.current - BALL_RADIUS <= 0) {
				ballYRef.current = BALL_RADIUS;
				ballVyRef.current = Math.abs(ballVyRef.current);
			} else if (ballYRef.current + BALL_RADIUS >= h) {
				ballYRef.current = h - BALL_RADIUS;
				ballVyRef.current = -Math.abs(ballVyRef.current);
			}

			// Player paddle (left) collision
			const playerPaddleX = 12 + PADDLE_WIDTH;
			const playerPaddleTop = playerYRef.current;
			const playerPaddleBot = playerYRef.current + PADDLE_HEIGHT;

			if (
				ballXRef.current - BALL_RADIUS <= playerPaddleX &&
				ballXRef.current - BALL_RADIUS >= 12 &&
				ballYRef.current >= playerPaddleTop &&
				ballYRef.current <= playerPaddleBot &&
				ballVxRef.current < 0
			) {
				// Reflect and add angle based on hit position
				const hitPos = (ballYRef.current - playerPaddleTop) / PADDLE_HEIGHT - 0.5; // -0.5 to 0.5
				const speed = Math.min(
					BALL_MAX_SPEED,
					Math.sqrt(ballVxRef.current ** 2 + ballVyRef.current ** 2) + SPEED_INCREASE,
				);
				const angle = hitPos * (Math.PI / 2.5); // max ~72° deflection
				ballVxRef.current = Math.abs(speed * Math.cos(angle));
				ballVyRef.current = speed * Math.sin(angle);
				ballXRef.current = playerPaddleX + 1;
				spawnParticles(playerPaddleX + 4, ballYRef.current);
			}

			// AI paddle (right) collision
			const aiPaddleX = w - 12 - PADDLE_WIDTH;
			const aiPaddleTop = aiYRef.current;
			const aiPaddleBot = aiYRef.current + PADDLE_HEIGHT;

			if (
				ballXRef.current + BALL_RADIUS >= aiPaddleX &&
				ballXRef.current + BALL_RADIUS <= w - 12 &&
				ballYRef.current >= aiPaddleTop &&
				ballYRef.current <= aiPaddleBot &&
				ballVxRef.current > 0
			) {
				const hitPos = (ballYRef.current - aiPaddleTop) / PADDLE_HEIGHT - 0.5;
				const speed = Math.min(
					BALL_MAX_SPEED,
					Math.sqrt(ballVxRef.current ** 2 + ballVyRef.current ** 2) + SPEED_INCREASE,
				);
				const angle = hitPos * (Math.PI / 2.5);
				ballVxRef.current = -Math.abs(speed * Math.cos(angle));
				ballVyRef.current = speed * Math.sin(angle);
				ballXRef.current = aiPaddleX - 1;
				spawnParticles(aiPaddleX - 4, ballYRef.current);
			}

			// Update particles
			particlesRef.current = particlesRef.current
				.map((p) => ({
					...p,
					x: p.x + p.vx,
					y: p.y + p.vy,
					vy: p.vy + 0.08, // gravity
					life: p.life - 0.04,
				}))
				.filter((p) => p.life > 0);

			// Score: ball leaves left side
			if (ballXRef.current + BALL_RADIUS < 0) {
				aiScoreRef.current += 1;
				setAiScore(aiScoreRef.current);
				handleScore("ai");
				return;
			}

			// Score: ball leaves right side
			if (ballXRef.current - BALL_RADIUS > w) {
				playerScoreRef.current += 1;
				setPlayerScore(playerScoreRef.current);
				handleScore("player");
				return;
			}

			draw();
			rafRef.current = requestAnimationFrame(tick);
		};

		const handleScore = (scorer: "player" | "ai") => {
			gameStateRef.current = "paused";
			draw();

			// Check for win
			const ps = playerScoreRef.current;
			const as = aiScoreRef.current;

			if (ps >= WINNING_SCORE || as >= WINNING_SCORE) {
				const w = ps >= WINNING_SCORE ? "player" : "ai";
				winnerRef.current = w;
				setWinner(w);

				// Track win streak for high score (player wins only)
				if (w === "player") {
					currentStreakRef.current += 1;
					const saved = Number.parseInt(localStorage.getItem("pong-high-score") || "0", 10);
					if (currentStreakRef.current > saved) {
						localStorage.setItem("pong-high-score", String(currentStreakRef.current));
						setHighScore(currentStreakRef.current);
					}
				} else {
					currentStreakRef.current = 0;
				}

				gameStateRef.current = "gameover";
				setGameState("gameover");
				return;
			}

			// Brief pause then reset ball, served toward who scored
			pauseTimerRef.current = setTimeout(() => {
				resetBall(scorer === "player" ? -1 : 1);
				gameStateRef.current = "playing";
				rafRef.current = requestAnimationFrame(tick);
			}, 800);
		};

		draw();
		rafRef.current = requestAnimationFrame(tick);

		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
		};
	}, [gameState, draw, spawnParticles, resetBall]);

	// Keyboard controls
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				onExit();
				return;
			}

			if (gameStateRef.current === "waiting") {
				e.preventDefault();
				startGame();
				return;
			}

			if (gameStateRef.current === "gameover") {
				e.preventDefault();
				startGame();
				return;
			}

			switch (e.key) {
				case "ArrowUp":
				case "w":
				case "W":
					e.preventDefault();
					keysRef.current.up = true;
					break;
				case "ArrowDown":
				case "s":
				case "S":
					e.preventDefault();
					keysRef.current.down = true;
					break;
			}
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			switch (e.key) {
				case "ArrowUp":
				case "w":
				case "W":
					keysRef.current.up = false;
					break;
				case "ArrowDown":
				case "s":
				case "S":
					keysRef.current.down = false;
					break;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, [startGame, onExit]);

	// Draw initial state when canvas is ready
	useEffect(() => {
		draw();
	}, [draw]);

	return (
		<div className="flex flex-col items-center gap-2 p-4 h-full">
			<div className="flex w-full max-w-3xl items-center justify-between font-pixel text-[9px]">
				<span className="text-c64-text">
					PLAYER <span className="text-c64-green">◀</span>
				</span>
				<span className="text-c64-muted">
					WIN STREAK: <span className="text-c64-yellow">{highScore}</span>
				</span>
				<span className="text-c64-text">
					<span className="text-c64-green">▶</span> AI
				</span>
			</div>

			<div
				ref={containerRef}
				className="relative w-full max-w-3xl flex-1 min-h-[300px] border-2 border-c64-dim"
				style={{ minHeight: 300 }}
			>
				<canvas
					ref={canvasRef}
					className="block w-full h-full"
					style={{ imageRendering: "pixelated" }}
				/>

				{gameState === "waiting" && (
					<div className="absolute inset-0 flex flex-col items-center justify-center bg-c64-black/80">
						<p className="font-pixel text-xs text-c64-yellow">LEMON PONG</p>
						<p className="mt-4 font-pixel text-[8px] text-c64-text">ARROWS / W·S TO MOVE</p>
						<p className="mt-1 font-pixel text-[8px] text-c64-text">
							FIRST TO {WINNING_SCORE} WINS
						</p>
						<p className="mt-5 font-pixel text-[8px] text-c64-green cursor-blink">
							PRESS ANY KEY TO START
						</p>
					</div>
				)}

				{gameState === "gameover" && (
					<div className="absolute inset-0 flex flex-col items-center justify-center bg-c64-black/80">
						{winner === "player" ? (
							<>
								<p className="font-pixel text-xs text-c64-yellow">YOU WIN!</p>
								<p className="mt-2 font-pixel text-[8px] text-c64-lime">
									{playerScore} — {aiScore}
								</p>
							</>
						) : (
							<>
								<p className="font-pixel text-xs text-c64-red">AI WINS</p>
								<p className="mt-2 font-pixel text-[8px] text-c64-muted">
									{playerScore} — {aiScore}
								</p>
							</>
						)}
						<p className="mt-1 font-pixel text-[8px] text-c64-text">
							WIN STREAK: <span className="text-c64-yellow">{highScore}</span>
						</p>
						<p className="mt-5 font-pixel text-[8px] text-c64-green cursor-blink">
							PRESS ANY KEY TO RETRY
						</p>
					</div>
				)}
			</div>

			<p className="font-pixel text-[8px] text-c64-muted">ESC TO QUIT</p>
		</div>
	);
}
