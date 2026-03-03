"use client";

import type { CharacterConfig } from "@/types/character";

interface AccessoriesProps {
	accessory: CharacterConfig["accessory"];
}

function Sunglasses() {
	return (
		<group position={[0, 0.1, 0.85]}>
			{/* Left lens */}
			<mesh position={[-0.22, 0, 0.05]}>
				<boxGeometry args={[0.2, 0.12, 0.03]} />
				<meshToonMaterial color="#1a1a12" />
			</mesh>
			{/* Right lens */}
			<mesh position={[0.22, 0, 0.05]}>
				<boxGeometry args={[0.2, 0.12, 0.03]} />
				<meshToonMaterial color="#1a1a12" />
			</mesh>
			{/* Bridge */}
			<mesh position={[0, 0.02, 0.05]}>
				<boxGeometry args={[0.12, 0.025, 0.025]} />
				<meshToonMaterial color="#1a1a12" />
			</mesh>
			{/* Left arm */}
			<mesh position={[-0.35, 0, -0.1]} rotation={[0, 0.4, 0]}>
				<boxGeometry args={[0.15, 0.025, 0.025]} />
				<meshToonMaterial color="#1a1a12" />
			</mesh>
			{/* Right arm */}
			<mesh position={[0.35, 0, -0.1]} rotation={[0, -0.4, 0]}>
				<boxGeometry args={[0.15, 0.025, 0.025]} />
				<meshToonMaterial color="#1a1a12" />
			</mesh>
		</group>
	);
}

function Monocle() {
	return (
		<group position={[0.25, 0.1, 0.9]}>
			{/* Monocle rim */}
			<mesh>
				<torusGeometry args={[0.1, 0.012, 12, 24]} />
				<meshToonMaterial color="#FFD700" />
			</mesh>
			{/* Lens */}
			<mesh>
				<circleGeometry args={[0.09, 24]} />
				<meshToonMaterial color="#e0f0ff" transparent opacity={0.3} />
			</mesh>
			{/* Chain */}
			<mesh position={[0, -0.15, 0]} rotation={[0, 0, 0.2]}>
				<cylinderGeometry args={[0.005, 0.005, 0.2, 8]} />
				<meshToonMaterial color="#FFD700" />
			</mesh>
		</group>
	);
}

function BowTie() {
	return (
		<group position={[0, -0.65, 0.7]}>
			{/* Left wing */}
			<mesh position={[-0.1, 0, 0]} rotation={[0, 0, 0.3]}>
				<coneGeometry args={[0.08, 0.15, 4]} />
				<meshToonMaterial color="#FF6347" />
			</mesh>
			{/* Right wing */}
			<mesh position={[0.1, 0, 0]} rotation={[0, 0, -0.3]}>
				<coneGeometry args={[0.08, 0.15, 4]} />
				<meshToonMaterial color="#FF6347" />
			</mesh>
			{/* Center knot */}
			<mesh>
				<sphereGeometry args={[0.035, 8, 8]} />
				<meshToonMaterial color="#b33a2a" />
			</mesh>
		</group>
	);
}

export function Accessories({ accessory }: AccessoriesProps) {
	switch (accessory) {
		case "sunglasses":
			return <Sunglasses />;
		case "monocle":
			return <Monocle />;
		case "bow-tie":
			return <BowTie />;
		default:
			return null;
	}
}
