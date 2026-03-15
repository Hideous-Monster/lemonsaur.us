import type { TerminalLine } from "./types";

let lineIdCounter = 100000;

function ln(text: string, type: TerminalLine["type"]): TerminalLine {
	return { id: lineIdCounter++, text, type };
}

// Escape HTML entities for safe rich rendering
function esc(s: string): string {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Wrap text in a colored span
function colored(text: string, color: string): string {
	return `<span style="color:${color}">${esc(text)}</span>`;
}

// Colors
const SUN = "#e8e040";
const CLOUD_LIGHT = "#c0c0c0";
const CLOUD_DARK = "#808080";
const RAIN = "#5090ff";
const SNOW = "#ffffff";
const FOG = "#909090";
const THUNDER = "#e8e040";

// WMO weather code → description + colored ASCII icon (HTML)
const WMO_CODES: Record<number, { desc: string; icon: string[] }> = {
	0: {
		desc: "CLEAR SKY",
		icon: [
			colored("    \\   /    ", SUN),
			colored("     .-.     ", SUN),
			colored("  ‒ (   ) ‒  ", SUN),
			colored("     `-'     ", SUN),
			colored("    /   \\    ", SUN),
		],
	},
	1: {
		desc: "MAINLY CLEAR",
		icon: [
			colored("    \\   /    ", SUN),
			colored("     .-.     ", SUN),
			colored("  ‒ (   ) ‒  ", SUN),
			colored("     `-'     ", SUN),
			colored("    /   \\    ", SUN),
		],
	},
	2: {
		desc: "PARTLY CLOUDY",
		icon: [
			colored("    \\   /    ", SUN),
			colored("     .-.     ", SUN),
			colored("  ‒ (   )    ", SUN),
			colored("    /`-'", SUN) + colored(" .-. ", CLOUD_LIGHT),
			colored("       ", SUN) + colored("(   ) ", CLOUD_LIGHT),
		],
	},
	3: {
		desc: "OVERCAST",
		icon: [
			"             ",
			colored("     .--.    ", CLOUD_DARK),
			colored("  .-(    ).  ", CLOUD_DARK),
			colored(" (___.__)__) ", CLOUD_DARK),
			"             ",
		],
	},
	45: {
		desc: "FOG",
		icon: [
			colored(" _ - _ - _ - ", FOG),
			colored("  _ - _ - _  ", FOG),
			colored(" _ - _ - _ - ", FOG),
			colored("  _ - _ - _  ", FOG),
			colored(" _ - _ - _ - ", FOG),
		],
	},
	48: {
		desc: "RIME FOG",
		icon: [
			colored(" _ - _ - _ - ", FOG),
			colored("  _ - _ - _  ", FOG),
			colored(" _ - _ - _ - ", FOG),
			colored("  _ - _ - _  ", FOG),
			colored(" _ - _ - _ - ", FOG),
		],
	},
	51: {
		desc: "LIGHT DRIZZLE",
		icon: [
			colored("     .--.    ", CLOUD_LIGHT),
			colored("  .-(    ).  ", CLOUD_LIGHT),
			colored(" (___.__)__) ", CLOUD_LIGHT),
			colored("   ' ' ' '   ", RAIN),
			colored("  ' ' ' '    ", RAIN),
		],
	},
	53: {
		desc: "DRIZZLE",
		icon: [
			colored("     .--.    ", CLOUD_LIGHT),
			colored("  .-(    ).  ", CLOUD_LIGHT),
			colored(" (___.__)__) ", CLOUD_LIGHT),
			colored("   ' ' ' '   ", RAIN),
			colored("  ' ' ' '    ", RAIN),
		],
	},
	55: {
		desc: "HEAVY DRIZZLE",
		icon: [
			colored("     .--.    ", CLOUD_DARK),
			colored("  .-(    ).  ", CLOUD_DARK),
			colored(" (___.__)__) ", CLOUD_DARK),
			colored("   ' ' ' '   ", RAIN),
			colored("  ' ' ' '    ", RAIN),
		],
	},
	61: {
		desc: "LIGHT RAIN",
		icon: [
			colored("     .--.    ", CLOUD_LIGHT),
			colored("  .-(    ).  ", CLOUD_LIGHT),
			colored(" (___.__)__) ", CLOUD_LIGHT),
			colored("   / / / /   ", RAIN),
			colored("  / / / /    ", RAIN),
		],
	},
	63: {
		desc: "RAIN",
		icon: [
			colored("     .--.    ", CLOUD_DARK),
			colored("  .-(    ).  ", CLOUD_DARK),
			colored(" (___.__)__) ", CLOUD_DARK),
			colored("   / / / /   ", RAIN),
			colored("  / / / /    ", RAIN),
		],
	},
	65: {
		desc: "HEAVY RAIN",
		icon: [
			colored("     .--.    ", CLOUD_DARK),
			colored("  .-(    ).  ", CLOUD_DARK),
			colored(" (___.__)__) ", CLOUD_DARK),
			colored("  /// /// //  ", RAIN),
			colored(" /// /// //   ", RAIN),
		],
	},
	71: {
		desc: "LIGHT SNOW",
		icon: [
			colored("     .--.    ", CLOUD_LIGHT),
			colored("  .-(    ).  ", CLOUD_LIGHT),
			colored(" (___.__)__) ", CLOUD_LIGHT),
			colored("   *  *  *   ", SNOW),
			colored("  *  *  *    ", SNOW),
		],
	},
	73: {
		desc: "SNOW",
		icon: [
			colored("     .--.    ", CLOUD_DARK),
			colored("  .-(    ).  ", CLOUD_DARK),
			colored(" (___.__)__) ", CLOUD_DARK),
			colored("   *  *  *   ", SNOW),
			colored("  *  *  *    ", SNOW),
		],
	},
	75: {
		desc: "HEAVY SNOW",
		icon: [
			colored("     .--.    ", CLOUD_DARK),
			colored("  .-(    ).  ", CLOUD_DARK),
			colored(" (___.__)__) ", CLOUD_DARK),
			colored("  ** ** **    ", SNOW),
			colored(" ** ** **     ", SNOW),
		],
	},
	80: {
		desc: "RAIN SHOWERS",
		icon: [
			colored("     .--.    ", CLOUD_LIGHT),
			colored("  .-(    ).  ", CLOUD_LIGHT),
			colored(" (___.__)__) ", CLOUD_LIGHT),
			colored("   / / / /   ", RAIN),
			colored("  / / / /    ", RAIN),
		],
	},
	81: {
		desc: "RAIN SHOWERS",
		icon: [
			colored("     .--.    ", CLOUD_LIGHT),
			colored("  .-(    ).  ", CLOUD_LIGHT),
			colored(" (___.__)__) ", CLOUD_LIGHT),
			colored("   / / / /   ", RAIN),
			colored("  / / / /    ", RAIN),
		],
	},
	82: {
		desc: "HEAVY SHOWERS",
		icon: [
			colored("     .--.    ", CLOUD_DARK),
			colored("  .-(    ).  ", CLOUD_DARK),
			colored(" (___.__)__) ", CLOUD_DARK),
			colored("  /// /// //  ", RAIN),
			colored(" /// /// //   ", RAIN),
		],
	},
	95: {
		desc: "THUNDERSTORM",
		icon: [
			colored("     .--.    ", CLOUD_DARK),
			colored("  .-(    ).  ", CLOUD_DARK),
			colored(" (___.__)__) ", CLOUD_DARK),
			colored("   ⚡", THUNDER) +
				colored("/ ", RAIN) +
				colored("⚡", THUNDER) +
				colored("/   ", RAIN),
			colored("  / ", RAIN) + colored("⚡", THUNDER) + colored("/ /    ", RAIN),
		],
	},
};

function getWeatherInfo(code: number): { desc: string; icon: string[] } {
	return (
		WMO_CODES[code] ?? {
			desc: `CODE ${code}`,
			icon: [
				colored("     .--.    ", CLOUD_DARK),
				colored("  .-(    ).  ", CLOUD_DARK),
				colored(" (___.__)__) ", CLOUD_DARK),
				"     ???     ",
				"             ",
			],
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

		const deg = '<span style="font-family:monospace">°</span>';
		const details = [
			`  ${esc(info.desc)}`,
			`  TEMP:     ${Math.round(current.temperature_2m)}${deg}C`,
			`  HUMIDITY: ${current.relative_humidity_2m}%`,
			`  WIND:     ${current.wind_speed_10m} KM/H`,
			"",
		];

		// Interleave colored icon (rich HTML) and details
		for (let i = 0; i < Math.max(info.icon.length, details.length); i++) {
			const iconPart = info.icon[i] ?? "             ";
			const detailPart = details[i] ?? "";
			lines.push(ln(`<span style="white-space:pre">  ${iconPart}  ${detailPart}</span>`, "rich"));
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
					`<span style="white-space:pre">  ${esc(label.padEnd(12))} HI ${Math.round(hi)}<span style="font-family:monospace">°</span> / LO ${Math.round(lo)}<span style="font-family:monospace">°</span>  ${esc(dayInfo.desc)}</span>`,
					"rich",
				),
			);
		}

		lines.push(ln("  ────────────────────────────────────────", "output"));
		lines.push(ln("", "output"));
	} catch {
		return [ln("WEATHER: FAILED TO FETCH DATA. CHECK YOUR CONNECTION.", "system")];
	}

	return lines;
}
