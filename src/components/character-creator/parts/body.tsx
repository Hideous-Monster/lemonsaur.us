"use client";

import { useRef } from "react";
import type { Mesh } from "three";
import { type CharacterConfig, COLORS } from "@/types/character";

const BODY_SCALES: Record<CharacterConfig["body"], [number, number, number]> = {
	round: [1, 1.2, 1],
	elongated: [0.7, 1.8, 0.7],
	bumpy: [1.1, 1.3, 0.9],
};

interface BodyProps {
	shape: CharacterConfig["body"];
	color: CharacterConfig["color"];
}

export function Body({ shape, color }: BodyProps) {
	const meshRef = useRef<Mesh>(null);
	const scale = BODY_SCALES[shape];

	return (
		<mesh ref={meshRef} scale={scale}>
			<sphereGeometry args={[1, 32, 32]} />
			<meshToonMaterial color={COLORS[color]} />
		</mesh>
	);
}
