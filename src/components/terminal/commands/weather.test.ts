import { afterEach, describe, expect, it, vi } from "vitest";
import { weatherCommand } from "./weather";

describe("weatherCommand", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("returns weather data for default city (Oslo)", async () => {
		const mockGeoResponse = {
			results: [{ name: "Oslo", country: "Norway", latitude: 59.91, longitude: 10.75 }],
		};
		const mockWeatherResponse = {
			current: { temperature_2m: 5, relative_humidity_2m: 70, wind_speed_10m: 15, weather_code: 3 },
			daily: {
				time: ["2026-03-15", "2026-03-16", "2026-03-17"],
				temperature_2m_max: [7, 9, 6],
				temperature_2m_min: [2, 3, 1],
				weather_code: [3, 61, 2],
			},
		};

		vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
			const urlStr = typeof url === "string" ? url : url.toString();
			if (urlStr.includes("geocoding")) {
				return Promise.resolve(new Response(JSON.stringify(mockGeoResponse)));
			}
			return Promise.resolve(new Response(JSON.stringify(mockWeatherResponse)));
		});

		const lines = await weatherCommand("");
		const text = lines.map((l) => l.text).join("\n");
		expect(text).toContain("OSLO");
		expect(text).toContain("5°C");
		expect(text).toContain("OVERCAST");
		expect(text).toContain("3-DAY FORECAST");
	});

	it("returns error for unknown city", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ results: [] })));

		const lines = await weatherCommand("xyznotacity");
		expect(lines[0]!.text).toContain("COULD NOT FIND");
	});

	it("handles fetch failures gracefully", async () => {
		vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));

		const lines = await weatherCommand("Oslo");
		expect(lines[0]!.text).toContain("FAILED TO FETCH");
	});

	it("handles unknown weather codes gracefully", async () => {
		const mockWeatherResponse = {
			current: {
				temperature_2m: 10,
				relative_humidity_2m: 50,
				wind_speed_10m: 5,
				weather_code: 999,
			},
			daily: {
				time: ["2026-03-15", "2026-03-16", "2026-03-17", "2026-03-18"],
				temperature_2m_max: [12, 14, 11, 13],
				temperature_2m_min: [5, 6, 4, 5],
				weather_code: [999, 999, 999, 999],
			},
		};

		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(JSON.stringify(mockWeatherResponse)),
		);

		const lines = await weatherCommand("");
		const text = lines.map((l) => l.text).join("\n");
		expect(text).toContain("CODE 999");
	});

	it("geocodes non-Oslo cities", async () => {
		const mockGeoResponse = {
			results: [{ name: "Tokyo", country: "Japan", latitude: 35.68, longitude: 139.69 }],
		};
		const mockWeatherResponse = {
			current: {
				temperature_2m: 18,
				relative_humidity_2m: 55,
				wind_speed_10m: 10,
				weather_code: 1,
			},
			daily: {
				time: ["2026-03-15", "2026-03-16", "2026-03-17"],
				temperature_2m_max: [20, 22, 19],
				temperature_2m_min: [12, 14, 11],
				weather_code: [1, 0, 2],
			},
		};

		vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
			const urlStr = typeof url === "string" ? url : url.toString();
			if (urlStr.includes("geocoding")) {
				return Promise.resolve(new Response(JSON.stringify(mockGeoResponse)));
			}
			return Promise.resolve(new Response(JSON.stringify(mockWeatherResponse)));
		});

		const lines = await weatherCommand("Tokyo");
		const text = lines.map((l) => l.text).join("\n");
		expect(text).toContain("TOKYO");
		expect(text).toContain("JAPAN");
		expect(text).toContain("18°C");
	});
});
