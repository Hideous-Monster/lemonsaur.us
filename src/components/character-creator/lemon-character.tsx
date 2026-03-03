"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import type { CharacterConfig } from "@/types/character";
import { Accessories } from "./parts/accessories";
import { Body } from "./parts/body";
import { Face } from "./parts/face";
import { Hat } from "./parts/hat";

interface LemonCharacterProps {
	config: CharacterConfig;
}

export function LemonCharacter({ config }: LemonCharacterProps) {
	const groupRef = useRef<Group>(null);

	useFrame((state) => {
		if (groupRef.current) {
			groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
			groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
		}
	});

	return (
		<group ref={groupRef}>
			<Body shape={config.body} color={config.color} />
			<Face expression={config.expression} />
			<Hat hat={config.hat} />
			<Accessories accessory={config.accessory} />
		</group>
	);
}
