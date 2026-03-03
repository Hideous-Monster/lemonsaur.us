"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { CustomizerPanel } from "@/components/character-creator/customizer-panel";
import { type CharacterConfig, DEFAULT_CHARACTER } from "@/types/character";

const Scene = dynamic(() => import("@/components/character-creator/scene").then((m) => m.Scene), {
	ssr: false,
	loading: () => (
		<div className="flex h-full items-center justify-center">
			<div className="flex flex-col items-center gap-3">
				<div className="h-24 w-24 animate-pulse rounded-full bg-lemon-500/20" />
				<p className="text-sm text-surface-400">Loading 3D scene...</p>
			</div>
		</div>
	),
});

export default function HomePage() {
	const [config, setConfig] = useState<CharacterConfig>(DEFAULT_CHARACTER);

	return (
		<div className="relative flex h-[calc(100vh-4rem)] flex-col">
			{/* 3D Canvas */}
			<div className="flex-1">
				<Scene config={config} />
			</div>

			{/* Customizer overlay */}
			<div className="pointer-events-none absolute inset-0 flex items-end justify-center p-4 sm:items-center sm:justify-end sm:p-8">
				<CustomizerPanel config={config} onChange={setConfig} />
			</div>

			{/* Non-WebGL fallback */}
			<noscript>
				<div className="flex h-full items-center justify-center p-8 text-center">
					<p className="text-surface-300">
						This page requires JavaScript and WebGL to display the 3D character creator.
					</p>
				</div>
			</noscript>
		</div>
	);
}
