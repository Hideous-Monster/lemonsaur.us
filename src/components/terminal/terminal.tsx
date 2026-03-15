"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { PongGame } from "@/components/pong/pong-game";
import { SnakeGame } from "@/components/snake/snake-game";
import { DoomSim } from "@/components/terminal/doom-sim";
import { HackerSim } from "@/components/terminal/hacker-sim";
import { MatrixRain } from "@/components/terminal/matrix-rain";
import { TetrisGame } from "@/components/tetris/tetris-game";
import {
	BOOT_LINES,
	COMMAND_NAMES,
	executeCommand,
	LOGO_LINES,
	makeBootLine,
	type TerminalLine,
} from "./commands";
import { tabComplete } from "./filesystem";

// ROYGBIV
const RAINBOW = [
	[255, 80, 80], // Red
	[255, 160, 50], // Orange
	[255, 255, 80], // Yellow
	[80, 230, 80], // Green
	[80, 160, 255], // Blue
	[160, 100, 255], // Indigo
	[220, 100, 255], // Violet
] as const;

function rainbowLine(text: string): string {
	const len = text.length;
	return [...text]
		.map((ch, i) => {
			if (ch === " ") return " ";
			return `<span style="color:${rainbowChar(i, len)}">${ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : ch === "&" ? "&amp;" : ch}</span>`;
		})
		.join("");
}

function rainbowChar(index: number, total: number): string {
	const t = total <= 1 ? 0 : index / (total - 1);
	const pos = t * (RAINBOW.length - 1);
	const lo = Math.floor(pos);
	const hi = Math.min(lo + 1, RAINBOW.length - 1);
	const frac = pos - lo;
	const r = Math.round(RAINBOW[lo]![0] + (RAINBOW[hi]![0] - RAINBOW[lo]![0]) * frac);
	const g = Math.round(RAINBOW[lo]![1] + (RAINBOW[hi]![1] - RAINBOW[lo]![1]) * frac);
	const b = Math.round(RAINBOW[lo]![2] + (RAINBOW[hi]![2] - RAINBOW[lo]![2]) * frac);
	return `rgb(${r},${g},${b})`;
}

type TerminalMode =
	| "terminal"
	| "snake"
	| "matrix"
	| "hack"
	| "doom"
	| "tetris"
	| "pong"
	| "destroyed";

interface TerminalProps {
	onUpgrade?: () => void;
}

