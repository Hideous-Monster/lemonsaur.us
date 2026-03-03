"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ALL_LEMOJIS, lemojiPath } from "@/lib/lemoji";

interface ScatteredLemoji {
	id: string;
	name: string;
	x: number;
	y: number;
	rotation: number;
	scale: number;
	opacity: number;
}

interface LemojiScatterProps {
	count?: number;
}

let idCounter = 0;

function generateLemojis(count: number): ScatteredLemoji[] {
	return Array.from({ length: count }, () => {
		const name = ALL_LEMOJIS[Math.floor(Math.random() * ALL_LEMOJIS.length)]!;
		return {
			id: `lemoji-${++idCounter}`,
			name,
			x: Math.random() * 100,
			y: Math.random() * 100,
			rotation: Math.random() * 40 - 20,
			scale: 0.5 + Math.random() * 0.8,
			opacity: 0.04 + Math.random() * 0.06,
		};
	});
}

export function LemojiScatter({ count = 12 }: LemojiScatterProps) {
	const [lemojis, setLemojis] = useState<ScatteredLemoji[]>([]);

	useEffect(() => {
		setLemojis(generateLemojis(count));
	}, [count]);

	if (lemojis.length === 0) return null;

	return (
		<div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
			{lemojis.map((lemoji) => (
				<div
					key={lemoji.id}
					className="absolute"
					style={{
						left: `${lemoji.x}%`,
						top: `${lemoji.y}%`,
						transform: `rotate(${lemoji.rotation}deg) scale(${lemoji.scale})`,
						opacity: lemoji.opacity,
					}}
				>
					<Image
						src={lemojiPath(lemoji.name)}
						alt=""
						width={48}
						height={48}
						className="select-none"
					/>
				</div>
			))}
		</div>
	);
}
