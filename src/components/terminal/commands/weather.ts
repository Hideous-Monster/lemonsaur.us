import type { TerminalLine } from "./types";

let lineIdCounter = 10000;

function ln(text: string, type: TerminalLine["type"]): TerminalLine {
	return { id: lineIdCounter++, text, type };
}

// WMO weather code → description + ASCII icon
const WMO_CODES: Record<number, { desc: string; icon: string[] }> = {
	0: {
		desc: "CLEAR SKY",
		icon: ["    \\   /    ", "     .-.     ", "  ‒ (   ) ‒  ", "     `-'     ", "    /   \\    "],
	},
	1: {
		desc: "MAINLY CLEAR",
		icon: ["    \\   /    ", "     .-.     ", "  ‒ (   ) ‒  ", "     `-'     ", "    /   \\    "],
	},
	2: {
		desc: "PARTLY CLOUDY",
		icon: ["    \\   /    ", "     .-.     ", "  ‒ (   )    ", "    /`-' .-. ", "       (   ) "],
	},
	3: {
		desc: "OVERCAST",
		icon: ["             ", "     .--.    ", "  .-(    ).  ", " (___.__)__) ", "             "],
	},
	45: {
		desc: "FOG",
		icon: [" _ - _ - _ - ", "  _ - _ - _  ", " _ - _ - _ - ", "  _ - _ - _  ", " _ - _ - _ - "],
	},
	48: {
		desc: "RIME FOG",
		icon: [" _ - _ - _ - ", "  _ - _ - _  ", " _ - _ - _ - ", "  _ - _ - _  ", " _ - _ - _ - "],
	},
	51: {
		desc: "LIGHT DRIZZLE",
		icon: ["     .--.    ", "  .-(    ).  ", " (___.__)__) ", "   ' ' ' '   ", "  ' ' ' '    "],
	},
	53: {
		desc: "DRIZZLE",
		icon: ["     .--.    ", "  .-(    ).  ", " (___.__)__) ", "   ' ' ' '   ", "  ' ' ' '    "],
	},
	55: {
		desc: "HEAVY DRIZZLE",
		icon: ["     .--.    ", "  .-(    ).  ", " (___.__)__) ", "   ' ' ' '   ", "  ' ' ' '    "],
	},
	61: {
		desc: "LIGHT RAIN",
		icon: ["     .--.    ", "  .-(    ).  ", " (___.__)__) ", "   / / / /   ", "  / / / /    "],
	},
	63: {
		desc: "RAIN",
		icon: ["     .--.    ", "  .-(    ).  ", " (___.__)__) ", "   / / / /   ", "  / / / /    "],
	},
	65: {
		desc: "HEAVY RAIN",
		icon: ["     .--.    ", "  .-(    ).  ", " (___.__)__) ", "  /// /// //  ", " /// /// //   "],
	},
	71: {
		desc: "LIGHT SNOW",
		icon: ["     .--.    ", "  .-(    ).  ", " (___.__)__) ", "   *  *  *   ", "  *  *  *    "],
	},
	73: {
		desc: "SNOW",
		icon: ["     .--.    ", "  .-(    ).  ", " (___.__)__) ", "   *  *  *   ", "  *  *  *    "],
	},
	75: {
		desc: "HEAVY SNOW",
		icon: ["     .--.    ", "  .-(    ).  ", " (___.__)__) ", "  ** ** **    ", " ** ** **     "],
	},
	80: {
		desc: "RAIN SHOWERS",
		icon: ["     .--.    ", "  .-(    ).  ", " (___.__)__) ", "   / / / /   ", "  / / / /    "],
	},
	81: {
		desc: "RAIN SHOWERS",
		icon: ["     .--.    ", "  .-(    ).  ", " (___.__)__) ", "   / / / /   ", "  / / / /    "],
	},
	82: {
		desc: "HEAVY SHOWERS",
		icon: ["     .--.    ", "  .-(    ).  ", " (___.__)__) ", "  /// /// //  ", " /// /// //   "],
	},
	95: {
		desc: "THUNDERSTORM",
		icon: ["     .--.    ", "  .-(    ).  ", " (___.__)__) ", "   ⚡/ ⚡/   ", "  / ⚡/ /    "],
	},
};

