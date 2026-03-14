"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface DoomSimProps {
	onExit: () => void;
}

const ID_LOGO = [
	"        ██ ██████      ",
	"        ██ ██   ██     ",
	"        ██ ██    ██    ",
	"        ██ ██    ██    ",
	"        ██ ██   ██     ",
	"        ██ ██████      ",
	"                       ",
	"  ███████  ████  ██████",
	"  ██      ██  ██ ██    ",
	"  ███████ ██  ██ █████ ",
	"       ██ ██  ██ ██    ",
	"  ███████  ████  ██    ",
	"       ████████████    ",
	"      ████████████     ",
	"       ████████████    ",
];

interface Line {
	text: string;
	color: string;
}

const LOADING_SEQUENCE: { lines: Line[]; delay: number }[] = [
	{
		delay: 800,
		lines: [{ text: "DOOM v1.9 — id Software, 1993", color: "text-red-400" }],
	},
	{
		delay: 600,
		lines: [{ text: "Configured for Commodore 64 with 38911 bytes free", color: "text-gray-400" }],
	},
	{
		delay: 400,
		lines: [{ text: "", color: "" }],
	},
	{
		delay: 700,
		lines: [{ text: "V_Init: allocate screens.", color: "text-gray-500" }],
	},
	{
		delay: 500,
		lines: [{ text: "M_LoadDefaults: Loading system defaults.", color: "text-gray-500" }],
	},
	{
		delay: 600,
		lines: [{ text: "Z_Init: Init zone memory allocation daemon.", color: "text-gray-500" }],
	},
	{
		delay: 400,
		lines: [{ text: "W_Init: Init WADfiles.", color: "text-gray-500" }],
	},
	{
		delay: 800,
		lines: [{ text: "  adding DOOM1.WAD", color: "text-gray-400" }],
	},
	{
		delay: 300,
		lines: [{ text: "  adding LEMON.WAD", color: "text-gray-400" }],
	},
	{
		delay: 900,
		lines: [{ text: "  shareware version.", color: "text-yellow-600" }],
	},
	{
		delay: 500,
		lines: [{ text: "I_Init: Setting up machine state.", color: "text-gray-500" }],
	},
	{
		delay: 600,
		lines: [{ text: "D_CheckNetGame: Checking network game status.", color: "text-gray-500" }],
	},
	{
		delay: 400,
		lines: [
			{
				text: "  startskill 2  deathmatch: 0  startmap: 1  startepisode: 1",
				color: "text-gray-400",
			},
		],
	},
	{
		delay: 700,
		lines: [{ text: "S_Init: Setting up sound.", color: "text-gray-500" }],
	},
	{
		delay: 500,
		lines: [{ text: "  SID 6581 detected — 3 voice channels available", color: "text-gray-400" }],
	},
	{
		delay: 600,
		lines: [{ text: "HU_Init: Setting up heads up display.", color: "text-gray-500" }],
	},
	{
		delay: 500,
		lines: [{ text: "ST_Init: Init status bar.", color: "text-gray-500" }],
	},
	{
		delay: 400,
		lines: [{ text: "R_Init: Init DOOM refresh daemon —", color: "text-gray-500" }],
	},
	{
		delay: 1200,
		lines: [
			{ text: "  .....................................................", color: "text-gray-600" },
		],
	},
	{
		delay: 600,
		lines: [{ text: "P_Init: Init Playloop state.", color: "text-gray-500" }],
	},
	{
		delay: 800,
		lines: [
			{ text: "", color: "" },
			{
				text: "Z_Malloc: failed on allocation of 65536 bytes",
				color: "text-red-500",
			},
			{
				text: "ERROR: Z_Malloc: Failure trying to allocate 65536 bytes",
				color: "text-red-400",
			},
			{ text: "", color: "" },
			{
				text: "Not enough conventional memory available.",
				color: "text-yellow-500",
			},
			{
				text: "System has 38911 bytes free. DOOM requires 4194304 bytes.",
				color: "text-yellow-500",
			},
			{
				text: "You are short by approximately 4155393 bytes.",
				color: "text-yellow-500",
			},
			{ text: "", color: "" },
			{
				text: "Try unloading TSR programs or adding HIMEM.SYS to CONFIG.SYS",
				color: "text-gray-400",
			},
			{ text: "", color: "" },
			{
				text: "Abort, Retry, Fail? _",
				color: "text-white",
			},
		],
	},
];

export function DoomSim({ onExit }: DoomSimProps) {
	const [phase, setPhase] = useState<"logo" | "loading" | "crashed">("logo");
	const [lines, setLines] = useState<Line[]>([]);
	const [step, setStep] = useState(0);
	const scrollRef = useRef<HTMLDivElement>(null);
	const onExitRef = useRef(onExit);
	onExitRef.current = onExit;

	// Auto-scroll
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally scroll on lines change
	useEffect(() => {
		scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
	}, [lines]);

	// Logo phase: show for 2s then start loading
	useEffect(() => {
		if (phase !== "logo") return;
		const timer = setTimeout(() => setPhase("loading"), 2000);
		return () => clearTimeout(timer);
	}, [phase]);

	// Loading phase: step through the sequence
	useEffect(() => {
		if (phase !== "loading") return;
		if (step >= LOADING_SEQUENCE.length) {
			setPhase("crashed");
			return;
		}

		const entry = LOADING_SEQUENCE[step]!;
		const timer = setTimeout(() => {
			setLines((prev) => [...prev, ...entry.lines]);
			setStep((s) => s + 1);
		}, entry.delay);

		return () => clearTimeout(timer);
	}, [phase, step]);

	// Any key exits once crashed
	const handleKey = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onExitRef.current();
				return;
			}
			if (["Shift", "Control", "Alt", "Meta"].includes(e.key)) return;
			if (phase === "crashed") {
				onExitRef.current();
			}
		},
		[phase],
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [handleKey]);

	if (phase === "logo") {
		return (
			// biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handled via window listener
			// biome-ignore lint/a11y/noStaticElementInteractions: splash acts as click target
			<div
				className="flex flex-1 flex-col items-center justify-center bg-black font-mono"
				onClick={() => setPhase("loading")}
			>
				<pre className="text-[8px] leading-tight text-red-600 sm:text-[11px]">
					{ID_LOGO.join("\n")}
				</pre>
				<div className="mt-4 text-xs tracking-widest text-red-800">S O F T W A R E</div>
			</div>
		);
	}

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handled via window listener
		// biome-ignore lint/a11y/noStaticElementInteractions: container acts as click target
		<div
			className="flex flex-1 flex-col bg-black font-mono"
			onClick={() => phase === "crashed" && onExitRef.current()}
		>
			<div ref={scrollRef} className="flex-1 overflow-y-auto p-4 text-xs leading-relaxed">
				{lines.map((line, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: output-only append list
						key={i}
						className={`min-h-[1.4em] whitespace-pre-wrap ${line.color}`}
					>
						{line.text}
					</div>
				))}
				{phase === "crashed" && (
					<div className="mt-4 text-[10px] text-gray-600">[ANY KEY TO RETURN]</div>
				)}
			</div>
		</div>
	);
}
