export const BODY_SHAPES = ["round", "elongated", "bumpy"] as const;
export type BodyShape = (typeof BODY_SHAPES)[number];

export const EXPRESSIONS = ["happy", "surprised", "mischievous", "sleepy"] as const;
export type Expression = (typeof EXPRESSIONS)[number];

export const HATS = ["none", "leaf-crown", "sunglasses-on-head", "tiny-umbrella"] as const;
export type Hat = (typeof HATS)[number];

export const ACCESSORIES = ["none", "sunglasses", "monocle", "bow-tie"] as const;
export type Accessory = (typeof ACCESSORIES)[number];

export const COLORS = {
	"classic-yellow": "#FFD700",
	"lime-green": "#A8D948",
	"blood-orange": "#FF6347",
	"pink-lemonade": "#FFB6C1",
} as const;

export type ColorName = keyof typeof COLORS;
export const COLOR_NAMES = Object.keys(COLORS) as ColorName[];

export interface CharacterConfig {
	body: BodyShape;
	expression: Expression;
	hat: Hat;
	accessory: Accessory;
	color: ColorName;
}

export const DEFAULT_CHARACTER: CharacterConfig = {
	body: "round",
	expression: "happy",
	hat: "none",
	accessory: "none",
	color: "classic-yellow",
};

export type CharacterCategory = keyof CharacterConfig;

export const CATEGORY_OPTIONS: Record<CharacterCategory, readonly string[]> = {
	body: BODY_SHAPES,
	expression: EXPRESSIONS,
	hat: HATS,
	accessory: ACCESSORIES,
	color: COLOR_NAMES,
};

export function cycleOption(
	config: CharacterConfig,
	category: CharacterCategory,
	delta: 1 | -1,
): CharacterConfig {
	const options = CATEGORY_OPTIONS[category];
	const currentIndex = options.indexOf(config[category]);
	const nextIndex = (currentIndex + delta + options.length) % options.length;
	return { ...config, [category]: options[nextIndex] };
}

export function randomCharacter(): CharacterConfig {
	const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
	return {
		body: pick(BODY_SHAPES),
		expression: pick(EXPRESSIONS),
		hat: pick(HATS),
		accessory: pick(ACCESSORIES),
		color: pick(COLOR_NAMES),
	};
}
