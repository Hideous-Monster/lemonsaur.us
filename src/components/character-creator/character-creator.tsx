"use client";

import { useCallback, useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CharacterConfig {
	features: number;
	hair: number;
	beard: number;
	mustache: number;
	hairColor: number;
}

interface PortraitOption {
	label: string;
	path: string; // path without color suffix for hair/beard/mustache
}

// ─── Portrait component data (mirrors the old Django system) ──────────────────

const FEATURES: PortraitOption[] = [
	{ label: "Young", path: "/images/portrait/base_young.png" },
	{ label: "Old", path: "/images/portrait/base_old.png" },
];

const HAIR: PortraitOption[] = [
	{ label: "Baldness", path: "/images/portrait/hair/baldness" },
	{ label: "Hipster Hairdo", path: "/images/portrait/hair/hipster_hairdo" },
	{ label: "Santa Hat", path: "/images/portrait/hair/santa_hat" },
];

const BEARD: PortraitOption[] = [
	{ label: "Babyface", path: "/images/portrait/beard/babyface" },
	{ label: "Short Beard", path: "/images/portrait/beard/short_beard" },
	{ label: "Long Beard", path: "/images/portrait/beard/long_beard" },
];

const MUSTACHE: PortraitOption[] = [
	{ label: "No Stache", path: "/images/portrait/mustache/no_stache" },
	{ label: "Postman Stache", path: "/images/portrait/mustache/postman_stache" },
	{ label: "Hulk Hogan Stache", path: "/images/portrait/mustache/hulk_hogan_stache" },
];

const HAIR_COLORS = [
	{ label: "Brown", file: "brown.png" },
	{ label: "Ginger", file: "ginger.png" },
	{ label: "White", file: "white.png" },
];

const CATEGORIES = [
	{ key: "features" as const, label: "AGE", options: FEATURES },
	{ key: "hair" as const, label: "HAIR", options: HAIR },
	{ key: "beard" as const, label: "BEARD", options: BEARD },
	{ key: "mustache" as const, label: "STACHE", options: MUSTACHE },
	{ key: "hairColor" as const, label: "COLOR", options: HAIR_COLORS },
];

const DEFAULT_CONFIG: CharacterConfig = {
	features: 0,
	hair: 0,
	beard: 0,
	mustache: 0,
	hairColor: 0,
};

const STORAGE_KEY = "lemon-character";

function randomConfig(): CharacterConfig {
	return {
		features: Math.floor(Math.random() * FEATURES.length),
		hair: Math.floor(Math.random() * HAIR.length),
		beard: Math.floor(Math.random() * BEARD.length),
		mustache: Math.floor(Math.random() * MUSTACHE.length),
		hairColor: Math.floor(Math.random() * HAIR_COLORS.length),
	};
}

// ─── Resolve image URLs for current config ───────────────────────────────────

function getLayerUrls(config: CharacterConfig): string[] {
	const color = HAIR_COLORS[config.hairColor]!.file;
	const features = FEATURES[config.features]!.path;
	const hair = `${HAIR[config.hair]!.path}/${color}`;
	const beard = `${BEARD[config.beard]!.path}/${color}`;
	const mustache = `${MUSTACHE[config.mustache]!.path}/${color}`;

	// Layer order (bottom to top): features, hair, beard, mustache
	return [features, hair, beard, mustache];
}

// ─── Component ───────────────────────────────────────────────────────────────

interface CharacterCreatorProps {
	onExit?: () => void;
}

export function CharacterCreator({ onExit }: CharacterCreatorProps) {
	const [config, setConfig] = useState<CharacterConfig>(DEFAULT_CONFIG);

	// Load saved config
	useEffect(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				const parsed = JSON.parse(saved) as Partial<CharacterConfig>;
				setConfig({
					features: typeof parsed.features === "number" ? parsed.features % FEATURES.length : 0,
					hair: typeof parsed.hair === "number" ? parsed.hair % HAIR.length : 0,
					beard: typeof parsed.beard === "number" ? parsed.beard % BEARD.length : 0,
					mustache: typeof parsed.mustache === "number" ? parsed.mustache % MUSTACHE.length : 0,
					hairColor:
						typeof parsed.hairColor === "number" ? parsed.hairColor % HAIR_COLORS.length : 0,
				});
			} else {
				setConfig(randomConfig());
			}
		} catch {
			setConfig(randomConfig());
		}
	}, []);

	// Save on change
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
	}, [config]);

	// ESC to exit
	useEffect(() => {
		if (!onExit) return;
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") onExit?.();
		}
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [onExit]);

	const cycle = useCallback((key: keyof CharacterConfig, max: number, dir: 1 | -1) => {
		setConfig((prev) => ({
			...prev,
			[key]: (prev[key] + dir + max) % max,
		}));
	}, []);

	const layers = getLayerUrls(config);

	return (
		<div style={styles.root}>
			{/* Header */}
			<div style={styles.header}>
				<span style={styles.headerTitle}>CHARACTER CREATOR</span>
				{onExit && (
					<button type="button" style={styles.exitBtn} onClick={onExit}>
						ESC
					</button>
				)}
			</div>

			{/* Body */}
			<div style={styles.body}>
				{/* Portrait preview — layered sprites */}
				<div style={styles.previewWrap}>
					<div style={styles.portraitFrame}>
						{layers.map((src, i) => (
							// biome-ignore lint/performance/noImgElement: layered sprite overlays need vanilla img
							<img
								key={src}
								src={src}
								alt=""
								style={{
									...styles.layer,
									zIndex: i,
								}}
							/>
						))}
					</div>
					<span style={styles.previewLabel}>PREVIEW</span>
				</div>

				{/* Controls */}
				<div style={styles.controls}>
					{CATEGORIES.map((cat) => {
						const opts =
							cat.key === "hairColor"
								? HAIR_COLORS
								: cat.key === "features"
									? FEATURES
									: cat.key === "hair"
										? HAIR
										: cat.key === "beard"
											? BEARD
											: MUSTACHE;
						const current = config[cat.key];
						const label = (opts[current] as { label: string })?.label ?? "?";

						return (
							<Selector
								key={cat.key}
								label={cat.label}
								value={label}
								onPrev={() => cycle(cat.key, opts.length, -1)}
								onNext={() => cycle(cat.key, opts.length, 1)}
							/>
						);
					})}

					<div style={styles.divider} />

					<div style={styles.actionRow}>
						<button
							type="button"
							style={styles.actionBtn}
							onClick={() => setConfig(randomConfig())}
						>
							RANDOMIZE
						</button>
						<button
							type="button"
							style={styles.actionBtn}
							onClick={() => setConfig(DEFAULT_CONFIG)}
						>
							RESET
						</button>
					</div>

					<div style={styles.hint}>
						{onExit ? "ESC to exit" : "Click portrait in About to return"}
					</div>
				</div>
			</div>
		</div>
	);
}

