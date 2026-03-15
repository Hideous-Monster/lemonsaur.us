"use client";

import { useCallback, useEffect, useState } from "react";
import { Desktop } from "@/components/lemon95/desktop";
import { Terminal } from "@/components/terminal/terminal";

type OSMode = "lemon87" | "lemon95";

const STORAGE_KEY = "os-mode";

export default function HomePage() {
	const [mode, setMode] = useState<OSMode>("lemon87");

	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored === "lemon95") setMode("lemon95");
	}, []);

	const handleUpgrade = useCallback(() => {
		localStorage.setItem(STORAGE_KEY, "lemon95");
		setMode("lemon95");
	}, []);

	const handleShutDown = useCallback(() => {
		localStorage.removeItem(STORAGE_KEY);
		setMode("lemon87");
	}, []);

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
