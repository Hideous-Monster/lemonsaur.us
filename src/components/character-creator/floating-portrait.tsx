"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Same portrait data as character-creator.tsx ──────────────────────────────

interface CharacterConfig {
	features: number;
	hair: number;
	beard: number;
	mustache: number;
	hairColor: number;
}

const FEATURES = [
	{ label: "Young", path: "/images/portrait/base_young.png" },
	{ label: "Old", path: "/images/portrait/base_old.png" },
];
const HAIR = [
	{ label: "Baldness", path: "/images/portrait/hair/baldness" },
	{ label: "Hipster Hairdo", path: "/images/portrait/hair/hipster_hairdo" },
	{ label: "Santa Hat", path: "/images/portrait/hair/santa_hat" },
];
const BEARD = [
	{ label: "Babyface", path: "/images/portrait/beard/babyface" },
	{ label: "Short Beard", path: "/images/portrait/beard/short_beard" },
	{ label: "Long Beard", path: "/images/portrait/beard/long_beard" },
];
const MUSTACHE = [
	{ label: "No Stache", path: "/images/portrait/mustache/no_stache" },
	{ label: "Postman Stache", path: "/images/portrait/mustache/postman_stache" },
	{ label: "Hulk Hogan Stache", path: "/images/portrait/mustache/hulk_hogan_stache" },
];
const HAIR_COLORS = [
	{ label: "Brown", file: "brown.png" },
	{ label: "Ginger", file: "ginger.png" },
	{ label: "White", file: "white.png" },
];

const STORAGE_KEY = "lemon-character";

function loadConfig(): CharacterConfig {
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			const p = JSON.parse(saved) as Partial<CharacterConfig>;
			return {
				features: typeof p.features === "number" ? p.features % FEATURES.length : 0,
				hair: typeof p.hair === "number" ? p.hair % HAIR.length : 0,
				beard: typeof p.beard === "number" ? p.beard % BEARD.length : 0,
				mustache: typeof p.mustache === "number" ? p.mustache % MUSTACHE.length : 0,
				hairColor: typeof p.hairColor === "number" ? p.hairColor % HAIR_COLORS.length : 0,
			};
		}
	} catch {
		// ignore
	}
	return {
		features: Math.floor(Math.random() * FEATURES.length),
		hair: Math.floor(Math.random() * HAIR.length),
		beard: Math.floor(Math.random() * BEARD.length),
		mustache: Math.floor(Math.random() * MUSTACHE.length),
		hairColor: Math.floor(Math.random() * HAIR_COLORS.length),
	};
}

function getLayerUrls(config: CharacterConfig): string[] {
	const color = HAIR_COLORS[config.hairColor]!.file;
	return [
		FEATURES[config.features]!.path,
		`${HAIR[config.hair]!.path}/${color}`,
		`${BEARD[config.beard]!.path}/${color}`,
		`${MUSTACHE[config.mustache]!.path}/${color}`,
	];
}

// ─── Floating portrait on the Lemon 95 desktop ───────────────────────────────

const CATEGORIES = [
	{ key: "features" as const, label: "Age", len: FEATURES.length },
	{ key: "hair" as const, label: "Hair", len: HAIR.length },
	{ key: "beard" as const, label: "Beard", len: BEARD.length },
	{ key: "mustache" as const, label: "Stache", len: MUSTACHE.length },
	{ key: "hairColor" as const, label: "Color", len: HAIR_COLORS.length },
];

function getLabelForKey(key: keyof CharacterConfig, idx: number): string {
	if (key === "features") return FEATURES[idx]?.label ?? "?";
	if (key === "hair") return HAIR[idx]?.label ?? "?";
	if (key === "beard") return BEARD[idx]?.label ?? "?";
	if (key === "mustache") return MUSTACHE[idx]?.label ?? "?";
	return HAIR_COLORS[idx]?.label ?? "?";
}

interface FloatingPortraitProps {
	onClose: () => void;
}

