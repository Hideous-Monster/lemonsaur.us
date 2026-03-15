"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Grid dimensions
const GRID_COLS = 10;
const GRID_ROWS = 20;
const CELL_SIZE = 24;

// Preview panel dimensions
const PREVIEW_COLS = 4;
const PREVIEW_ROWS = 4;

// Speed settings (ms per drop)
const INITIAL_SPEED = 700;
const SPEED_DECREMENT = 75;
const MIN_SPEED = 80;
const LINES_PER_LEVEL = 8;

// Colors
const BG_COLOR = "#0a140a";
const GRID_COLOR = "#1a2e1a";
const BORDER_COLOR = "#40b848";
const GHOST_ALPHA = 0.25;

type GameState = "waiting" | "playing" | "gameover";
type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L" | "LEMON";

const PIECE_COLORS: Record<TetrominoType, string> = {
	I: "#70d0b0",
	O: "#e8e040",
	T: "#b860d0",
	S: "#40b848",
	Z: "#ff5050",
	J: "#5050ff",
	L: "#ff9040",
	LEMON: "#e8e040",
};

const LEMON_CHANCE = 0.12;

// SRS tetromino shapes — each piece has 4 rotation states
// Coordinates are [row, col] offsets from the top-left of the bounding box
const TETROMINOES: Record<TetrominoType, number[][][]> = {
	I: [
		[
			[0, 0],
			[0, 1],
			[0, 2],
			[0, 3],
		],
		[
			[0, 2],
			[1, 2],
			[2, 2],
			[3, 2],
		],
		[
			[2, 0],
			[2, 1],
			[2, 2],
			[2, 3],
		],
		[
			[0, 1],
			[1, 1],
			[2, 1],
			[3, 1],
		],
	],
	O: [
		[
			[0, 0],
			[0, 1],
			[1, 0],
			[1, 1],
		],
		[
			[0, 0],
			[0, 1],
			[1, 0],
			[1, 1],
		],
		[
			[0, 0],
			[0, 1],
			[1, 0],
			[1, 1],
		],
		[
			[0, 0],
			[0, 1],
			[1, 0],
			[1, 1],
		],
	],
	T: [
		[
			[0, 1],
			[1, 0],
			[1, 1],
			[1, 2],
		],
		[
			[0, 0],
			[1, 0],
			[1, 1],
			[2, 0],
		],
		[
			[0, 0],
			[0, 1],
			[0, 2],
			[1, 1],
		],
		[
			[0, 1],
			[1, 0],
			[1, 1],
			[2, 1],
		],
	],
	S: [
		[
			[0, 1],
			[0, 2],
			[1, 0],
			[1, 1],
		],
		[
			[0, 0],
			[1, 0],
			[1, 1],
			[2, 1],
		],
		[
			[1, 1],
			[1, 2],
			[2, 0],
			[2, 1],
		],
		[
			[0, 1],
			[1, 1],
			[1, 2],
			[2, 2],
		],
	],
	Z: [
		[
			[0, 0],
			[0, 1],
			[1, 1],
			[1, 2],
		],
		[
			[0, 1],
			[1, 0],
			[1, 1],
			[2, 0],
		],
		[
			[1, 0],
			[1, 1],
			[2, 1],
			[2, 2],
		],
		[
			[0, 2],
			[1, 1],
			[1, 2],
			[2, 1],
		],
	],
	J: [
		[
			[0, 0],
			[1, 0],
			[1, 1],
			[1, 2],
		],
		[
			[0, 0],
			[0, 1],
			[1, 0],
			[2, 0],
		],
		[
			[0, 0],
			[0, 1],
			[0, 2],
			[1, 2],
		],
		[
			[0, 1],
			[1, 1],
			[2, 0],
			[2, 1],
		],
	],
	L: [
		[
			[0, 2],
			[1, 0],
			[1, 1],
			[1, 2],
		],
		[
			[0, 0],
			[1, 0],
			[2, 0],
			[2, 1],
		],
		[
			[0, 0],
			[0, 1],
			[0, 2],
			[1, 0],
		],
		[
			[0, 0],
			[0, 1],
			[1, 1],
			[2, 1],
		],
	],
	LEMON: [[[0, 0]], [[0, 0]], [[0, 0]], [[0, 0]]],
};

const PIECE_TYPES: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"];

type Cell = { type: TetrominoType } | null;
type Board = Cell[][];

