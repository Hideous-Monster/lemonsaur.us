"use client";

import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { useCallback } from "react";
import {
	type CharacterCategory,
	type CharacterConfig,
	cycleOption,
	randomCharacter,
} from "@/types/character";

interface CustomizerPanelProps {
	config: CharacterConfig;
	onChange: (config: CharacterConfig) => void;
}

const CATEGORY_LABELS: Record<CharacterCategory, string> = {
	body: "Body",
	expression: "Expression",
	hat: "Hat",
	accessory: "Accessory",
	color: "Color",
};

const CATEGORY_ORDER: CharacterCategory[] = ["body", "expression", "hat", "accessory", "color"];

function formatValue(value: string): string {
	return value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function CustomizerPanel({ config, onChange }: CustomizerPanelProps) {
	const handleCycle = useCallback(
		(category: CharacterCategory, delta: 1 | -1) => {
			onChange(cycleOption(config, category, delta));
		},
		[config, onChange],
	);

	const handleRandomize = useCallback(() => {
		onChange(randomCharacter());
	}, [onChange]);

	return (
		<div className="pointer-events-auto flex flex-col gap-3 rounded-xl border border-leaf-700/50 bg-leaf-800/90 p-4 backdrop-blur-sm">
			<h2 className="text-center text-sm font-semibold text-lemon-300 uppercase tracking-wider">
				Customize
			</h2>

			{CATEGORY_ORDER.map((category) => (
				<div key={category} className="flex items-center gap-2">
					<span className="w-20 text-xs font-medium text-surface-400">
						{CATEGORY_LABELS[category]}
					</span>
					<button
						type="button"
						onClick={() => handleCycle(category, -1)}
						className="rounded-md p-1 text-surface-400 transition-colors hover:bg-leaf-700 hover:text-lemon-400"
						aria-label={`Previous ${category}`}
					>
						<ChevronLeft size={16} />
					</button>
					<span className="min-w-[100px] text-center text-sm text-surface-200">
						{formatValue(config[category])}
					</span>
					<button
						type="button"
						onClick={() => handleCycle(category, 1)}
						className="rounded-md p-1 text-surface-400 transition-colors hover:bg-leaf-700 hover:text-lemon-400"
						aria-label={`Next ${category}`}
					>
						<ChevronRight size={16} />
					</button>
				</div>
			))}

			<button
				type="button"
				onClick={handleRandomize}
				className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-lemon-500 px-4 py-2 text-sm font-semibold text-leaf-900 transition-colors hover:bg-lemon-400"
				aria-label="Randomize character"
			>
				<Shuffle size={16} />
				Randomize
			</button>
		</div>
	);
}
