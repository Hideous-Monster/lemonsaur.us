import { describe, expect, it } from "vitest";
import {
	ACCESSORIES,
	BODY_SHAPES,
	CATEGORY_OPTIONS,
	COLOR_NAMES,
	cycleOption,
	DEFAULT_CHARACTER,
	EXPRESSIONS,
	HATS,
	randomCharacter,
} from "./character";

describe("character types", () => {
	describe("DEFAULT_CHARACTER", () => {
		it("has valid values for all categories", () => {
			expect(BODY_SHAPES).toContain(DEFAULT_CHARACTER.body);
			expect(EXPRESSIONS).toContain(DEFAULT_CHARACTER.expression);
			expect(HATS).toContain(DEFAULT_CHARACTER.hat);
			expect(ACCESSORIES).toContain(DEFAULT_CHARACTER.accessory);
			expect(COLOR_NAMES).toContain(DEFAULT_CHARACTER.color);
		});
	});

	describe("CATEGORY_OPTIONS", () => {
		it("maps every category to its options array", () => {
			expect(CATEGORY_OPTIONS.body).toBe(BODY_SHAPES);
			expect(CATEGORY_OPTIONS.expression).toBe(EXPRESSIONS);
			expect(CATEGORY_OPTIONS.hat).toBe(HATS);
			expect(CATEGORY_OPTIONS.accessory).toBe(ACCESSORIES);
			expect(CATEGORY_OPTIONS.color).toBe(COLOR_NAMES);
		});
	});

	describe("cycleOption", () => {
		it("cycles forward through options", () => {
			const result = cycleOption(DEFAULT_CHARACTER, "body", 1);
			expect(result.body).toBe("elongated");
			expect(result.expression).toBe(DEFAULT_CHARACTER.expression);
		});

		it("cycles backward through options", () => {
			const result = cycleOption(DEFAULT_CHARACTER, "body", -1);
			expect(result.body).toBe("bumpy");
		});

		it("wraps around at the end", () => {
			const config = { ...DEFAULT_CHARACTER, body: "bumpy" as const };
			const result = cycleOption(config, "body", 1);
			expect(result.body).toBe("round");
		});

		it("wraps around at the beginning", () => {
			const config = { ...DEFAULT_CHARACTER, body: "round" as const };
			const result = cycleOption(config, "body", -1);
			expect(result.body).toBe("bumpy");
		});

		it("does not mutate original config", () => {
			const original = { ...DEFAULT_CHARACTER };
			cycleOption(original, "body", 1);
			expect(original).toEqual(DEFAULT_CHARACTER);
		});
	});

	describe("randomCharacter", () => {
		it("returns a valid character config", () => {
			const config = randomCharacter();
			expect(BODY_SHAPES).toContain(config.body);
			expect(EXPRESSIONS).toContain(config.expression);
			expect(HATS).toContain(config.hat);
			expect(ACCESSORIES).toContain(config.accessory);
			expect(COLOR_NAMES).toContain(config.color);
		});

		it("has all required keys", () => {
			const config = randomCharacter();
			expect(Object.keys(config).sort()).toEqual([
				"accessory",
				"body",
				"color",
				"expression",
				"hat",
			]);
		});
	});
});
