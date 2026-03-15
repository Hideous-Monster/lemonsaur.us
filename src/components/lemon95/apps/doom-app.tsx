"use client";

import { useEffect } from "react";
import { DoomSim } from "@/components/terminal/doom-sim";

const noop = () => {};

export function DoomApp() {
	// When this component unmounts (window closed), reload to kill WASM/audio
	useEffect(() => {
		return () => {
			// Emscripten doesn't support clean shutdown — reload the page
			window.location.reload();
		};
	}, []);

	return (
		<div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
			<DoomSim onExit={noop} />
		</div>
	);
}
