"use client";

import { HackerSim } from "@/components/terminal/hacker-sim";

const noop = () => {};

export function HackApp() {
	return (
		<div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
			<HackerSim onExit={noop} />
		</div>
	);
}
