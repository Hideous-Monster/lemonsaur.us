"use client";

import type { ReactNode } from "react";
import type { CharacterConfig } from "@/types/character";

interface FaceProps {
	expression: CharacterConfig["expression"];
}

function Eye({ position }: { position: [number, number, number] }) {
	return (
		<mesh position={position}>
			<sphereGeometry args={[0.08, 16, 16]} />
			<meshToonMaterial color="#1a1a12" />
		</mesh>
	);
}

function Pupil({ position }: { position: [number, number, number] }) {
	return (
		<mesh position={[position[0], position[1], position[2] + 0.05]}>
			<sphereGeometry args={[0.04, 12, 12]} />
			<meshBasicMaterial color="#ffffff" />
		</mesh>
	);
}

const MOUTH_CONFIGS: Record<CharacterConfig["expression"], ReactNode> = {
	happy: (
		<mesh position={[0, -0.25, 0.9]} rotation={[0.3, 0, 0]}>
			<torusGeometry args={[0.12, 0.025, 8, 16, Math.PI]} />
			<meshToonMaterial color="#1a1a12" />
		</mesh>
	),
	surprised: (
		<mesh position={[0, -0.3, 0.9]}>
			<sphereGeometry args={[0.08, 16, 16]} />
			<meshToonMaterial color="#1a1a12" />
		</mesh>
	),
	mischievous: (
		<mesh position={[0.05, -0.25, 0.9]} rotation={[0.3, 0, 0.15]}>
			<torusGeometry args={[0.12, 0.025, 8, 16, Math.PI]} />
			<meshToonMaterial color="#1a1a12" />
		</mesh>
	),
	sleepy: (
		<mesh position={[0, -0.25, 0.9]} rotation={[0, 0, 0]}>
			<boxGeometry args={[0.2, 0.03, 0.03]} />
			<meshToonMaterial color="#1a1a12" />
		</mesh>
	),
};

const EYE_CONFIGS: Record<
	CharacterConfig["expression"],
	{ left: [number, number, number]; right: [number, number, number]; squint: boolean }
> = {
	happy: { left: [-0.25, 0.1, 0.85], right: [0.25, 0.1, 0.85], squint: false },
	surprised: { left: [-0.25, 0.15, 0.85], right: [0.25, 0.15, 0.85], squint: false },
	mischievous: { left: [-0.25, 0.1, 0.85], right: [0.25, 0.05, 0.85], squint: false },
	sleepy: { left: [-0.25, 0.05, 0.85], right: [0.25, 0.05, 0.85], squint: true },
};

export function Face({ expression }: FaceProps) {
	const eyes = EYE_CONFIGS[expression];

	return (
		<group>
			{eyes.squint ? (
				<>
					<mesh position={eyes.left} rotation={[0, 0, 0.1]}>
						<boxGeometry args={[0.16, 0.04, 0.04]} />
						<meshToonMaterial color="#1a1a12" />
					</mesh>
					<mesh position={eyes.right} rotation={[0, 0, -0.1]}>
						<boxGeometry args={[0.16, 0.04, 0.04]} />
						<meshToonMaterial color="#1a1a12" />
					</mesh>
				</>
			) : (
				<>
					<Eye position={eyes.left} />
					<Pupil position={eyes.left} />
					<Eye position={eyes.right} />
					<Pupil position={eyes.right} />
				</>
			)}
			{MOUTH_CONFIGS[expression]}
		</group>
	);
}
