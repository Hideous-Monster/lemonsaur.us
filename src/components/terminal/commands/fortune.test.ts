import { describe, expect, it } from "vitest";
import { generateFortune } from "./fortune";

describe("generateFortune", () => {
	it("returns an uppercase string", () => {
		const fortune = generateFortune();
		expect(fortune).toBe(fortune.toUpperCase());
	});

	it("ends with a period", () => {
		for (let i = 0; i < 50; i++) {
			expect(generateFortune()).toMatch(/\.$/);
		}
	});

	it("produces varied output", () => {
		const results = new Set<string>();
		for (let i = 0; i < 100; i++) {
			results.add(generateFortune());
		}
		expect(results.size).toBeGreaterThan(20);
	});

	it("uses correct a/an articles", () => {
		for (let i = 0; i < 200; i++) {
			const fortune = generateFortune();
			// "AN" should only appear before vowels, "A" before consonants
			for (const match of fortune.matchAll(/\bAN? (\w)/g)) {
				const article = match[0].split(" ")[0];
				const nextChar = match[1]!;
				if ("AEIOU".includes(nextChar)) {
					expect(article).toBe("AN");
				} else {
					expect(article).toBe("A");
				}
			}
		}
	});
});