// ─── Selector sub-component ──────────────────────────────────────────────────

interface SelectorProps {
	label: string;
	value: string;
	onPrev: () => void;
	onNext: () => void;
}

function Selector({ label, value, onPrev, onNext }: SelectorProps) {
	return (
		<div style={styles.selectorRow}>
			<span style={styles.selectorLabel}>{label}:</span>
			<button type="button" style={styles.arrowBtn} onClick={onPrev}>
				{"<"}
			</button>
			<span style={styles.selectorValue}>{value.toUpperCase()}</span>
			<button type="button" style={styles.arrowBtn} onClick={onNext}>
				{">"}
			</button>
		</div>
	);
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const GREEN = "#40b848";
const YELLOW = "#e8e040";
const DIM = "#4a6a4a";
const FONT = "'Courier New', Courier, monospace";

const styles: Record<string, React.CSSProperties> = {
	root: {
		display: "flex",
		flexDirection: "column",
		flex: 1,
		background: "#0a140a",
		color: GREEN,
		fontFamily: FONT,
		fontSize: 13,
		padding: 16,
		overflow: "auto",
	},
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		borderBottom: `1px solid ${DIM}`,
		paddingBottom: 8,
		marginBottom: 16,
		flexShrink: 0,
	},
	headerTitle: {
		color: YELLOW,
		fontWeight: "bold",
		letterSpacing: 1,
		fontSize: 13,
	},
	exitBtn: {
		background: "none",
		border: `1px solid ${DIM}`,
		color: DIM,
		fontFamily: FONT,
		fontSize: 12,
		cursor: "pointer",
		padding: "2px 8px",
	},
	body: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		flex: 1,
		gap: 12,
		minHeight: 0,
	},
	previewWrap: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		flex: 1,
		minHeight: 0,
		gap: 6,
	},
	portraitFrame: {
		position: "relative",
		aspectRatio: "412 / 619",
		flex: 1,
		minHeight: 0,
		maxHeight: "100%",
		width: "auto",
		border: `2px solid ${YELLOW}`,
		outline: `2px solid ${YELLOW}`,
		outlineOffset: 3,
		background: "#0a140a",
		overflow: "hidden",
	},
	layer: {
		position: "absolute",
		top: 0,
		left: 0,
		width: "100%",
		height: "auto",
		pointerEvents: "none",
	},
	previewLabel: {
		color: DIM,
		fontSize: 11,
		letterSpacing: 2,
	},
	controls: {
		display: "flex",
		flexDirection: "column",
		gap: 6,
		width: "100%",
		maxWidth: 500,
		flexShrink: 0,
	},
	selectorRow: {
		display: "flex",
		alignItems: "center",
		gap: 6,
	},
	selectorLabel: {
		color: DIM,
		width: 58,
		flexShrink: 0,
		textAlign: "right",
	},
	arrowBtn: {
		background: "none",
		border: `1px solid ${GREEN}`,
		color: GREEN,
		fontFamily: FONT,
		fontSize: 14,
		cursor: "pointer",
		padding: "2px 8px",
		lineHeight: 1,
		flexShrink: 0,
	},
	selectorValue: {
		color: YELLOW,
		flex: 1,
		textAlign: "center",
		letterSpacing: 1,
		fontSize: 12,
		minWidth: 100,
	},
	divider: {
		borderTop: `1px solid ${DIM}`,
		margin: "4px 0",
	},
	actionRow: {
		display: "flex",
		gap: 10,
	},
	actionBtn: {
		background: "none",
		border: `1px solid ${GREEN}`,
		color: GREEN,
		fontFamily: FONT,
		fontSize: 12,
		cursor: "pointer",
		padding: "4px 14px",
		letterSpacing: 1,
		flex: 1,
	},
	hint: {
		color: DIM,
		fontSize: 11,
		marginTop: 4,
	},
};
