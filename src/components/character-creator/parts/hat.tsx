"use client";

import type { CharacterConfig } from "@/types/character";

interface HatProps {
	hat: CharacterConfig["hat"];
}

function LeafCrown() {
	return (
		<group position={[0, 1.3, 0]}>
			{[0, 1, 2, 3, 4].map((i) => {
				const angle = (i / 5) * Math.PI * 2;
				return (
					<mesh
						key={i}
						position={[Math.cos(angle) * 0.25, 0.1, Math.sin(angle) * 0.25]}
						rotation={[0.3, angle, 0.5]}
					>
						<coneGeometry args={[0.08, 0.3, 4]} />
						<meshToonMaterial color="#4caf50" />
					</mesh>
				);
			})}
			<mesh position={[0, 0, 0]}>
				<torusGeometry args={[0.25, 0.04, 8, 16]} />
				<meshToonMaterial color="#2e7d32" />
			</mesh>
		</group>
	);
}

function SunglassesOnHead() {
	return (
		<group position={[0, 1.15, 0.3]} rotation={[-0.5, 0, 0]}>
			{/* Left lens */}
			<mesh position={[-0.18, 0, 0]}>
				<boxGeometry args={[0.22, 0.12, 0.03]} />
				<meshToonMaterial color="#1a1a12" />
			</mesh>
			{/* Right lens */}
			<mesh position={[0.18, 0, 0]}>
				<boxGeometry args={[0.22, 0.12, 0.03]} />
				<meshToonMaterial color="#1a1a12" />
			</mesh>
			{/* Bridge */}
			<mesh position={[0, 0.02, 0]}>
				<boxGeometry args={[0.08, 0.03, 0.03]} />
				<meshToonMaterial color="#1a1a12" />
			</mesh>
		</group>
	);
}

function TinyUmbrella() {
	return (
		<group position={[0.15, 1.6, 0]}>
			{/* Canopy */}
			<mesh position={[0, 0, 0]}>
				<coneGeometry args={[0.35, 0.15, 8]} />
				<meshToonMaterial color="#FF6347" />
			</mesh>
			{/* Stick */}
			<mesh position={[0, -0.3, 0]}>
				<cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />
				<meshToonMaterial color="#806c00" />
			</mesh>
			{/* Handle curve */}
			<mesh position={[0, -0.55, 0.04]} rotation={[0, 0, 0]}>
				<torusGeometry args={[0.04, 0.012, 8, 12, Math.PI]} />
				<meshToonMaterial color="#806c00" />
			</mesh>
		</group>
	);
}

export function Hat({ hat }: HatProps) {
	switch (hat) {
		case "leaf-crown":
			return <LeafCrown />;
		case "sunglasses-on-head":
			return <SunglassesOnHead />;
		case "tiny-umbrella":
			return <TinyUmbrella />;
		default:
			return null;
	}
}
