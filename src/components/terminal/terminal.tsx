"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { SnakeGame } from "@/components/snake/snake-game";
import {
	BOOT_LINES,
	executeCommand,
	LOGO_LINES,
	makeBootLine,
	type TerminalLine,
} from "./commands";

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

type TerminalMode = "terminal" | "snake";

export function Terminal() {
	const [lines, setLines] = useState<TerminalLine[]>([]);
	const [input, setInput] = useState("");
	const [booting, setBooting] = useState(true);
	const [bootIndex, setBootIndex] = useState(0);
	const [mode, setMode] = useState<TerminalMode>("terminal");
	const [history, setHistory] = useState<string[]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const inputRef = useRef<HTMLInputElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
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

	// Auto-scroll to bottom when content changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally scroll on lines/input change
	useEffect(() => {
		scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
	}, [lines, input]);

	// Focus input on click anywhere
	const focusInput = useCallback(() => {
		if (mode === "terminal") inputRef.current?.focus();
	}, [mode]);

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			if (booting) return;

			const cmd = input;
			setInput("");

			// Save to history
			if (cmd.trim()) {
				setHistory((prev) => [...prev, cmd]);
			}
			setHistoryIndex(-1);

			// Add the input line
			setLines((prev) => [...prev, makeBootLine(`> ${cmd.toUpperCase()}`)]);

			const result = executeCommand(cmd);

			if (result.action === "clear") {
				setLines([]);
				return;
			}

			if (result.action === "snake") {
				setLines((prev) => [...prev, ...result.lines]);
				setTimeout(() => setMode("snake"), 300);
				return;
			}

			if (result.action === "navigate" && result.href) {
				setLines((prev) => [...prev, ...result.lines]);
				setTimeout(() => router.push(result.href!), 400);
				return;
			}

			setLines((prev) => [...prev, ...result.lines]);
		},
		[input, booting, router],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "ArrowUp") {
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
		[history, historyIndex],
	);

	const handleSnakeExit = useCallback(() => {
		setMode("terminal");
		setLines((prev) => [...prev, makeBootLine("READY.", "system")]);
		setTimeout(() => inputRef.current?.focus(), 50);
	}, []);

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
			className="flex-1 overflow-y-auto p-4 font-pixel text-[10px] sm:text-xs"
			onClick={focusInput}
		>
			{/* Rendered lines */}
			{lines.map((line) => (
				<div
					key={line.id}
					className={`min-h-[1.5em] whitespace-pre-wrap leading-relaxed ${
						line.type === "logo" ? "font-mono text-xs leading-none" : "break-all"
					}`}
				>
					{line.type === "logo" ? (
						// biome-ignore lint/security/noDangerouslySetInnerHtml: static pre-built rainbow HTML
						<span dangerouslySetInnerHTML={{ __html: rainbowLine(line.text) }} />
					) : line.lemojiSrc ? (
						// biome-ignore lint/performance/noImgElement: inline 32px lemoji, next/image not needed
						<img src={line.lemojiSrc} alt="lemoji" className="inline-block h-8 w-8" />
					) : line.href ? (
						<a
							href={line.href}
							target="_blank"
							rel="noopener noreferrer"
							className="text-c64-yellow underline decoration-c64-yellow/50 hover:text-c64-white"
						>
							{line.text.toUpperCase()}
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
				<form onSubmit={handleSubmit} className="flex items-center text-sm leading-relaxed">
					<span className="text-c64-yellow">&gt;&nbsp;</span>
					<span className="text-c64-yellow">{input.toUpperCase()}</span>
					<span className="cursor-blink inline-block h-[1em] w-[0.6em] translate-y-[0.15em] bg-c64-yellow" />
					<input
						ref={inputRef}
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						className="absolute opacity-0"
						// biome-ignore lint/a11y/noAutofocus: terminal input must auto-focus
						autoFocus
						autoCapitalize="none"
						autoComplete="off"
						autoCorrect="off"
						spellCheck={false}
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
