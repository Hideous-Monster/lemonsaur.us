import { describe, expect, it } from "vitest";
import { ALL_LEMOJIS, DECORATIVE_LEMOJIS, LEMOJI_MAP, lemojiPath } from "./lemoji";

describe("lemoji", () => {
	describe("LEMOJI_MAP", () => {
		it("maps :smile: to lemon_smile", () => {
			expect(LEMOJI_MAP[":smile:"]).toBe("lemon_smile");
		});

		it("maps :) to lemon_smile", () => {
			expect(LEMOJI_MAP[":)"]).toBe("lemon_smile");
		});

		it("maps :D to lemon_happy", () => {
			expect(LEMOJI_MAP[":D"]).toBe("lemon_happy");
		});

		it("has entries for all text emoticons", () => {
			const emoticons = [":)", ":D", ";)", ":(", ":P", ":O", "xD", "XD", ":/", "B)"];
			for (const e of emoticons) {
				expect(LEMOJI_MAP[e]).toBeDefined();
			}
		});
	});

	describe("ALL_LEMOJIS", () => {
		it("contains all lemoji names referenced in the map", () => {
			const mapped = new Set(Object.values(LEMOJI_MAP));
			for (const name of mapped) {
				expect(ALL_LEMOJIS).toContain(name);
			}
		});

		it("has 45 entries", () => {
			expect(ALL_LEMOJIS).toHaveLength(45);
		});
	});

	describe("DECORATIVE_LEMOJIS", () => {
		it("is a subset of ALL_LEMOJIS", () => {
			for (const name of DECORATIVE_LEMOJIS) {
				expect(ALL_LEMOJIS).toContain(name);
			}
		});

		it("contains only positive lemojis", () => {
			const negative = ["lemon_enraged", "lemon_scared", "lemon_angrysad", "lemon_grumpy"];
			for (const name of negative) {
				expect(DECORATIVE_LEMOJIS).not.toContain(name);
			}
		});
	});

	describe("lemojiPath", () => {
		it("returns the correct public path", () => {
			expect(lemojiPath("lemon_happy")).toBe("/images/lemoji/lemon_happy.png");
		});
	});
});
