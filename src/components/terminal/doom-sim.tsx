"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface DoomSimProps {
	onExit: () => void;
}

interface Line {
	text: string;
	color: string;
}

const LOADING_SEQUENCE: { lines: Line[]; delay: number }[] = [
	{
		delay: 80,
		lines: [{ text: "DOOM v1.9 — id Software, 1993", color: "text-red-400" }],
	},
	{ delay: 50, lines: [{ text: "V_Init: allocate screens.", color: "text-gray-500" }] },
	{
		delay: 50,
		lines: [{ text: "M_LoadDefaults: Loading system defaults.", color: "text-gray-500" }],
	},
	{
		delay: 50,
		lines: [{ text: "Z_Init: Init zone memory allocation daemon.", color: "text-gray-500" }],
	},
	{ delay: 50, lines: [{ text: "W_Init: Init WADfiles.", color: "text-gray-500" }] },
	{ delay: 80, lines: [{ text: "  adding DOOM1.WAD", color: "text-gray-400" }] },
	{ delay: 50, lines: [{ text: "  shareware version.", color: "text-yellow-600" }] },
	{ delay: 50, lines: [{ text: "I_Init: Setting up machine state.", color: "text-gray-500" }] },
	{ delay: 50, lines: [{ text: "S_Init: Setting up sound.", color: "text-gray-500" }] },
	{ delay: 50, lines: [{ text: "R_Init: Init DOOM refresh daemon —", color: "text-gray-500" }] },
	{
		delay: 150,
		lines: [
			{ text: "  .....................................................", color: "text-gray-600" },
		],
	},
	{ delay: 50, lines: [{ text: "P_Init: Init Playloop state.", color: "text-gray-500" }] },
	{
		delay: 80,
		lines: [{ text: "Loading Chocolate Doom WASM...", color: "text-green-500" }],
	},
];

async function fetchFile(url: string): Promise<Uint8Array> {
	const resp = await fetch(url);
	return new Uint8Array(await resp.arrayBuffer());
}

export function DoomSim({ onExit }: DoomSimProps) {
	const [phase, setPhase] = useState<"loading" | "playing">("loading");
	const [lines, setLines] = useState<Line[]>([]);
	const [step, setStep] = useState(0);
	const scrollRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const onExitRef = useRef(onExit);
	onExitRef.current = onExit;

	// Auto-scroll during loading
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally scroll on lines change
	useEffect(() => {
		scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
	}, [lines]);

	// Loading sequence
	useEffect(() => {
		if (phase !== "loading") return;
		if (step >= LOADING_SEQUENCE.length) {
			setPhase("playing");
			return;
		}

		const entry = LOADING_SEQUENCE[step]!;
		const timer = setTimeout(() => {
			setLines((prev) => [...prev, ...entry.lines]);
			setStep((s) => s + 1);
		}, entry.delay);

		return () => clearTimeout(timer);
	}, [phase, step]);

	// Launch Chocolate Doom WASM
	useEffect(() => {
		if (phase !== "playing" || !canvasRef.current) return;

		let cancelled = false;
		const canvas = canvasRef.current;

		async function launch() {
			// Pre-fetch patched WAD and config
			const [wadData, cfgData] = await Promise.all([
				fetchFile("/doom/doom1-lemon.wad"),
				fetchFile("/doom/default.cfg"),
			]);

			if (cancelled) return;

			// Set up the Emscripten Module BEFORE loading the script.
			// Emscripten reads window.Module on load and merges our config.
			const win = window as Record<string, unknown>;
			win.Module = {
				canvas,
				arguments: [
					"-iwad",
					"doom1.wad",
					"-window",
					"-nogui",
					"-nomusic",
					"-config",
					"default.cfg",
				],
				preRun: [
					function preRun() {
						console.log("[DOOM] preRun: writing files to virtual FS");
						const mod = win.Module as Record<string, unknown>;
						const FS = mod.FS as {
							writeFile: (path: string, data: Uint8Array) => void;
						};
						FS.writeFile("doom1.wad", wadData);
						FS.writeFile("default.cfg", cfgData);
					},
				],
				print: (text: string) => console.log(`[DOOM] ${text}`),
				printErr: (text: string) => console.error(`[DOOM] ${text}`),
				locateFile: (path: string) => `/doom/${path}`,
			};

			console.log("[DOOM] Loading websockets-doom.js...");
			const script = document.createElement("script");
			script.src = "/doom/websockets-doom.js";
			script.async = true;
			script.onerror = (e) => console.error("[DOOM] Script load failed:", e);
			document.body.appendChild(script);
		}

		launch();

		return () => {
			cancelled = true;
		};
	}, [phase]);

	// ESC exits back to terminal
	const handleKey = useCallback((e: KeyboardEvent) => {
		if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			// Reload the page to cleanly kill the WASM runtime
			// (Emscripten doesn't support clean shutdown)
			onExitRef.current();
		}
	}, []);

	useEffect(() => {
		window.addEventListener("keydown", handleKey, true);
		return () => window.removeEventListener("keydown", handleKey, true);
	}, [handleKey]);

	if (phase === "playing") {
		return (
			<div className="flex flex-1 flex-col items-center justify-center bg-black">
				<div className="flex w-full items-center justify-between border-b border-yellow-900/50 px-4 py-1 font-mono text-[10px] text-yellow-600">
					<span>LEMOON v1.9 — SHAREWARE — CHOCOLATE DOOM WASM</span>
					<span>[ESC] exit</span>
				</div>
				<canvas
					ref={canvasRef}
					id="canvas"
					className="flex-1"
					width={640}
					height={400}
					tabIndex={-1}
					onContextMenu={(e) => e.preventDefault()}
				/>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col bg-black font-mono">
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
			</div>
		</div>
	);
}