interface ActivePiece {
	type: TetrominoType;
	rotation: number;
	row: number;
	col: number;
}

function emptyBoard(): Board {
	return Array.from({ length: GRID_ROWS }, () => Array<Cell>(GRID_COLS).fill(null));
}

function randomPiece(): TetrominoType {
	if (Math.random() < LEMON_CHANCE) return "LEMON";
	return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)]!;
}

function getCells(piece: ActivePiece): Array<[number, number]> {
	const shape = TETROMINOES[piece.type][piece.rotation]!;
	return shape.map(([dr, dc]) => [piece.row + dr!, piece.col + dc!]);
}

function isValid(board: Board, piece: ActivePiece): boolean {
	for (const [r, c] of getCells(piece)) {
		if (c < 0 || c >= GRID_COLS || r >= GRID_ROWS) return false;
		if (r < 0) continue; // allow above top
		if (board[r]?.[c] !== null) return false;
	}
	return true;
}

function placePiece(board: Board, piece: ActivePiece): Board {
	const newBoard = board.map((row) => [...row]);
	for (const [r, c] of getCells(piece)) {
		if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
			newBoard[r]![c] = { type: piece.type };
		}
	}
	return newBoard;
}

function clearLines(board: Board): { board: Board; cleared: number } {
	const remaining = board.filter((row) => row.some((cell) => cell === null));
	const cleared = GRID_ROWS - remaining.length;
	const newRows: Board = Array.from({ length: cleared }, () => Array<Cell>(GRID_COLS).fill(null));
	return { board: [...newRows, ...remaining], cleared };
}

function ghostRow(board: Board, piece: ActivePiece): number {
	let testPiece = { ...piece };
	while (isValid(board, { ...testPiece, row: testPiece.row + 1 })) {
		testPiece = { ...testPiece, row: testPiece.row + 1 };
	}
	return testPiece.row;
}

function spawnPiece(type: TetrominoType): ActivePiece {
	// Spawn near top center
	return { type, rotation: 0, row: 0, col: Math.floor((GRID_COLS - 4) / 2) };
}

function calcScore(cleared: number, level: number): number {
	const base = [0, 100, 300, 500, 800];
	return (base[cleared] ?? 0) * (level + 1);
}

// Wall kick offsets for SRS (non-I pieces)
const WALL_KICKS: [number, number][] = [
	[0, 0],
	[0, -1],
	[0, 1],
	[-1, 0],
	[1, 0],
];

function tryRotate(board: Board, piece: ActivePiece, dir: 1 | -1): ActivePiece | null {
	const nextRotation = ((piece.rotation + dir + 4) % 4) as 0 | 1 | 2 | 3;
	const rotated = { ...piece, rotation: nextRotation };
	for (const [dr, dc] of WALL_KICKS) {
		const kicked = { ...rotated, row: rotated.row + dr, col: rotated.col + dc };
		if (isValid(board, kicked)) return kicked;
	}
	return null;
}

interface TetrisGameProps {
	onExit: () => void;
}