export function Terminal({ onUpgrade }: TerminalProps = {}) {
	const [lines, setLines] = useState<TerminalLine[]>([]);
	const [input, setInput] = useState("");
	const [booting, setBooting] = useState(true);
	const [bootIndex, setBootIndex] = useState(0);
	const [mode, setMode] = useState<TerminalMode>("terminal");
	const [history, setHistory] = useState<string[]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [showVitals, setShowVitals] = useState(false);
	const [vitals, setVitals] = useState({ bpm: 89, sys: 112, dia: 72 });
	const inputRef = useRef<HTMLInputElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const pendingPrompt = useRef<((input: string) => CommandResult) | null>(null);
	const router = useRouter();

	// Boot sequence — type out lines one by one
	useEffect(() => {
		if (!booting) return;
		if (bootIndex >= BOOT_LINES.length) {
			setBooting(false);
			return;
		}

		const timer = setTimeout(
			() => {
				const text = BOOT_LINES[bootIndex]!;
				const isLogo = LOGO_LINES.includes(text);
				setLines((prev) => [...prev, makeBootLine(text, isLogo ? "logo" : "system")]);
				setBootIndex((i) => i + 1);
			},
			bootIndex === 0 ? 300 : 150,
		);

		return () => clearTimeout(timer);
	}, [booting, bootIndex]);

	// Vitals ticker — jitters around current base, preserves spikes
	useEffect(() => {
		if (!showVitals) return;
		const interval = setInterval(() => {
			setVitals((prev) => ({
				bpm: prev.bpm + Math.floor(Math.random() * 5) - 2,
				sys: prev.sys + Math.floor(Math.random() * 3) - 1,
				dia: prev.dia + Math.floor(Math.random() * 3) - 1,
			}));
		}, 1000);
		return () => clearInterval(interval);
	}, [showVitals]);

	// Auto-scroll to bottom when content changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally scroll on lines/input change
	useEffect(() => {
		scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
	}, [lines, input]);

	// Focus input on click anywhere
	const focusInput = useCallback(() => {
		if (mode === "terminal") inputRef.current?.focus();
	}, [mode]);

	const processResult = useCallback(
		(result: CommandResult) => {
			// Store or clear the pending prompt for the next input
			pendingPrompt.current = result.prompt ?? null;

			if (result.action === "clear") {
				setLines([]);
				return;
			}

			const modeActions: Record<string, TerminalMode> = {
				snake: "snake",
				matrix: "matrix",
				hack: "hack",
				doom: "doom",
				tetris: "tetris",
				pong: "pong",
			};

			if (result.action && result.action in modeActions) {
				setLines((prev) => [...prev, ...result.lines]);
				setTimeout(() => setMode(modeActions[result.action!]!), 300);
				return;
			}

			if (result.action === "upgrade") {
				setLines((prev) => [...prev, ...result.lines]);
				if (onUpgrade) setTimeout(onUpgrade, 1500);
				return;
			}

			if (result.action === "destroy") {
				setLines((prev) => [...prev, ...result.lines]);
				setTimeout(() => setMode("destroyed"), 800);
				return;
			}

			if (result.action === "navigate" && result.href) {
				setLines((prev) => [...prev, ...result.lines]);
				setTimeout(() => router.push(result.href!), 400);
				return;
			}

			setLines((prev) => [...prev, ...result.lines]);

			if (result.asyncLines) {
				result.asyncLines().then((asyncResult) => {
					setLines((prev) => [...prev, ...asyncResult]);
				});
			}
		},
		[onUpgrade, router],
	);

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			if (booting) return;

			const cmd = input;
			setInput("");

			// Save to history (skip single-char prompt responses)
			if (cmd.trim() && !pendingPrompt.current) {
				setHistory((prev) => [...prev, cmd]);
			}
			setHistoryIndex(-1);

			// Add the input line
			setLines((prev) => [...prev, makeBootLine(`> ${cmd.toUpperCase()}`)]);

			// If there's a pending interactive prompt, route input there
			if (pendingPrompt.current) {
				const handler = pendingPrompt.current;
				const result = handler(cmd);

				// Start vitals on first Y of upgrade flow
				if (result.prompt && !showVitals) {
					setShowVitals(true);
					localStorage.setItem("show-vitals", "1");
				}
				// Spike heartbeat on third confirmation
				if (result.prompt && showVitals) {
					setVitals((v) => ({ ...v, bpm: 142 }));
				}

				processResult(result);
				return;
			}

			const result = executeCommand(cmd);
			processResult(result);
		},
		[input, booting, showVitals, processResult],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Tab") {
				e.preventDefault();
				const trimmed = input.trimStart();
				const spaceIdx = trimmed.indexOf(" ");
				if (spaceIdx === -1) {
					// Complete command names
					if (trimmed.length === 0) return;
					const prefix = trimmed.toLowerCase();
					const matches = COMMAND_NAMES.filter((c) => c.startsWith(prefix));
					if (matches.length === 1) {
						setInput(matches[0]!);
					}
					return;
				}
				const cmd = trimmed.slice(0, spaceIdx);
				const arg = trimmed.slice(spaceIdx + 1);
				const completed = tabComplete(arg);
				if (completed !== arg) {
					setInput(`${cmd} ${completed}`);
				}
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				if (history.length === 0) return;
				const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
				setHistoryIndex(newIndex);
				setInput(history[newIndex]!);
			} else if (e.key === "ArrowDown") {
				e.preventDefault();
				if (historyIndex === -1) return;
				const newIndex = historyIndex + 1;
				if (newIndex >= history.length) {
					setHistoryIndex(-1);
					setInput("");
				} else {
					setHistoryIndex(newIndex);
					setInput(history[newIndex]!);
				}
			}
		},
		[history, historyIndex, input],
	);

	const handleSnakeExit = useCallback(() => {
		setMode("terminal");
		setLines((prev) => [...prev, makeBootLine("READY.", "system")]);
		setTimeout(() => inputRef.current?.focus(), 50);
	}, []);

	const handleMatrixExit = useCallback(() => {
		setMode("terminal");
		setLines((prev) => [...prev, makeBootLine("READY.", "system")]);
		setTimeout(() => inputRef.current?.focus(), 50);
	}, []);

	const handleHackExit = useCallback(() => {
		setMode("terminal");
		setLines((prev) => [
			...prev,
			makeBootLine("CONNECTION TERMINATED.", "system"),
			makeBootLine("READY.", "system"),
		]);
		setTimeout(() => inputRef.current?.focus(), 50);
	}, []);

	const handleTetrisExit = useCallback(() => {
		setMode("terminal");
		setLines((prev) => [...prev, makeBootLine("READY.", "system")]);
		setTimeout(() => inputRef.current?.focus(), 50);
	}, []);

	const handlePongExit = useCallback(() => {
		setMode("terminal");
		setLines((prev) => [...prev, makeBootLine("READY.", "system")]);
		setTimeout(() => inputRef.current?.focus(), 50);
	}, []);

	const handleDoomExit = useCallback(() => {
		setMode("terminal");
		setLines((prev) => [
			...prev,
			makeBootLine("PROGRAM TERMINATED.", "system"),
			makeBootLine("READY.", "system"),
		]);
		setTimeout(() => inputRef.current?.focus(), 50);
	}, []);

	if (mode === "destroyed") {
		return (
			<div className="flex flex-1 flex-col items-center justify-center bg-black font-pixel">
				<div className="text-6xl font-bold text-red-500 sm:text-8xl">404</div>
				<div className="mt-4 text-sm text-red-400 sm:text-base">SYSTEM DESTROYED</div>
				<div className="mt-1 text-xs text-red-900">NO FILES REMAIN. EVERYTHING IS GONE.</div>
				<div className="mt-8 text-xs text-red-900/50">THANKS A LOT.</div>
			</div>
		);
	}

	if (mode === "hack") {
		return (
			<div className="flex flex-1 overflow-hidden">
				<HackerSim onExit={handleHackExit} />
			</div>
		);
	}

	if (mode === "doom") {
		return (
			<div className="flex flex-1 overflow-hidden">
				<DoomSim onExit={handleDoomExit} />
			</div>
		);
	}

	if (mode === "matrix") {
		return (
			<div className="flex flex-1 overflow-hidden">
				<MatrixRain onExit={handleMatrixExit} />
			</div>
		);
	}

	if (mode === "tetris") {
		return (
			<div className="flex flex-1 items-center justify-center overflow-y-auto">
				<TetrisGame onExit={handleTetrisExit} />
			</div>
		);
	}

	if (mode === "pong") {
		return (
			<div className="flex flex-1 overflow-hidden">
				<PongGame onExit={handlePongExit} />
			</div>
		);
	}

	if (mode === "snake") {
		return (
			<div className="flex flex-1 items-center justify-center overflow-y-auto">
				<SnakeGame onExit={handleSnakeExit} />
			</div>
		);
	}

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: clicking anywhere focuses the hidden input
		// biome-ignore lint/a11y/noStaticElementInteractions: terminal container acts as click target
		<div
			ref={scrollRef}
			className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 font-pixel text-[10px] sm:text-xs"
			onClick={focusInput}
		>
			{showVitals && (
				<div className="sticky top-0 z-10 float-right font-mono text-base leading-tight">
					<span className="text-red-400">&#x2764; {vitals.bpm} BPM</span>
					{"  "}
					<span className="text-blue-300">
						&#x1FA78; {vitals.sys}/{vitals.dia}
					</span>
				</div>
			)}
			{/* Rendered lines */}
			{lines.map((line) => (
				<div
					key={line.id}
					className={`min-h-[1.5em] leading-relaxed ${
						line.type === "logo"
							? "whitespace-pre-wrap font-mono text-xs leading-none"
							: line.type === "rich"
								? "whitespace-pre overflow-hidden"
								: line.noWrap
									? "whitespace-pre overflow-hidden"
									: "whitespace-pre-wrap break-words"
					}`}
				>
					{line.type === "logo" ? (
						// biome-ignore lint/security/noDangerouslySetInnerHtml: static pre-built rainbow HTML
						<span dangerouslySetInnerHTML={{ __html: rainbowLine(line.text) }} />
					) : line.type === "rich" ? (
						// biome-ignore lint/security/noDangerouslySetInnerHtml: static pre-built colored HTML
						<div dangerouslySetInnerHTML={{ __html: line.text }} />
					) : line.lemojiSrc ? (
						// biome-ignore lint/performance/noImgElement: inline 32px lemoji, next/image not needed
						<img src={line.lemojiSrc} alt="lemoji" className="inline-block h-8 w-8" />
					) : line.href ? (
						<a
							href={line.href}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1 text-c64-yellow underline decoration-c64-yellow/50 hover:text-c64-white"
						>
							<span className="no-underline">↗</span>
							{line.text.trim().toUpperCase()}
						</a>
					) : (
						<span
							className={
								line.type === "system"
									? "text-c64-white"
									: line.type === "input"
										? "text-c64-yellow"
										: ""
							}
						>
							{line.text}
						</span>
					)}
				</div>
			))}

			{/* Input line with blinking cursor */}
			{!booting && (
				<form
					onSubmit={handleSubmit}
					className="relative flex items-center text-sm leading-relaxed"
				>
					<span className="text-c64-yellow">&gt;&nbsp;</span>
					<span className="whitespace-pre text-c64-yellow">{input.toUpperCase()}</span>
					<span className="cursor-blink inline-block h-[1em] w-[0.6em] translate-y-[0.15em] bg-c64-yellow" />
					<input
						ref={inputRef}
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						className="absolute inset-0 w-full caret-transparent text-transparent opacity-0 sm:opacity-0"
						style={{ fontSize: "16px" }}
						// biome-ignore lint/a11y/noAutofocus: terminal input must auto-focus
						autoFocus
						autoCapitalize="none"
						autoComplete="off"
						autoCorrect="off"
						spellCheck={false}
						enterKeyHint="go"
						aria-label="Terminal input"
					/>
				</form>
			)}

			{/* Blinking cursor during boot */}
			{booting && (
				<div className="min-h-[1.5em]">
					<span className="cursor-blink inline-block h-[1em] w-[0.6em] translate-y-[0.15em] bg-c64-text" />
				</div>
			)}
		</div>
	);
}