export function FloatingPortrait({ onClose }: FloatingPortraitProps) {
	const [config, setConfig] = useState<CharacterConfig>(loadConfig);
	const [showControls, setShowControls] = useState(false);
	const [pos, setPos] = useState({ x: 100, y: 60 });
	const dragRef = useRef<{
		startX: number;
		startY: number;
		startPosX: number;
		startPosY: number;
	} | null>(null);
	const movedRef = useRef(false);

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
	}, [config]);

	const cycle = useCallback((key: keyof CharacterConfig, max: number, dir: 1 | -1) => {
		setConfig((prev) => ({
			...prev,
			[key]: (prev[key] + dir + max) % max,
		}));
	}, []);

	// Drag handlers
	const handlePointerDown = useCallback(
		(e: React.PointerEvent) => {
			dragRef.current = {
				startX: e.clientX,
				startY: e.clientY,
				startPosX: pos.x,
				startPosY: pos.y,
			};
			movedRef.current = false;
			(e.target as HTMLElement).setPointerCapture(e.pointerId);
		},
		[pos],
	);

	const handlePointerMove = useCallback((e: React.PointerEvent) => {
		if (!dragRef.current) return;
		const dx = e.clientX - dragRef.current.startX;
		const dy = e.clientY - dragRef.current.startY;
		if (Math.abs(dx) > 3 || Math.abs(dy) > 3) movedRef.current = true;
		setPos({ x: dragRef.current.startPosX + dx, y: dragRef.current.startPosY + dy });
	}, []);

	const handlePointerUp = useCallback(() => {
		if (!movedRef.current) {
			setShowControls((v) => !v);
		}
		dragRef.current = null;
	}, []);

	const layers = getLayerUrls(config);

	return (
		<div
			style={{
				position: "absolute",
				left: pos.x,
				top: pos.y,
				zIndex: 999,
				cursor: "grab",
				userSelect: "none",
			}}
		>
			{/* The portrait itself */}
			<div
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				style={{
					position: "relative",
					width: 180,
					height: 270,
					overflow: "hidden",
					filter: "drop-shadow(4px 6px 12px rgba(0,0,0,0.5))",
				}}
			>
				{layers.map((src, i) => (
					// biome-ignore lint/performance/noImgElement: layered sprite overlays
					<img
						key={src}
						src={src}
						alt=""
						draggable={false}
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							width: "100%",
							height: "auto",
							zIndex: i,
							pointerEvents: "none",
						}}
					/>
				))}
			</div>

			{/* Controls popover */}
			{showControls && (
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 190,
						background: "#c0c0c0",
						border: "2px outset #ffffff",
						padding: "6px 8px",
						fontFamily: "'Tahoma', 'Segoe UI', Arial, sans-serif",
						fontSize: 11,
						display: "flex",
						flexDirection: "column",
						gap: 3,
						whiteSpace: "nowrap",
						zIndex: 1000,
					}}
				>
					{CATEGORIES.map((cat) => (
						<div key={cat.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
							<span style={{ width: 42, color: "#333", fontWeight: "bold" }}>{cat.label}:</span>
							<button type="button" onClick={() => cycle(cat.key, cat.len, -1)} style={win95Btn}>
								◄
							</button>
							<span style={{ width: 90, textAlign: "center", fontSize: 10 }}>
								{getLabelForKey(cat.key, config[cat.key])}
							</span>
							<button type="button" onClick={() => cycle(cat.key, cat.len, 1)} style={win95Btn}>
								►
							</button>
						</div>
					))}
					<div
						style={{
							borderTop: "1px solid #808080",
							marginTop: 2,
							paddingTop: 4,
							display: "flex",
							gap: 4,
						}}
					>
						<button
							type="button"
							style={{ ...win95Btn, flex: 1, fontSize: 10 }}
							onClick={() =>
								setConfig({
									features: Math.floor(Math.random() * FEATURES.length),
									hair: Math.floor(Math.random() * HAIR.length),
									beard: Math.floor(Math.random() * BEARD.length),
									mustache: Math.floor(Math.random() * MUSTACHE.length),
									hairColor: Math.floor(Math.random() * HAIR_COLORS.length),
								})
							}
						>
							Random
						</button>
						<button type="button" style={{ ...win95Btn, flex: 1, fontSize: 10 }} onClick={onClose}>
							Close
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

const win95Btn: React.CSSProperties = {
	background: "#c0c0c0",
	border: "2px outset #ffffff",
	fontFamily: "'Tahoma', 'Segoe UI', Arial, sans-serif",
	fontSize: 11,
	cursor: "pointer",
	padding: "1px 6px",
	lineHeight: 1.2,
};