export function TetrisGame({ onExit }: TetrisGameProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const previewRef = useRef<HTMLCanvasElement>(null);
	const [gameState, setGameState] = useState<GameState>("waiting");
	const [score, setScore] = useState(0);
	const [level, setLevel] = useState(0);
	const [lines, setLines] = useState(0);
	const [highScore, setHighScore] = useState(0);

	// Game state held in refs to avoid stale closure issues in the game loop
	const boardRef = useRef<Board>(emptyBoard());
	const activePieceRef = useRef<ActivePiece | null>(null);
	const nextPieceRef = useRef<TetrominoType>(randomPiece());
	const scoreRef = useRef(0);
	const levelRef = useRef(0);
	const linesRef = useRef(0);
	const speedRef = useRef(INITIAL_SPEED);
	const gameStateRef = useRef<GameState>("waiting");
	const flashRowsRef = useRef<Set<number>>(new Set());
	const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const softDropRef = useRef(false);

	useEffect(() => {
		const saved = localStorage.getItem("tetris-high-score");
		if (saved) setHighScore(Number.parseInt(saved, 10));
	}, []);

	useEffect(() => {
		return () => {
			if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
		};
	}, []);

	const drawCell = useCallback(
		(
			ctx: CanvasRenderingContext2D,
			row: number,
			col: number,
			color: string,
			alpha = 1,
			offsetX = 0,
			offsetY = 0,
			isLemon = false,
		) => {
			const x = offsetX + col * CELL_SIZE;
			const y = offsetY + row * CELL_SIZE;
			ctx.globalAlpha = alpha;

			if (isLemon) {
				// Draw lemon as a yellow oval with green leaf
				const cx = x + CELL_SIZE / 2;
				const cy = y + CELL_SIZE / 2;
				const rx = CELL_SIZE / 2 - 2;
				const ry = CELL_SIZE / 2 - 3;
				ctx.fillStyle = color;
				ctx.beginPath();
				ctx.ellipse(cx, cy + 1, rx, ry, 0, 0, Math.PI * 2);
				ctx.fill();
				// Highlight
				ctx.fillStyle = "rgba(255,255,255,0.3)";
				ctx.beginPath();
				ctx.ellipse(cx - 2, cy - 1, rx * 0.4, ry * 0.4, 0, 0, Math.PI * 2);
				ctx.fill();
				// Leaf
				ctx.fillStyle = "#40b848";
				ctx.beginPath();
				ctx.ellipse(cx + 1, y + 3, 4, 2, 0.3, 0, Math.PI * 2);
				ctx.fill();
			} else {
				ctx.fillStyle = color;
				ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
				// Highlight bevel
				ctx.fillStyle = "rgba(255,255,255,0.15)";
				ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, 3);
				ctx.fillRect(x + 1, y + 1, 3, CELL_SIZE - 2);
			}

			ctx.globalAlpha = 1;
		},
		[],
	);

	const drawPreview = useCallback(
		(type: TetrominoType) => {
			const canvas = previewRef.current;
			if (!canvas) return;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			const w = PREVIEW_COLS * CELL_SIZE;
			const h = PREVIEW_ROWS * CELL_SIZE;

			ctx.fillStyle = BG_COLOR;
			ctx.fillRect(0, 0, w, h);

			const shape = TETROMINOES[type][0]!;
			const color = PIECE_COLORS[type];

			// Center piece in preview
			const minR = Math.min(...shape.map(([r]) => r!));
			const maxR = Math.max(...shape.map(([r]) => r!));
			const minC = Math.min(...shape.map(([, c]) => c!));
			const maxC = Math.max(...shape.map(([, c]) => c!));
			const pieceH = maxR - minR + 1;
			const pieceW = maxC - minC + 1;
			const startRow = Math.floor((PREVIEW_ROWS - pieceH) / 2) - minR;
			const startCol = Math.floor((PREVIEW_COLS - pieceW) / 2) - minC;

			for (const [dr, dc] of shape) {
				drawCell(ctx, startRow + dr!, startCol + dc!, color, 1, 0, 0, type === "LEMON");
			}
		},
		[drawCell],
	);

	const draw = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const width = GRID_COLS * CELL_SIZE;
		const height = GRID_ROWS * CELL_SIZE;

		// Background
		ctx.fillStyle = BG_COLOR;
		ctx.fillRect(0, 0, width, height);

		// Grid lines
		ctx.strokeStyle = GRID_COLOR;
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

		// Board cells
		const board = boardRef.current;
		const flash = flashRowsRef.current;
		for (let r = 0; r < GRID_ROWS; r++) {
			for (let c = 0; c < GRID_COLS; c++) {
				const cell = board[r]?.[c];
				if (cell) {
					if (flash.has(r)) {
						drawCell(ctx, r, c, "#ffffff");
					} else {
						drawCell(ctx, r, c, PIECE_COLORS[cell.type], 1, 0, 0, cell.type === "LEMON");
					}
				}
			}
		}

		// Ghost piece
		const active = activePieceRef.current;
		if (active && gameStateRef.current === "playing") {
			const ghostR = ghostRow(board, active);
			if (ghostR !== active.row) {
				const ghostPiece = { ...active, row: ghostR };
				for (const [r, c] of getCells(ghostPiece)) {
					if (r >= 0) {
						drawCell(
							ctx,
							r,
							c,
							PIECE_COLORS[active.type],
							GHOST_ALPHA,
							0,
							0,
							active.type === "LEMON",
						);
					}
				}
			}

			// Active piece
			for (const [r, c] of getCells(active)) {
				if (r >= 0) {
					drawCell(ctx, r, c, PIECE_COLORS[active.type], 1, 0, 0, active.type === "LEMON");
				}
			}
		}

		// Draw preview
		drawPreview(nextPieceRef.current);
	}, [drawCell, drawPreview]);

	const lockPiece = useCallback(() => {
		const piece = activePieceRef.current;
		if (!piece) return;

		const newBoard = placePiece(boardRef.current, piece);
		const { board: clearedBoard, cleared } = clearLines(newBoard);

		if (cleared > 0) {
			const clearedRows = new Set<number>();
			for (let r = 0; r < GRID_ROWS; r++) {
				if (newBoard[r]?.every((cell) => cell !== null)) clearedRows.add(r);
			}

			// Blink animation: flash on/off 3 times then clear
			boardRef.current = newBoard;
			let blinkCount = 0;
			const totalBlinks = 6; // 3 on + 3 off
			const blinkInterval = setInterval(() => {
				flashRowsRef.current = blinkCount % 2 === 0 ? clearedRows : new Set();
				draw();
				blinkCount++;
				if (blinkCount >= totalBlinks) {
					clearInterval(blinkInterval);
				}
			}, 80);

			flashRowsRef.current = clearedRows;
			draw();

			flashTimerRef.current = setTimeout(() => {
				flashRowsRef.current = new Set();
				boardRef.current = clearedBoard;

				const newLines = linesRef.current + cleared;
				const newLevel = Math.floor(newLines / LINES_PER_LEVEL);
				const points = calcScore(cleared, levelRef.current);
				const newScore = scoreRef.current + points;

				linesRef.current = newLines;
				levelRef.current = newLevel;
				scoreRef.current = newScore;
				speedRef.current = Math.max(MIN_SPEED, INITIAL_SPEED - newLevel * SPEED_DECREMENT);

				setLines(newLines);
				setLevel(newLevel);
				setScore(newScore);

				if (newScore > Number.parseInt(localStorage.getItem("tetris-high-score") ?? "0", 10)) {
					localStorage.setItem("tetris-high-score", String(newScore));
					setHighScore(newScore);
				}

				// Spawn next piece
				const next = nextPieceRef.current;
				const spawned = spawnPiece(next);
				nextPieceRef.current = randomPiece();

				if (!isValid(boardRef.current, spawned)) {
					// Game over
					activePieceRef.current = null;
					setGameState("gameover");
					gameStateRef.current = "gameover";
					draw();
					return;
				}

				activePieceRef.current = spawned;
				draw();
			}, 150);
		} else {
			boardRef.current = clearedBoard;

			// Spawn next piece
			const next = nextPieceRef.current;
			const spawned = spawnPiece(next);
			nextPieceRef.current = randomPiece();

			if (!isValid(boardRef.current, spawned)) {
				activePieceRef.current = null;
				setGameState("gameover");
				gameStateRef.current = "gameover";
				draw();
				return;
			}

			activePieceRef.current = spawned;
			draw();
		}
	}, [draw]);

	const resetGame = useCallback(() => {
		if (flashTimerRef.current) {
			clearTimeout(flashTimerRef.current);
			flashTimerRef.current = null;
		}
		flashRowsRef.current = new Set();
		boardRef.current = emptyBoard();

		const firstType = randomPiece();
		nextPieceRef.current = randomPiece();
		activePieceRef.current = spawnPiece(firstType);

		scoreRef.current = 0;
		levelRef.current = 0;
		linesRef.current = 0;
		speedRef.current = INITIAL_SPEED;
		softDropRef.current = false;

		setScore(0);
		setLevel(0);
		setLines(0);
		setGameState("playing");
		gameStateRef.current = "playing";
	}, []);

	// Game loop — ticks on a timer, drops piece one row at a time
	useEffect(() => {
		if (gameState !== "playing") return;

		let timeoutId: ReturnType<typeof setTimeout>;

		const tick = () => {
			if (gameStateRef.current !== "playing") return;
			if (flashRowsRef.current.size > 0) {
				// Pause drop while flash is active; reschedule
				timeoutId = setTimeout(tick, 50);
				return;
			}

			const piece = activePieceRef.current;
			if (!piece) return;

			const moved = { ...piece, row: piece.row + 1 };
			if (isValid(boardRef.current, moved)) {
				activePieceRef.current = moved;
				draw();
			} else {
				lockPiece();
			}

			if (gameStateRef.current === "playing") {
				const delay = softDropRef.current ? Math.max(50, speedRef.current / 8) : speedRef.current;
				timeoutId = setTimeout(tick, delay);
			}
		};

		draw();
		timeoutId = setTimeout(tick, speedRef.current);

		return () => clearTimeout(timeoutId);
	}, [gameState, draw, lockPiece]);

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
			if (flashRowsRef.current.size > 0) return; // ignore input during flash

			const piece = activePieceRef.current;
			if (!piece) return;

			switch (e.key) {
				case "ArrowLeft": {
					e.preventDefault();
					const left = { ...piece, col: piece.col - 1 };
					if (isValid(boardRef.current, left)) {
						activePieceRef.current = left;
						draw();
					}
					break;
				}
				case "ArrowRight": {
					e.preventDefault();
					const right = { ...piece, col: piece.col + 1 };
					if (isValid(boardRef.current, right)) {
						activePieceRef.current = right;
						draw();
					}
					break;
				}
				case "ArrowUp": {
					e.preventDefault();
					const rotated = tryRotate(boardRef.current, piece, 1);
					if (rotated) {
						activePieceRef.current = rotated;
						draw();
					}
					break;
				}
				case "ArrowDown": {
					e.preventDefault();
					softDropRef.current = true;
					break;
				}
				case " ": {
					e.preventDefault();
					// Hard drop
					const gr = ghostRow(boardRef.current, piece);
					activePieceRef.current = { ...piece, row: gr };
					draw();
					lockPiece();
					break;
				}
			}
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.key === "ArrowDown") {
				softDropRef.current = false;
			}
		};

		window.addEventListener("keydown", handleKey);
		window.addEventListener("keyup", handleKeyUp);
		return () => {
			window.removeEventListener("keydown", handleKey);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, [resetGame, onExit, draw, lockPiece]);

	// Draw initial waiting state
	useEffect(() => {
		draw();
	}, [draw]);

	const canvasWidth = GRID_COLS * CELL_SIZE;
	const canvasHeight = GRID_ROWS * CELL_SIZE;
	const previewWidth = PREVIEW_COLS * CELL_SIZE;
	const previewHeight = PREVIEW_ROWS * CELL_SIZE;

	return (
		<div className="flex flex-col items-center gap-3 p-4">
			<div
				className="flex items-start gap-4"
				style={{ width: canvasWidth + previewWidth + 16 + 32 }}
			>
				{/* Main board */}
				<div className="relative" style={{ border: `2px solid ${BORDER_COLOR}` }}>
					<canvas
						ref={canvasRef}
						width={canvasWidth}
						height={canvasHeight}
						className="block"
						style={{ imageRendering: "pixelated" }}
					/>

					{gameState === "waiting" && (
						<div className="absolute inset-0 flex flex-col items-center justify-center bg-c64-black/80">
							<p className="font-pixel text-xs text-c64-yellow">TETRIS</p>
							<p className="mt-3 font-pixel text-[8px] text-c64-text">ARROWS TO MOVE</p>
							<p className="mt-1 font-pixel text-[8px] text-c64-text">UP TO ROTATE</p>
							<p className="mt-1 font-pixel text-[8px] text-c64-text">SPACE FOR HARD DROP</p>
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

				{/* Side panel */}
				<div className="flex flex-col gap-3 pt-1">
					{/* Stats */}
					<div className="flex flex-col gap-1 font-pixel text-[9px]">
						<p className="text-c64-muted">SCORE</p>
						<p className="text-c64-yellow">{score}</p>
						<p className="mt-1 text-c64-muted">BEST</p>
						<p className="text-c64-green">{highScore}</p>
						<p className="mt-1 text-c64-muted">LEVEL</p>
						<p className="text-c64-text">{level + 1}</p>
						<p className="mt-1 text-c64-muted">LINES</p>
						<p className="text-c64-text">{lines}</p>
					</div>

					{/* Next piece preview */}
					<div className="flex flex-col gap-1">
						<p className="font-pixel text-[9px] text-c64-muted">NEXT</p>
						<div style={{ border: `1px solid ${BORDER_COLOR}` }}>
							<canvas
								ref={previewRef}
								width={previewWidth}
								height={previewHeight}
								className="block"
								style={{ imageRendering: "pixelated" }}
							/>
						</div>
					</div>
				</div>
			</div>

			<p className="font-pixel text-[8px] text-c64-muted">ESC TO QUIT</p>
		</div>
	);
}
