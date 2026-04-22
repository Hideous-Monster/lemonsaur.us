"use client";

import { useEffect } from "react";
import { DoomSim } from "@/components/terminal/doom-sim";

const noop = () => {};

export function DoomApp() {
	// When this component unmounts (window closed), reload to kill WASM/audio.
	// Small delay so DoomSim's cleanup telemetry fetch initiates before the
	// reload cancels any in-flight work.
	useEffect(() => {
		return () => {
			// Emscripten doesn't support clean shutdown — reload the page
			setTimeout(() => window.location.reload(), 150);
		};
	}, []);

	return (
		<div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
			<DoomSim onExit={noop} />
		</div>
	);
}
