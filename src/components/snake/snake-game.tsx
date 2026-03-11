"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };

const GRID_COLS = 30;
const GRID_ROWS = 18;
const CELL_SIZE = 24;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 3;
const MIN_SPEED = 60;

type GameState = "waiting" | "playing" | "gameover";

function randomPosition(exclude: Position[]): Position {
	let pos: Position;
	do {
		pos = {
			x: Math.floor(Math.random() * GRID_COLS),
			y: Math.floor(Math.random() * GRID_ROWS),
		};
	} while (exclude.some((p) => p.x === pos.x && p.y === pos.y));
	return pos;
}

interface SnakeGameProps {
	onExit: () => void;
}

export function SnakeGame({ onExit }: SnakeGameProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [gameState, setGameState] = useState<GameState>("waiting");
	const [score, setScore] = useState(0);
	const [highScore, setHighScore] = useState(0);

	const snakeRef = useRef<Position[]>([{ x: 15, y: 9 }]);
	const directionRef = useRef<Direction>("RIGHT");
	const nextDirectionRef = useRef<Direction>("RIGHT");
	const lemonRef = useRef<Position>({ x: 20, y: 9 });
	const scoreRef = useRef(0);
	const gameStateRef = useRef<GameState>("waiting");
	const speedRef = useRef(INITIAL_SPEED);

	useEffect(() => {
		const saved = localStorage.getItem("snake-highscore");
		if (saved) setHighScore(Number.parseInt(saved, 10));
	}, []);

	const resetGame = useCallback(() => {
		const start: Position[] = [{ x: 15, y: 9 }];
		snakeRef.current = start;
		directionRef.current = "RIGHT";
		nextDirectionRef.current = "RIGHT";
		lemonRef.current = randomPosition(start);
		scoreRef.current = 0;
		speedRef.current = INITIAL_SPEED;
		setScore(0);
		setGameState("playing");
		gameStateRef.current = "playing";
	}, []);

	const draw = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const width = GRID_COLS * CELL_SIZE;
		const height = GRID_ROWS * CELL_SIZE;

		// Background (C64 body green)
		ctx.fillStyle = "#223a22";
		ctx.fillRect(0, 0, width, height);

		// Grid lines (subtle)
		ctx.strokeStyle = "#284028";
		ctx.lineWidth = 0.5;
		for (let i = 0; i <= GRID_COLS; i++) {
			ctx.beginPath();
			ctx.moveTo(i * CELL_SIZE, 0);
			ctx.lineTo(i * CELL_SIZE, height);
			ctx.stroke();
		}
		for (let i = 0; i <= GRID_ROWS; i++) {
			ctx.beginPath();
			ctx.moveTo(0, i * CELL_SIZE);
			ctx.lineTo(width, i * CELL_SIZE);
			ctx.stroke();
		}

		// Snake
		const snake = snakeRef.current;
		for (let i = 0; i < snake.length; i++) {
			const seg = snake[i]!;
			const isHead = i === 0;
			ctx.fillStyle = isHead ? "#e8e040" : "#40b848";
			ctx.fillRect(seg.x * CELL_SIZE + 1, seg.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
			if (isHead) {
				ctx.fillStyle = "#f0f0d0";
				ctx.fillRect(seg.x * CELL_SIZE + 3, seg.y * CELL_SIZE + 3, 4, 4);
			}
		}

		// Lemon emoji
		const lemon = lemonRef.current;
		ctx.font = `${CELL_SIZE - 2}px serif`;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(
			"\u{1F34B}",
			lemon.x * CELL_SIZE + CELL_SIZE / 2,
			lemon.y * CELL_SIZE + CELL_SIZE / 2 + 1,
		);
	}, []);

	// Game loop
	useEffect(() => {
		if (gameState !== "playing") return;

		let timeoutId: ReturnType<typeof setTimeout>;

		const tick = () => {
			if (gameStateRef.current !== "playing") return;

			directionRef.current = nextDirectionRef.current;

			const snake = snakeRef.current;
			const head = snake[0]!;
			const dir = directionRef.current;

			const newHead: Position = {
				x: head.x + (dir === "LEFT" ? -1 : dir === "RIGHT" ? 1 : 0),
				y: head.y + (dir === "UP" ? -1 : dir === "DOWN" ? 1 : 0),
			};

			// Wall collision
			if (newHead.x < 0 || newHead.x >= GRID_COLS || newHead.y < 0 || newHead.y >= GRID_ROWS) {
				setGameState("gameover");
				gameStateRef.current = "gameover";
				draw();
				return;
			}

			// Self collision
			if (snake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
				setGameState("gameover");
				gameStateRef.current = "gameover";
				draw();
				return;
			}

			const newSnake = [newHead, ...snake];

			// Eat lemon?
			if (newHead.x === lemonRef.current.x && newHead.y === lemonRef.current.y) {
				scoreRef.current += 10;
				setScore(scoreRef.current);
				speedRef.current = Math.max(MIN_SPEED, speedRef.current - SPEED_INCREMENT);

				if (
					scoreRef.current > Number.parseInt(localStorage.getItem("snake-highscore") || "0", 10)
				) {
					localStorage.setItem("snake-highscore", String(scoreRef.current));
					setHighScore(scoreRef.current);
				}

				lemonRef.current = randomPosition(newSnake);
			} else {
				newSnake.pop();
			}

			snakeRef.current = newSnake;
			draw();

			timeoutId = setTimeout(tick, speedRef.current);
		};

		draw();
		timeoutId = setTimeout(tick, speedRef.current);

		return () => clearTimeout(timeoutId);
	}, [gameState, draw]);

	// Keyboard controls
	useEffect(() => {
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				onExit();
				return;
			}

			if (gameStateRef.current === "waiting") {
				if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Enter"].includes(e.key)) {
					e.preventDefault();
					resetGame();
					return;
				}
			}

			if (gameStateRef.current === "gameover") {
				if (e.key === " " || e.key === "Enter") {
					e.preventDefault();
					resetGame();
					return;
				}
			}

			if (gameStateRef.current !== "playing") return;

			const current = directionRef.current;
			switch (e.key) {
				case "ArrowUp":
				case "w":
				case "W":
					e.preventDefault();
					if (current !== "DOWN") nextDirectionRef.current = "UP";
					break;
				case "ArrowDown":
				case "s":
				case "S":
					e.preventDefault();
					if (current !== "UP") nextDirectionRef.current = "DOWN";
					break;
				case "ArrowLeft":
				case "a":
				case "A":
					e.preventDefault();
					if (current !== "RIGHT") nextDirectionRef.current = "LEFT";
					break;
				case "ArrowRight":
				case "d":
				case "D":
					e.preventDefault();
					if (current !== "LEFT") nextDirectionRef.current = "RIGHT";
					break;
			}
		};

		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [resetGame, onExit]);

	// Touch controls
	useEffect(() => {
		let touchStartX = 0;
		let touchStartY = 0;

		const handleTouchStart = (e: TouchEvent) => {
			const touch = e.touches[0];
			if (!touch) return;
			touchStartX = touch.clientX;
			touchStartY = touch.clientY;
		};

		const handleTouchEnd = (e: TouchEvent) => {
			const touch = e.changedTouches[0];
			if (!touch) return;

			if (gameStateRef.current === "waiting" || gameStateRef.current === "gameover") {
				resetGame();
				return;
			}

			const dx = touch.clientX - touchStartX;
			const dy = touch.clientY - touchStartY;
			const absDx = Math.abs(dx);
			const absDy = Math.abs(dy);

			if (Math.max(absDx, absDy) < 20) return;

			const current = directionRef.current;
			if (absDx > absDy) {
				if (dx > 0 && current !== "LEFT") nextDirectionRef.current = "RIGHT";
				else if (dx < 0 && current !== "RIGHT") nextDirectionRef.current = "LEFT";
			} else {
				if (dy > 0 && current !== "UP") nextDirectionRef.current = "DOWN";
				else if (dy < 0 && current !== "DOWN") nextDirectionRef.current = "UP";
			}
		};

		window.addEventListener("touchstart", handleTouchStart, { passive: true });
		window.addEventListener("touchend", handleTouchEnd, { passive: true });
		return () => {
			window.removeEventListener("touchstart", handleTouchStart);
			window.removeEventListener("touchend", handleTouchEnd);
		};
	}, [resetGame]);

	// Draw initial state
	useEffect(() => {
		draw();
	}, [draw]);

	const canvasWidth = GRID_COLS * CELL_SIZE;
	const canvasHeight = GRID_ROWS * CELL_SIZE;

	return (
		<div className="flex flex-col items-center gap-3 p-4">
			<div className="flex w-full max-w-[720px] items-center justify-between font-pixel text-[10px]">
				<span className="text-c64-text">
					SCORE: <span className="text-c64-yellow">{score}</span>
				</span>
				<span className="text-c64-muted">
					HI: <span className="text-c64-green">{highScore}</span>
				</span>
			</div>

			<div className="relative border-2 border-c64-dim">
				<canvas
					ref={canvasRef}
					width={canvasWidth}
					height={canvasHeight}
					className="block"
					style={{ imageRendering: "pixelated" }}
				/>

				{gameState === "waiting" && (
					<div className="absolute inset-0 flex flex-col items-center justify-center bg-c64-black/80">
						<p className="font-pixel text-xs text-c64-yellow">LEMON SNAKE</p>
						<p className="mt-3 font-pixel text-[8px] text-c64-text">ARROWS / WASD TO MOVE</p>
						<p className="mt-1 font-pixel text-[8px] text-c64-text">SWIPE ON MOBILE</p>
						<p className="mt-4 font-pixel text-[8px] text-c64-green cursor-blink">
							PRESS ANY KEY TO START
						</p>
					</div>
				)}

				{gameState === "gameover" && (
					<div className="absolute inset-0 flex flex-col items-center justify-center bg-c64-black/80">
						<p className="font-pixel text-xs text-c64-red">GAME OVER</p>
						<p className="mt-2 font-pixel text-[10px] text-c64-yellow">SCORE: {score}</p>
						{score >= highScore && score > 0 && (
							<p className="mt-1 font-pixel text-[8px] text-c64-lime">NEW HIGH SCORE!</p>
						)}
						<p className="mt-4 font-pixel text-[8px] text-c64-green cursor-blink">
							PRESS SPACE TO RETRY
						</p>
					</div>
				)}
			</div>

			<p className="font-pixel text-[8px] text-c64-muted">ESC TO QUIT</p>
		</div>
	);
}
