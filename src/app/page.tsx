"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Desktop } from "@/components/lemon95/desktop";
import { Terminal } from "@/components/terminal/terminal";

type OSMode = "lemon87" | "lemon95" | "upgrading";

const STORAGE_KEY = "os-mode";

const INSTALL_STEPS = [
	"Backing up LEMON/87 system files...",
	"Formatting GUI partition...",
	"Installing LEMON/95 kernel v3.7.1...",
	"Copying window manager subsystem...",
	"Installing desktop shell...",
	"Registering 🍋 lemon drivers...",
	"Configuring VIC-II display adapter...",
	"Installing SID 6581 audio drivers...",
	"Setting up citrus engine v3.7...",
	"Installing Netscape Navigator 4.0...",
	"Importing bookmarks from stone tablets...",
	"Calibrating lemon-to-pixel ratio...",
	"Installing 47 desktop wallpapers...",
	"Registering file associations...",
	"Building icon cache...",
	"Running first-time setup wizard...",
	"Finalizing installation...",
	"Cleaning up temporary files...",
	"Verifying system integrity... OK",
	"Installation complete. Rebooting...",
];

const TIPS = [
	"💡 TIP: LEMON/95 supports draggable windows! Move them around with the title bar.",
	"💡 TIP: Try the new Weather app — real weather data for any city in the world!",
	"💡 TIP: Play DOOM, Tetris, Pong, and Snake — all in resizable windows!",
	"💡 TIP: Visit the Links page for the authentic GeoCities experience.",
	"💡 TIP: The About page is modeled after a real MySpace profile. You're welcome.",
	"💡 TIP: Click the Start button to access all your apps.",
	"💡 TIP: The Fortune Teller has a crystal ball you can click repeatedly!",
	"💡 TIP: You can resize windows by dragging the bottom-right corner.",
	"💡 TIP: Your heartbeat is still being monitored. Don't worry about it.",
	"💡 TIP: To return to LEMON/87, use Start → Exit to LEMON/87.",
];

function UpgradeScreen({ onDone }: { onDone: () => void }) {
	const [stepIndex, setStepIndex] = useState(0);
	const [progress, setProgress] = useState(0);
	const [tipIndex, setTipIndex] = useState(0);
	const doneRef = useRef(false);

	useEffect(() => {
		const totalDuration = 8000;
		const stepDuration = totalDuration / INSTALL_STEPS.length;
		let elapsed = 0;

		const interval = setInterval(() => {
			elapsed += 50;
			const p = Math.min(1, elapsed / totalDuration);
			setProgress(p);
			setStepIndex(Math.min(INSTALL_STEPS.length - 1, Math.floor(p * INSTALL_STEPS.length)));

			if (p >= 1 && !doneRef.current) {
				doneRef.current = true;
				clearInterval(interval);
				setTimeout(onDone, 1200);
			}
		}, 50);

		// Also advance steps at their own pace for a staggered feel
		const stepInterval = setInterval(() => {
			setStepIndex((prev) => Math.min(INSTALL_STEPS.length - 1, prev + 1));
		}, stepDuration);

		return () => {
			clearInterval(interval);
			clearInterval(stepInterval);
		};
	}, [onDone]);

	// Rotate tips
	useEffect(() => {
		const tipTimer = setInterval(() => {
			setTipIndex((i) => (i + 1) % TIPS.length);
		}, 3000);
		return () => clearInterval(tipTimer);
	}, []);

	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 9999,
				background: "#0a140a",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				fontFamily: "monospace",
				gap: 20,
			}}
		>
			{/* Title */}
			<div style={{ color: "#e8e040", fontSize: 28, fontWeight: "bold", letterSpacing: 2 }}>
				LEMON/95 SETUP
			</div>
			<div style={{ color: "#688850", fontSize: 12 }}>
				Please wait while LEMON/95 is installed on your system.
			</div>

			{/* Progress bar */}
			<div
				style={{
					width: Math.min(500, window.innerWidth * 0.7),
					height: 20,
					background: "#1a2a1a",
					border: "2px solid #405030",
					position: "relative",
					overflow: "hidden",
				}}
			>
				{/* Rainbow fill */}
				<div
					style={{
						height: "100%",
						width: `${progress * 100}%`,
						background:
							"linear-gradient(90deg, #ff5050, #ff9040, #e8e040, #40b848, #5090ff, #8050d0, #c050ff)",
						transition: "width 0.05s linear",
					}}
				/>
			</div>

			{/* Percentage */}
			<div style={{ color: "#e8e040", fontSize: 16, fontWeight: "bold" }}>
				{Math.floor(progress * 100)}%
			</div>

			{/* Current step */}
			<div style={{ color: "#b8d850", fontSize: 12, height: 16 }}>{INSTALL_STEPS[stepIndex]}</div>

			{/* Step log (show last few completed steps) */}
			<div
				style={{
					width: Math.min(500, window.innerWidth * 0.7),
					height: 120,
					overflow: "hidden",
					marginTop: 10,
				}}
			>
				{INSTALL_STEPS.slice(0, stepIndex + 1).map((step, i) => (
					<div
						key={step}
						style={{
							color: i === stepIndex ? "#e8e040" : "#405030",
							fontSize: 10,
							lineHeight: 1.6,
							whiteSpace: "nowrap",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}
					>
						{i < stepIndex ? "✓" : "›"} {step}
					</div>
				))}
			</div>

			{/* Tip */}
			<div
				style={{
					color: "#70a850",
					fontSize: 11,
					marginTop: 16,
					textAlign: "center",
					maxWidth: 460,
					minHeight: 30,
				}}
			>
				{TIPS[tipIndex]}
			</div>

			{/* Warning footer */}
			<div
				style={{
					color: "#ff5050",
					fontSize: 12,
					fontWeight: "bold",
					marginTop: 24,
					padding: "6px 16px",
					border: "1px solid #ff5050",
					textAlign: "center",
				}}
			>
				⚠ DO NOT TURN OFF YOUR COMPUTER ⚠
			</div>
		</div>
	);
}

export default function HomePage() {
	const [mode, setMode] = useState<OSMode>("lemon87");

	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored === "lemon95") setMode("lemon95");
	}, []);

	const handleUpgrade = useCallback(() => {
		setMode("upgrading");
	}, []);

	const handleUpgradeDone = useCallback(() => {
		localStorage.setItem(STORAGE_KEY, "lemon95");
		setMode("lemon95");
	}, []);

	const handleShutDown = useCallback(() => {
		localStorage.removeItem(STORAGE_KEY);
		localStorage.removeItem("show-vitals");
		setMode("lemon87");
	}, []);

	if (mode === "upgrading") {
		return <UpgradeScreen onDone={handleUpgradeDone} />;
	}

	if (mode === "lemon95") {
		return <Desktop onShutDown={handleShutDown} />;
	}

	return (
		<div className="flex h-full flex-col bg-c64-dim p-6 sm:p-10 md:p-16">
			<div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-c64-body">
				<Terminal onUpgrade={handleUpgrade} />
			</div>
		</div>
	);
}
