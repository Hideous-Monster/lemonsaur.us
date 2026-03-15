"use client";

import type React from "react";

interface Props {
	component: React.ComponentType<{ onExit: () => void }>;
}

const noop = () => {};

export function GameWrapper({ component: Game }: Props) {
	return (
		<div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
			<Game onExit={noop} />
		</div>
	);
}
