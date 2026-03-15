"use client";

import { MatrixRain } from "@/components/terminal/matrix-rain";

const noop = () => {};

export function MatrixApp() {
	return (
		<div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
			<MatrixRain onExit={noop} />
		</div>
	);
}
