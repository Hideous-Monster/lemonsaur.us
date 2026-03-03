"use client";

import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import type { CharacterConfig } from "@/types/character";
import { LemonCharacter } from "./lemon-character";

interface SceneProps {
	config: CharacterConfig;
}

export function Scene({ config }: SceneProps) {
	return (
		<Canvas
			camera={{ position: [0, 0.5, 4], fov: 45 }}
			gl={{ alpha: true }}
			style={{ background: "transparent" }}
			aria-label="3D lemon character creator — use the controls below to customize your lemon"
			role="img"
		>
			<Suspense fallback={null}>
				<ambientLight intensity={0.5} />
				<directionalLight position={[5, 5, 5]} intensity={1} castShadow />
				<pointLight position={[-3, 2, -2]} intensity={0.4} color="#FFE033" />

				<LemonCharacter config={config} />

				<ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={6} blur={2.5} />
				<Environment preset="sunset" background={false} />
				<OrbitControls
					enablePan={false}
					enableZoom={false}
					minPolarAngle={Math.PI / 4}
					maxPolarAngle={Math.PI / 1.8}
				/>
			</Suspense>
		</Canvas>
	);
}
