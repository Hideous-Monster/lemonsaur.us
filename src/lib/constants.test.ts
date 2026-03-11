import { describe, expect, it } from "vitest";
import {
	BRAND_IMAGES,
	NAV_LINKS,
	SITE_DESCRIPTION,
	SITE_NAME,
	SITE_URL,
	SOCIAL_LINKS,
} from "./constants";

describe("constants", () => {
	it("exports a valid site name", () => {
		expect(SITE_NAME).toBe("lemonsaur.us");
	});

	it("exports a valid site URL", () => {
		expect(SITE_URL).toMatch(/^https:\/\//);
	});

	it("exports a site description", () => {
		expect(SITE_DESCRIPTION).toBeTruthy();
		expect(typeof SITE_DESCRIPTION).toBe("string");
	});

	it("exports social links with required fields", () => {
		expect(SOCIAL_LINKS.length).toBeGreaterThan(0);
		for (const link of SOCIAL_LINKS) {
			expect(link.name).toBeTruthy();
			expect(link.url).toMatch(/^https:\/\//);
			expect(link.icon).toBeDefined();
		}
	});

	it("exports brand images", () => {
		expect(BRAND_IMAGES.length).toBeGreaterThan(0);
		for (const img of BRAND_IMAGES) {
			expect(img).toMatch(/^\/images\/brand\//);
		}
	});

	it("exports nav links with valid hrefs", () => {
		expect(NAV_LINKS.length).toBeGreaterThan(0);
		for (const link of NAV_LINKS) {
			expect(link.label).toBeTruthy();
			expect(link.href).toMatch(/^\//);
		}
	});
});
