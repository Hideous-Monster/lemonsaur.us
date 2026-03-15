"use client";

import { DoomSim } from "@/components/terminal/doom-sim";

const noop = () => {};

export function DoomApp() {
	return (
		<div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
			<DoomSim onExit={noop} />
		</div>
	);
}
