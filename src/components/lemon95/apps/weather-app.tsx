"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

interface WeatherResult {
	location: string;
	temp: number;
	humidity: number;
	wind: number;
	conditionCode: number;
	conditionDesc: string;
	forecast: Array<{ label: string; hi: number; lo: number; desc: string; code: number }>;
}

const WMO: Record<number, string> = {
	0: "Clear Sky",
	1: "Mainly Clear",
	2: "Partly Cloudy",
	3: "Overcast",
	45: "Fog",
	48: "Rime Fog",
	51: "Light Drizzle",
	53: "Drizzle",
	55: "Heavy Drizzle",
	61: "Light Rain",
	63: "Rain",
	65: "Heavy Rain",
	71: "Light Snow",
	73: "Snow",
	75: "Heavy Snow",
	80: "Rain Showers",
	81: "Rain Showers",
	82: "Heavy Showers",
	95: "Thunderstorm",
};

function wmoDesc(code: number): string {
	return WMO[code] ?? `Code ${code}`;
}

function wmoEmoji(code: number): string {
	if (code === 0 || code === 1) return "☀️";
	if (code === 2) return "⛅";
	if (code === 3) return "☁️";
	if (code === 45 || code === 48) return "🌫";
	if (code >= 51 && code <= 55) return "🌦";
	if (code >= 61 && code <= 65) return "🌧";
	if (code >= 71 && code <= 75) return "❄️";
	if (code >= 80 && code <= 82) return "🌦";
	if (code === 95) return "⛈";
	return "🌡";
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

async function getWeather(city: string): Promise<WeatherResult> {
	let lat = 59.91;
	let lon = 10.75;
	let location = "Oslo, Norway";

	if (city.trim().toLowerCase() !== "oslo") {
		const geo = await geocode(city);
		if (!geo) throw new Error(`Could not find "${city}"`);
		lat = geo.latitude;
		lon = geo.longitude;
		location = `${geo.name}, ${geo.country}`;
	}

	const data = await fetchWeather(lat, lon);
	const c = data.current;

	return {
		location,
		temp: Math.round(c.temperature_2m),
		humidity: c.relative_humidity_2m,
		wind: Math.round(c.wind_speed_10m),
		conditionCode: c.weather_code,
		conditionDesc: wmoDesc(c.weather_code),
		forecast: data.daily.time.slice(0, 3).map((_, i) => ({
			label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : "Day After",
			hi: Math.round(data.daily.temperature_2m_max[i]!),
			lo: Math.round(data.daily.temperature_2m_min[i]!),
			desc: wmoDesc(data.daily.weather_code[i]!),
			code: data.daily.weather_code[i]!,
		})),
	};
}

export function WeatherApp() {
	const [city, setCity] = useState("Oslo");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<WeatherResult | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFetch = useCallback(async (q?: string) => {
		const query = (q ?? "Oslo").trim() || "Oslo";
		setLoading(true);
		setError(null);
		try {
			const w = await getWeather(query);
			setResult(w);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Fetch failed");
		} finally {
			setLoading(false);
		}
	}, []);

	// Auto-load Oslo on mount
	useEffect(() => {
		handleFetch("Oslo");
	}, [handleFetch]);

	const handleSubmit = useCallback(() => {
		handleFetch(city);
	}, [city, handleFetch]);

	return (
		<div
			style={{
				flex: 1,
				display: "flex",
				flexDirection: "column",
				background: "#111820",
				color: "#e0e0e0",
				fontFamily: "'Segoe UI', Arial, sans-serif",
				fontSize: 13,
				overflow: "hidden",
			}}
		>
			{/* Search bar */}
			<div
				style={{
					display: "flex",
					gap: 6,
					padding: "10px 14px",
					borderBottom: "1px solid #2a3545",
					flexShrink: 0,
					alignItems: "center",
					background: "#1a2530",
				}}
			>
				<span style={{ fontSize: 16 }}>🔍</span>
				<input
					ref={inputRef}
					value={city}
					onChange={(e) => setCity(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
					onMouseDown={(e) => e.stopPropagation()}
					style={{
						flex: 1,
						background: "#0d1520",
						color: "#e0e0e0",
						border: "1px solid #3a4a5a",
						borderRadius: 4,
						fontFamily: "inherit",
						fontSize: 13,
						padding: "5px 10px",
						outline: "none",
					}}
					placeholder="Search city..."
				/>
				<button
					type="button"
					onClick={handleSubmit}
					disabled={loading}
					style={{
						background: "#e8e040",
						color: "#111820",
						border: "none",
						borderRadius: 4,
						fontFamily: "inherit",
						fontSize: 12,
						fontWeight: "bold",
						padding: "5px 14px",
						cursor: loading ? "default" : "pointer",
						opacity: loading ? 0.5 : 1,
					}}
				>
					{loading ? "..." : "Go"}
				</button>
			</div>

			{/* Content */}
			<div style={{ flex: 1, overflow: "auto", padding: "16px 18px" }}>
				{loading && !result && (
					<div style={{ color: "#8090a0", fontSize: 12 }}>Loading weather data...</div>
				)}

				{error && <div style={{ color: "#ff6060", fontSize: 12 }}>Error: {error}</div>}

				{result && (
					<>
						{/* Big temperature + location */}
						<div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
							<span style={{ fontSize: 48, lineHeight: 1 }}>{wmoEmoji(result.conditionCode)}</span>
							<div>
								<div style={{ fontSize: 36, fontWeight: "bold", color: "#e8e040", lineHeight: 1 }}>
									{result.temp}°C
								</div>
								<div style={{ fontSize: 14, color: "#a0b0c0", marginTop: 4 }}>
									{result.location}
								</div>
								<div style={{ fontSize: 12, color: "#708090", marginTop: 2 }}>
									{result.conditionDesc}
								</div>
							</div>
						</div>

						{/* Stats row */}
						<div
							style={{
								display: "flex",
								gap: 20,
								marginBottom: 20,
								padding: "12px 16px",
								background: "#1a2530",
								borderRadius: 6,
							}}
						>
							<Stat label="Humidity" value={`${result.humidity}%`} icon="💧" />
							<Stat label="Wind" value={`${result.wind} km/h`} icon="💨" />
						</div>

						{/* Forecast */}
						<div style={{ fontSize: 11, color: "#708090", marginBottom: 8, letterSpacing: 1 }}>
							3-DAY FORECAST
						</div>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: 1,
								background: "#1a2530",
								borderRadius: 6,
								overflow: "hidden",
							}}
						>
							{result.forecast.map((day) => (
								<div
									key={day.label}
									style={{
										display: "flex",
										alignItems: "center",
										gap: 10,
										padding: "10px 14px",
										background: "#111820",
									}}
								>
									<span style={{ fontSize: 18, width: 28 }}>{wmoEmoji(day.code)}</span>
									<span style={{ flex: 1, color: "#c0c8d0", fontSize: 13 }}>{day.label}</span>
									<span
										style={{ color: "#e8e040", fontWeight: "bold", width: 40, textAlign: "right" }}
									>
										{day.hi}°
									</span>
									<span style={{ color: "#708090", width: 40, textAlign: "right" }}>{day.lo}°</span>
									<span style={{ color: "#8090a0", fontSize: 11, width: 90, textAlign: "right" }}>
										{day.desc}
									</span>
								</div>
							))}
						</div>
					</>
				)}
			</div>
		</div>
	);
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
			<span style={{ fontSize: 18 }}>{icon}</span>
			<div>
				<div style={{ fontSize: 11, color: "#708090" }}>{label}</div>
				<div style={{ fontSize: 14, color: "#e0e0e0", fontWeight: "bold" }}>{value}</div>
			</div>
		</div>
	);
}
