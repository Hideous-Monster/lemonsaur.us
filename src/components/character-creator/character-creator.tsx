"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type HairOption =
	| "None"
	| "Mohawk"
	| "Mullet"
	| "Pompadour"
	| "Bowl Cut"
	| "Long Hair"
	| "Beanie"
	| "Cowboy Hat"
	| "Afro"
	| "Crown";

type OutfitOption =
	| "Default"
	| "Suit"
	| "Hawaiian"
	| "Leather Jacket"
	| "Hoodie"
	| "Tuxedo"
	| "Lab Coat"
	| "Armor";

type AgeOption = "Baby" | "Kid" | "Teen" | "Adult" | "Elder";

interface CharacterConfig {
	hair: HairOption;
	outfit: OutfitOption;
	age: AgeOption;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HAIR_OPTIONS: HairOption[] = [
	"None",
	"Mohawk",
	"Mullet",
	"Pompadour",
	"Bowl Cut",
	"Long Hair",
	"Beanie",
	"Cowboy Hat",
	"Afro",
	"Crown",
];

const OUTFIT_OPTIONS: OutfitOption[] = [
	"Default",
	"Suit",
	"Hawaiian",
	"Leather Jacket",
	"Hoodie",
	"Tuxedo",
	"Lab Coat",
	"Armor",
];

const AGE_OPTIONS: AgeOption[] = ["Baby", "Kid", "Teen", "Adult", "Elder"];

const DEFAULT_CONFIG: CharacterConfig = {
	hair: "None",
	outfit: "Default",
	age: "Adult",
};

const STORAGE_KEY = "lemon-character";

// Canvas dimensions
const W = 200;
const H = 200;

// ─── Drawing functions ─────────────────────────────────────────────────────────

function drawBase(ctx: CanvasRenderingContext2D, age: AgeOption): void {
	const cx = W / 2;
	let cy = 115;
	let rx = 52;
	let ry = 62;

	if (age === "Baby") {
		cy = 120;
		rx = 40;
		ry = 48;
	} else if (age === "Kid") {
		rx = 46;
		ry = 56;
	}

	// Shadow
	ctx.fillStyle = "rgba(0,0,0,0.18)";
	ctx.beginPath();
	ctx.ellipse(cx + 4, cy + 5, rx, ry, 0, 0, Math.PI * 2);
	ctx.fill();

	// Body — lemon yellow
	const bodyColor = age === "Elder" ? "#d8c818" : "#e8d020";
	ctx.fillStyle = bodyColor;
	ctx.beginPath();
	ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
	ctx.fill();

	// Highlight
	ctx.fillStyle = "rgba(255,255,255,0.22)";
	ctx.beginPath();
	ctx.ellipse(cx - 16, cy - 22, rx * 0.42, ry * 0.32, -0.3, 0, Math.PI * 2);
	ctx.fill();

	// Lemon tips (pointy bumps top and bottom)
	ctx.fillStyle = bodyColor;
	ctx.beginPath();
	ctx.ellipse(cx, cy - ry + 4, 10, 10, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(cx, cy + ry - 4, 8, 8, 0, 0, Math.PI * 2);
	ctx.fill();
}

function drawFace(ctx: CanvasRenderingContext2D, age: AgeOption): void {
	const cx = W / 2;
	let cy = 115;
	let eyeY = 107;
	let eyeSpacing = 16;
	let eyeR = 3.5;
	let smileY = 126;
	let smileW = 18;

	if (age === "Baby") {
		cy = 120;
		eyeY = 116;
		eyeSpacing = 12;
		eyeR = 3;
		smileY = 130;
		smileW = 12;
	} else if (age === "Kid") {
		eyeR = 3.5;
		smileW = 16;
	}

	// Eyes (black dots)
	ctx.fillStyle = "#1a1a1a";
	ctx.beginPath();
	ctx.arc(cx - eyeSpacing, eyeY, eyeR, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(cx + eyeSpacing, eyeY, eyeR, 0, Math.PI * 2);
	ctx.fill();

	// Eye shine
	ctx.fillStyle = "rgba(255,255,255,0.7)";
	ctx.beginPath();
	ctx.arc(cx - eyeSpacing + 1.2, eyeY - 1.2, 1.2, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(cx + eyeSpacing + 1.2, eyeY - 1.2, 1.2, 0, Math.PI * 2);
	ctx.fill();

	// Smile
	ctx.strokeStyle = "#1a1a1a";
	ctx.lineWidth = 2;
	ctx.lineCap = "round";
	ctx.beginPath();
	ctx.arc(cx, smileY - 6, smileW, 0.2, Math.PI - 0.2);
	ctx.stroke();

	// Age-specific face features
	if (age === "Baby") {
		// Pacifier
		ctx.fillStyle = "#e05050";
		ctx.fillRect(cx - 6, smileY + 2, 12, 8);
		ctx.fillStyle = "#c04040";
		ctx.beginPath();
		ctx.arc(cx, smileY + 6, 5, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#f0a0a0";
		ctx.fillRect(cx - 2, smileY + 8, 4, 6);
	}

	if (age === "Kid") {
		// Rosy cheeks
		ctx.fillStyle = "rgba(255,120,120,0.28)";
		ctx.beginPath();
		ctx.ellipse(cx - eyeSpacing - 10, eyeY + 8, 10, 7, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.beginPath();
		ctx.ellipse(cx + eyeSpacing + 10, eyeY + 8, 10, 7, 0, 0, Math.PI * 2);
		ctx.fill();
	}

	if (age === "Teen") {
		// A couple of acne dots
		ctx.fillStyle = "#c05050";
		ctx.beginPath();
		ctx.arc(cx + 30, eyeY + 14, 2, 0, Math.PI * 2);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(cx - 26, eyeY + 20, 1.5, 0, Math.PI * 2);
		ctx.fill();
	}

	if (age === "Elder") {
		// Bushy eyebrows
		ctx.strokeStyle = "#888888";
		ctx.lineWidth = 4;
		ctx.lineCap = "round";
		ctx.beginPath();
		ctx.moveTo(cx - eyeSpacing - 8, eyeY - 10);
		ctx.lineTo(cx - eyeSpacing + 8, eyeY - 8);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(cx + eyeSpacing - 8, eyeY - 8);
		ctx.lineTo(cx + eyeSpacing + 8, eyeY - 10);
		ctx.stroke();

		// Reading glasses
		ctx.strokeStyle = "#888888";
		ctx.lineWidth = 1.5;
		// Left lens
		ctx.strokeRect(cx - eyeSpacing - 9, eyeY - 7, 18, 12);
		// Right lens
		ctx.strokeRect(cx + eyeSpacing - 9, eyeY - 7, 18, 12);
		// Bridge
		ctx.beginPath();
		ctx.moveTo(cx - eyeSpacing + 9, eyeY - 1);
		ctx.lineTo(cx + eyeSpacing - 9, eyeY - 1);
		ctx.stroke();
		// Temple left
		ctx.beginPath();
		ctx.moveTo(cx - eyeSpacing - 9, eyeY - 1);
		ctx.lineTo(cx - eyeSpacing - 22, eyeY + 4);
		ctx.stroke();
		// Temple right
		ctx.beginPath();
		ctx.moveTo(cx + eyeSpacing + 9, eyeY - 1);
		ctx.lineTo(cx + eyeSpacing + 22, eyeY + 4);
		ctx.stroke();
	}

	// Void — reference for cy
	void cy;
}

function drawOutfit(ctx: CanvasRenderingContext2D, outfit: OutfitOption, age: AgeOption): void {
	const cx = W / 2;
	let bodyBottom = 175;
	let bodyTop = 150;
	let bodyHalfW = 44;

	if (age === "Baby") {
		bodyBottom = 168;
		bodyTop = 158;
		bodyHalfW = 34;
	} else if (age === "Kid") {
		bodyHalfW = 40;
	}

	if (outfit === "Default") return;

	if (outfit === "Suit") {
		// Dark jacket
		ctx.fillStyle = "#222244";
		ctx.fillRect(cx - bodyHalfW, bodyTop, bodyHalfW * 2, bodyBottom - bodyTop);
		// White shirt center
		ctx.fillStyle = "#f0f0f0";
		ctx.fillRect(cx - 8, bodyTop, 16, bodyBottom - bodyTop);
		// Lapels
		ctx.fillStyle = "#222244";
		ctx.beginPath();
		ctx.moveTo(cx, bodyTop);
		ctx.lineTo(cx - 12, bodyTop + 10);
		ctx.lineTo(cx - 8, bodyTop);
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(cx, bodyTop);
		ctx.lineTo(cx + 12, bodyTop + 10);
		ctx.lineTo(cx + 8, bodyTop);
		ctx.fill();
		// Tie — red
		ctx.fillStyle = "#cc2020";
		ctx.fillRect(cx - 4, bodyTop + 4, 8, 20);
		ctx.beginPath();
		ctx.moveTo(cx - 4, bodyTop + 24);
		ctx.lineTo(cx + 4, bodyTop + 24);
		ctx.lineTo(cx, bodyTop + 32);
		ctx.fill();
	}

	if (outfit === "Hawaiian") {
		// Colorful base
		ctx.fillStyle = "#e05820";
		ctx.fillRect(cx - bodyHalfW, bodyTop, bodyHalfW * 2, bodyBottom - bodyTop);
		// Flowers — simple colored blocks
		const flowerPositions = [
			[cx - 28, bodyTop + 5, "#f8e020"],
			[cx + 14, bodyTop + 8, "#20d840"],
			[cx - 10, bodyTop + 16, "#f050a0"],
			[cx + 28, bodyTop + 18, "#40c8f0"],
			[cx - 30, bodyTop + 24, "#f06020"],
			[cx + 8, bodyTop + 28, "#f8e020"],
		] as const;
		for (const [fx, fy, fc] of flowerPositions) {
			ctx.fillStyle = fc;
			ctx.fillRect(fx - 3, fy - 3, 6, 6);
			ctx.fillRect(fx - 5, fy - 1, 10, 2);
			ctx.fillRect(fx - 1, fy - 5, 2, 10);
		}
		// Collar
		ctx.fillStyle = "#c04010";
		ctx.beginPath();
		ctx.moveTo(cx, bodyTop);
		ctx.lineTo(cx - 14, bodyTop + 14);
		ctx.lineTo(cx - 8, bodyTop);
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(cx, bodyTop);
		ctx.lineTo(cx + 14, bodyTop + 14);
		ctx.lineTo(cx + 8, bodyTop);
		ctx.fill();
	}

	if (outfit === "Leather Jacket") {
		ctx.fillStyle = "#1a1a1a";
		ctx.fillRect(cx - bodyHalfW, bodyTop, bodyHalfW * 2, bodyBottom - bodyTop);
		// White shirt under
		ctx.fillStyle = "#e8e8e8";
		ctx.fillRect(cx - 9, bodyTop + 6, 18, bodyBottom - bodyTop - 6);
		// Collar flaps
		ctx.fillStyle = "#1a1a1a";
		ctx.beginPath();
		ctx.moveTo(cx - 8, bodyTop);
		ctx.lineTo(cx - bodyHalfW + 6, bodyTop + 18);
		ctx.lineTo(cx - bodyHalfW, bodyTop);
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(cx + 8, bodyTop);
		ctx.lineTo(cx + bodyHalfW - 6, bodyTop + 18);
		ctx.lineTo(cx + bodyHalfW, bodyTop);
		ctx.fill();
		// Zipper line
		ctx.strokeStyle = "#555555";
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.moveTo(cx, bodyTop + 2);
		ctx.lineTo(cx, bodyBottom);
		ctx.stroke();
	}

	if (outfit === "Hoodie") {
		ctx.fillStyle = "#888899";
		ctx.fillRect(cx - bodyHalfW, bodyTop, bodyHalfW * 2, bodyBottom - bodyTop);
		// Hood outline (drawn behind head — just the sides poking up)
		ctx.fillStyle = "#777788";
		ctx.fillRect(cx - bodyHalfW, bodyTop - 8, 14, 16);
		ctx.fillRect(cx + bodyHalfW - 14, bodyTop - 8, 14, 16);
		// Kangaroo pocket
		ctx.fillStyle = "#777788";
		ctx.fillRect(cx - 18, bodyTop + 16, 36, 14);
		// Center seam
		ctx.strokeStyle = "#666677";
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.moveTo(cx, bodyTop);
		ctx.lineTo(cx, bodyTop + 18);
		ctx.stroke();
	}

	if (outfit === "Tuxedo") {
		ctx.fillStyle = "#111111";
		ctx.fillRect(cx - bodyHalfW, bodyTop, bodyHalfW * 2, bodyBottom - bodyTop);
		// White shirt
		ctx.fillStyle = "#f8f8f8";
		ctx.fillRect(cx - 9, bodyTop, 18, bodyBottom - bodyTop);
		// Lapels
		ctx.fillStyle = "#111111";
		ctx.beginPath();
		ctx.moveTo(cx, bodyTop);
		ctx.lineTo(cx - 14, bodyTop + 12);
		ctx.lineTo(cx - 9, bodyTop);
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(cx, bodyTop);
		ctx.lineTo(cx + 14, bodyTop + 12);
		ctx.lineTo(cx + 9, bodyTop);
		ctx.fill();
		// Bow tie
		ctx.fillStyle = "#111111";
		ctx.beginPath();
		ctx.moveTo(cx - 10, bodyTop + 4);
		ctx.lineTo(cx, bodyTop + 8);
		ctx.lineTo(cx - 10, bodyTop + 12);
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(cx + 10, bodyTop + 4);
		ctx.lineTo(cx, bodyTop + 8);
		ctx.lineTo(cx + 10, bodyTop + 12);
		ctx.fill();
		ctx.fillStyle = "#333333";
		ctx.fillRect(cx - 3, bodyTop + 6, 6, 4);
	}

	if (outfit === "Lab Coat") {
		ctx.fillStyle = "#f4f4f4";
		ctx.fillRect(cx - bodyHalfW, bodyTop, bodyHalfW * 2, bodyBottom - bodyTop);
		// Collar/lapels
		ctx.fillStyle = "#e0e0e0";
		ctx.beginPath();
		ctx.moveTo(cx, bodyTop);
		ctx.lineTo(cx - 16, bodyTop + 16);
		ctx.lineTo(cx - 8, bodyTop);
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(cx, bodyTop);
		ctx.lineTo(cx + 16, bodyTop + 16);
		ctx.lineTo(cx + 8, bodyTop);
		ctx.fill();
		// Pocket left with red pen
		ctx.fillStyle = "#ddd";
		ctx.fillRect(cx - bodyHalfW + 4, bodyTop + 10, 14, 10);
		ctx.fillStyle = "#dd2020";
		ctx.fillRect(cx - bodyHalfW + 10, bodyTop + 8, 3, 4);
		// Buttons
		ctx.fillStyle = "#cccccc";
		for (let i = 0; i < 3; i++) {
			ctx.beginPath();
			ctx.arc(cx + 3, bodyTop + 10 + i * 9, 2, 0, Math.PI * 2);
			ctx.fill();
		}
	}

	if (outfit === "Armor") {
		// Chest plate
		ctx.fillStyle = "#909090";
		ctx.fillRect(cx - bodyHalfW, bodyTop, bodyHalfW * 2, bodyBottom - bodyTop);
		// Center ridge
		ctx.fillStyle = "#b0b0b0";
		ctx.fillRect(cx - 6, bodyTop, 12, bodyBottom - bodyTop);
		// Horizontal plates
		ctx.fillStyle = "#707070";
		for (let i = 0; i < 3; i++) {
			ctx.fillRect(cx - bodyHalfW, bodyTop + 8 + i * 10, bodyHalfW * 2, 2);
		}
		// Pauldrons (shoulder guards)
		ctx.fillStyle = "#a0a0a0";
		ctx.fillRect(cx - bodyHalfW - 6, bodyTop, 10, 20);
		ctx.fillRect(cx + bodyHalfW - 4, bodyTop, 10, 20);
		// Edge highlight
		ctx.strokeStyle = "#d0d0d0";
		ctx.lineWidth = 1.5;
		ctx.strokeRect(cx - bodyHalfW + 1, bodyTop + 1, bodyHalfW * 2 - 2, bodyBottom - bodyTop - 2);
	}
}

function drawHair(ctx: CanvasRenderingContext2D, hair: HairOption, age: AgeOption): void {
	const cx = W / 2;
	const headTop = age === "Baby" ? 72 : 53;
	const headCy = age === "Baby" ? 120 : 115;
	const headRx = age === "Baby" ? 40 : 52;
	const headRy = age === "Baby" ? 48 : 62;

	if (hair === "None") return;

	if (hair === "Mohawk") {
		ctx.fillStyle = "#cc2020";
		// Mohawk spikes — tall thin rectangles fanning up
		const spikes = [
			{ x: cx - 8, w: 6, h: 34, tilt: -2 },
			{ x: cx - 3, w: 7, h: 42, tilt: 0 },
			{ x: cx + 3, w: 6, h: 34, tilt: 2 },
		];
		for (const s of spikes) {
			ctx.save();
			ctx.translate(s.x + s.w / 2, headTop + 2);
			ctx.rotate((s.tilt * Math.PI) / 180);
			ctx.fillRect(-s.w / 2, -s.h, s.w, s.h);
			ctx.restore();
		}
		// Base strip
		ctx.fillRect(cx - 9, headTop - 4, 18, 10);
	}

	if (hair === "Mullet") {
		ctx.fillStyle = "#7a4818";
		// Short top
		ctx.beginPath();
		ctx.ellipse(cx, headTop + 6, headRx - 4, 14, 0, Math.PI, 0);
		ctx.fill();
		// Long back (extends well below head)
		ctx.fillRect(cx - headRx + 8, headTop + 4, (headRx - 8) * 2, 80);
		// Slightly wavy bottom edge
		ctx.fillStyle = "#6a3808";
		ctx.fillRect(cx - headRx + 10, headTop + 76, (headRx - 10) * 2, 8);
	}

	if (hair === "Pompadour") {
		ctx.fillStyle = "#111111";
		// Big swoopy front arch
		ctx.beginPath();
		ctx.moveTo(cx - 30, headTop + 10);
		ctx.bezierCurveTo(cx - 38, headTop - 30, cx + 10, headTop - 50, cx + 34, headTop - 10);
		ctx.bezierCurveTo(cx + 26, headTop - 22, cx - 10, headTop - 38, cx - 20, headTop + 8);
		ctx.fill();
		// Volume mass
		ctx.beginPath();
		ctx.ellipse(cx + 4, headTop - 18, 24, 18, 0.3, 0, Math.PI * 2);
		ctx.fill();
	}

	if (hair === "Bowl Cut") {
		ctx.fillStyle = "#7a4818";
		ctx.beginPath();
		ctx.ellipse(cx, headTop + 12, headRx - 2, 28, 0, Math.PI, 0);
		ctx.fill();
		// Straight fringe bottom line
		ctx.fillStyle = "#6a3808";
		ctx.fillRect(cx - headRx + 2, headTop + 10, (headRx - 2) * 2, 6);
	}

	if (hair === "Long Hair") {
		ctx.fillStyle = "#d4a020";
		// Sides flowing down
		ctx.fillRect(cx - headRx - 4, headTop + 8, 20, 90);
		ctx.fillRect(cx + headRx - 16, headTop + 8, 20, 90);
		// Top dome
		ctx.beginPath();
		ctx.ellipse(cx, headTop + 10, headRx, 20, 0, Math.PI, 0);
		ctx.fill();
		// Wave detail on sides
		ctx.fillStyle = "#c09010";
		for (let i = 0; i < 4; i++) {
			ctx.fillRect(cx - headRx - 2, headTop + 20 + i * 20, 16, 4);
			ctx.fillRect(cx + headRx - 14, headTop + 20 + i * 20, 16, 4);
		}
	}

	if (hair === "Beanie") {
		// Main cap body
		ctx.fillStyle = "#1a2a6a";
		ctx.beginPath();
		ctx.ellipse(cx, headTop + 8, headRx + 2, 28, 0, Math.PI, 0);
		ctx.fill();
		ctx.fillRect(cx - headRx - 2, headTop + 6, (headRx + 2) * 2, 12);
		// Stripe
		ctx.fillStyle = "#e0e030";
		ctx.fillRect(cx - headRx - 2, headTop + 6, (headRx + 2) * 2, 6);
		// Pom-pom
		ctx.fillStyle = "#2a3a8a";
		ctx.beginPath();
		ctx.arc(cx, headTop - 18, 9, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#4050a8";
		ctx.beginPath();
		ctx.arc(cx - 3, headTop - 21, 5, 0, Math.PI * 2);
		ctx.fill();
	}

	if (hair === "Cowboy Hat") {
		ctx.fillStyle = "#7a4a18";
		// Brim
		ctx.beginPath();
		ctx.ellipse(cx, headTop + 6, headRx + 22, 10, 0, 0, Math.PI * 2);
		ctx.fill();
		// Crown
		ctx.fillRect(cx - 22, headTop - 26, 44, 36);
		// Crown rounded top
		ctx.beginPath();
		ctx.ellipse(cx, headTop - 26, 22, 10, 0, 0, Math.PI * 2);
		ctx.fill();
		// Hat band
		ctx.fillStyle = "#4a2a08";
		ctx.fillRect(cx - 22, headTop + 2, 44, 6);
	}

	if (hair === "Afro") {
		ctx.fillStyle = "#2a1a0a";
		// Big round afro
		ctx.beginPath();
		ctx.arc(cx, headCy - 30, headRx + 18, 0, Math.PI * 2);
		ctx.fill();
		// Texture bumps
		ctx.fillStyle = "#3a2a1a";
		const bumpPositions = [
			[cx - 30, headCy - 48],
			[cx - 10, headCy - 58],
			[cx + 18, headCy - 52],
			[cx - 46, headCy - 34],
			[cx + 40, headCy - 36],
			[cx - 52, headCy - 18],
			[cx + 48, headCy - 20],
		] as const;
		for (const [bx, by] of bumpPositions) {
			ctx.beginPath();
			ctx.arc(bx, by, 8, 0, Math.PI * 2);
			ctx.fill();
		}
		void headRy;
	}

	if (hair === "Crown") {
		ctx.fillStyle = "#d4a000";
		// Crown base band
		ctx.fillRect(cx - 28, headTop - 2, 56, 12);
		// Crown points (5 points)
		const points = [-26, -13, 0, 13, 26];
		for (const px of points) {
			ctx.fillRect(cx + px - 4, headTop - 22, 8, 24);
			// Gem on each point
			const gemColors = ["#e04040", "#40c0e0", "#40e040", "#e0a040", "#a040e0"];
			ctx.fillStyle = gemColors[points.indexOf(px) % gemColors.length]!;
			ctx.fillRect(cx + px - 3, headTop - 20, 6, 6);
			ctx.fillStyle = "#d4a000";
		}
		// Outline shimmer
		ctx.strokeStyle = "#f8d040";
		ctx.lineWidth = 1;
		ctx.strokeRect(cx - 28, headTop - 2, 56, 12);
	}

	if (age === "Baby") {
		// Baby bonnet overlay (hair is already non-None due to early return above)
		ctx.fillStyle = "rgba(255,180,200,0.7)";
		ctx.beginPath();
		ctx.ellipse(cx, headTop + 8, headRx, 22, 0, Math.PI, 0);
		ctx.fill();
		// Bonnet ribbon
		ctx.strokeStyle = "#f080a0";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(cx - headRx + 4, headTop + 16);
		ctx.lineTo(cx - headRx - 4, headTop + 30);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(cx + headRx - 4, headTop + 16);
		ctx.lineTo(cx + headRx + 4, headTop + 30);
		ctx.stroke();
	}
}

function drawCharacter(ctx: CanvasRenderingContext2D, config: CharacterConfig): void {
	ctx.clearRect(0, 0, W, H);

	// Dark background
	ctx.fillStyle = "#0a140a";
	ctx.fillRect(0, 0, W, H);

	drawBase(ctx, config.age);
	drawOutfit(ctx, config.outfit, config.age);
	drawHair(ctx, config.hair, config.age);
	drawFace(ctx, config.age);
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface CharacterCreatorProps {
	onExit?: () => void;
}

export function CharacterCreator({ onExit }: CharacterCreatorProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [config, setConfig] = useState<CharacterConfig>(DEFAULT_CONFIG);

	// Load from localStorage on mount
	useEffect(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				const parsed = JSON.parse(saved) as Partial<CharacterConfig>;
				setConfig({
					hair: HAIR_OPTIONS.includes(parsed.hair as HairOption)
						? (parsed.hair as HairOption)
						: DEFAULT_CONFIG.hair,
					outfit: OUTFIT_OPTIONS.includes(parsed.outfit as OutfitOption)
						? (parsed.outfit as OutfitOption)
						: DEFAULT_CONFIG.outfit,
					age: AGE_OPTIONS.includes(parsed.age as AgeOption)
						? (parsed.age as AgeOption)
						: DEFAULT_CONFIG.age,
				});
			}
		} catch {
			// Ignore parse errors
		}
	}, []);

	// Save to localStorage when config changes
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
	}, [config]);

	// Redraw canvas when config changes
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		drawCharacter(ctx, config);
	}, [config]);

	const cycle = useCallback(
		<K extends keyof CharacterConfig>(key: K, options: CharacterConfig[K][], dir: 1 | -1) => {
			setConfig((prev) => {
				const idx = options.indexOf(prev[key]);
				const next = (idx + dir + options.length) % options.length;
				return { ...prev, [key]: options[next] };
			});
		},
		[],
	);

	const randomize = useCallback(() => {
		setConfig({
			hair: HAIR_OPTIONS[Math.floor(Math.random() * HAIR_OPTIONS.length)]!,
			outfit: OUTFIT_OPTIONS[Math.floor(Math.random() * OUTFIT_OPTIONS.length)]!,
			age: AGE_OPTIONS[Math.floor(Math.random() * AGE_OPTIONS.length)]!,
		});
	}, []);

	const reset = useCallback(() => {
		setConfig(DEFAULT_CONFIG);
	}, []);

	// ESC key to exit
	useEffect(() => {
		if (!onExit) return;
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") onExit?.();
		}
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [onExit]);

	return (
		<div style={styles.root}>
			<div style={styles.header}>
				<span style={styles.headerTitle}>* LEMONSAUR CHARACTER CREATOR *</span>
				{onExit && (
					<button type="button" style={styles.exitBtn} onClick={onExit}>
						[ESC]
					</button>
				)}
			</div>

			<div style={styles.body}>
				{/* Canvas preview */}
				<div style={styles.previewWrap}>
					<div style={styles.crtBorder}>
						<canvas ref={canvasRef} width={W} height={H} style={styles.canvas} />
					</div>
					<div style={styles.previewLabel}>PREVIEW</div>
				</div>

				{/* Controls */}
				<div style={styles.controls}>
					<Selector
						label="HAIR"
						value={config.hair}
						onPrev={() => cycle("hair", HAIR_OPTIONS, -1)}
						onNext={() => cycle("hair", HAIR_OPTIONS, 1)}
					/>
					<Selector
						label="OUTFIT"
						value={config.outfit}
						onPrev={() => cycle("outfit", OUTFIT_OPTIONS, -1)}
						onNext={() => cycle("outfit", OUTFIT_OPTIONS, 1)}
					/>
					<Selector
						label="AGE"
						value={config.age}
						onPrev={() => cycle("age", AGE_OPTIONS, -1)}
						onNext={() => cycle("age", AGE_OPTIONS, 1)}
					/>

					<div style={styles.divider} />

					<div style={styles.actionRow}>
						<button type="button" style={styles.actionBtn} onClick={randomize}>
							RANDOMIZE
						</button>
						<button type="button" style={styles.actionBtn} onClick={reset}>
							RESET
						</button>
					</div>

					<div style={styles.hint}>
						{onExit ? "Press ESC to exit" : "Your look is saved automatically"}
					</div>
				</div>
			</div>
		</div>
	);
}

// ─── Selector sub-component ───────────────────────────────────────────────────

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

// ─── Styles ───────────────────────────────────────────────────────────────────

const BASE_FONT = "'Courier New', Courier, monospace";
const GREEN = "#40b848";
const YELLOW = "#e8e040";
const DIM = "#4a6a4a";

const styles: Record<string, React.CSSProperties> = {
	root: {
		background: "#0a140a",
		color: GREEN,
		fontFamily: BASE_FONT,
		fontSize: 13,
		padding: 16,
		maxWidth: 680,
		width: "100%",
		boxSizing: "border-box",
	},
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		borderBottom: `1px solid ${DIM}`,
		paddingBottom: 8,
		marginBottom: 16,
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
		fontFamily: BASE_FONT,
		fontSize: 12,
		cursor: "pointer",
		padding: "2px 8px",
	},
	body: {
		display: "flex",
		gap: 24,
		alignItems: "flex-start",
		flexWrap: "wrap",
	},
	previewWrap: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: 8,
	},
	crtBorder: {
		border: `2px solid ${YELLOW}`,
		outline: `2px solid ${YELLOW}`,
		outlineOffset: 3,
		padding: 4,
		background: "#0a140a",
	},
	canvas: {
		display: "block",
		imageRendering: "pixelated",
		width: W,
		height: H,
	},
	previewLabel: {
		color: DIM,
		fontSize: 11,
		letterSpacing: 2,
	},
	controls: {
		flex: 1,
		minWidth: 240,
		display: "flex",
		flexDirection: "column",
		gap: 10,
		paddingTop: 4,
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
		fontFamily: BASE_FONT,
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
		fontFamily: BASE_FONT,
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