function getWeatherInfo(code: number): { desc: string; icon: string[] } {
	return (
		WMO_CODES[code] ?? {
			desc: `CODE ${code}`,
			icon: ["     .--.    ", "  .-(    ).  ", " (___.__)__) ", "     ???     ", "             "],
		}
	);
}

interface GeoResult {
	name: string;
	country: string;
	latitude: number;
	longitude: number;
}

interface WeatherData {
	current: {
		temperature_2m: number;
		relative_humidity_2m: number;
		wind_speed_10m: number;
		weather_code: number;
	};
	daily: {
		time: string[];
		temperature_2m_max: number[];
		temperature_2m_min: number[];
		weather_code: number[];
	};
}

async function geocode(city: string): Promise<GeoResult | null> {
	const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
	const resp = await fetch(url);
	const data = (await resp.json()) as { results?: GeoResult[] };
	return data.results?.[0] ?? null;
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
	const url =
		`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
		`&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
		`&daily=temperature_2m_max,temperature_2m_min,weather_code` +
		`&forecast_days=3&timezone=auto`;
	const resp = await fetch(url);
	return (await resp.json()) as WeatherData;
}

export async function weatherCommand(args: string): Promise<TerminalLine[]> {
	const city = args.trim() || "Oslo";

	const lines: TerminalLine[] = [];
	lines.push(ln(`FETCHING WEATHER FOR "${city.toUpperCase()}"...`, "system"));

	try {
		// Default coordinates for Oslo
		let lat = 59.91;
		let lon = 10.75;
		let locationName = "OSLO, NORWAY";

		if (city.toLowerCase() !== "oslo") {
			const geo = await geocode(city);
			if (!geo) {
				return [
					ln(`WEATHER: COULD NOT FIND "${city.toUpperCase()}". TRY A DIFFERENT CITY.`, "system"),
				];
			}
			lat = geo.latitude;
			lon = geo.longitude;
			locationName = `${geo.name.toUpperCase()}, ${geo.country.toUpperCase()}`;
		}

		const data = await fetchWeather(lat, lon);
		const current = data.current;
		const info = getWeatherInfo(current.weather_code);

		lines.length = 0; // clear the "fetching" message

		// Header
		lines.push(ln("", "output"));
		lines.push(ln(`  WEATHER REPORT: ${locationName}`, "system"));
		lines.push(ln("  ════════════════════════════════════════", "system"));
		lines.push(ln("", "output"));

		// Current weather with icon
		lines.push(ln("  CURRENT CONDITIONS:", "system"));
		lines.push(ln("", "output"));

		const details = [
			`  ${info.desc}`,
			`  TEMP:     ${current.temperature_2m}°C`,
			`  HUMIDITY: ${current.relative_humidity_2m}%`,
			`  WIND:     ${current.wind_speed_10m} KM/H`,
			"",
		];

		// Interleave icon and details
		for (let i = 0; i < Math.max(info.icon.length, details.length); i++) {
			const iconPart = info.icon[i] ?? "             ";
			const detailPart = details[i] ?? "";
			lines.push(ln(`  ${iconPart}  ${detailPart}`, "output"));
		}

		// Forecast
		lines.push(ln("", "output"));
		lines.push(ln("  3-DAY FORECAST:", "system"));
		lines.push(ln("  ────────────────────────────────────────", "output"));

		const days = ["TODAY", "TOMORROW", "DAY AFTER"];
		for (let i = 0; i < Math.min(3, data.daily.time.length); i++) {
			const dayInfo = getWeatherInfo(data.daily.weather_code[i]!);
			const hi = data.daily.temperature_2m_max[i]!;
			const lo = data.daily.temperature_2m_min[i]!;
			const label = days[i]!;
			lines.push(
				ln(
					`  ${label.padEnd(12)} ${hi.toString().padStart(3)}°/${lo.toString().padStart(3)}°  ${dayInfo.desc}`,
					"output",
				),
			);
		}

		lines.push(ln("  ────────────────────────────────────────", "output"));
		lines.push(ln("  DATA: OPEN-METEO.COM (FREE, NO API KEY)", "output"));
		lines.push(ln("", "output"));
	} catch {
		return [ln("WEATHER: FAILED TO FETCH DATA. CHECK YOUR CONNECTION.", "system")];
	}

	return lines;
}
