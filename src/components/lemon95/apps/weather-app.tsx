"use client";

import { useCallback, useRef, useState } from "react";

// ── Open-Meteo types ─────────────────────────────────────────────────────────

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
	forecast: Array<{
		label: string;
		hi: number;
		lo: number;
		desc: string;
	}>;
}

// ── WMO code descriptions ────────────────────────────────────────────────────

const WMO: Record<number, string> = {
	0: "CLEAR SKY",
	1: "MAINLY CLEAR",
	2: "PARTLY CLOUDY",
	3: "OVERCAST",
	45: "FOG",
	48: "RIME FOG",
	51: "LIGHT DRIZZLE",
	53: "DRIZZLE",
	55: "HEAVY DRIZZLE",
	61: "LIGHT RAIN",
	63: "RAIN",
	65: "HEAVY RAIN",
	71: "LIGHT SNOW",
	73: "SNOW",
	75: "HEAVY SNOW",
	80: "RAIN SHOWERS",
	81: "RAIN SHOWERS",
	82: "HEAVY SHOWERS",
	95: "THUNDERSTORM",
};

function wmoDesc(code: number): string {
	return WMO[code] ?? `CODE ${code}`;
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

// ── Fetch helpers ────────────────────────────────────────────────────────────

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
	let location = "OSLO, NORWAY";

	if (city.trim().toLowerCase() !== "oslo") {
		const geo = await geocode(city);
		if (!geo) throw new Error(`Could not find "${city}"`);
		lat = geo.latitude;
		lon = geo.longitude;
		location = `${geo.name.toUpperCase()}, ${geo.country.toUpperCase()}`;
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
			label: i === 0 ? "TODAY" : i === 1 ? "TOMORROW" : "DAY AFTER",
			hi: Math.round(data.daily.temperature_2m_max[i]!),
			lo: Math.round(data.daily.temperature_2m_min[i]!),
			desc: wmoDesc(data.daily.weather_code[i]!),
		})),
	};
}

// ── Win3.1 beveled button ────────────────────────────────────────────────────

function BevelButton({
	children,
	onClick,
	disabled,
}: {
	children: React.ReactNode;
	onClick: () => void;
	disabled?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			style={{
				background: "#1a2a1a",
				color: disabled ? "#405030" : "#e8e040",
				fontFamily: "monospace",
				fontSize: 11,
				padding: "3px 12px",
				cursor: disabled ? "default" : "pointer",
				borderTop: "2px solid #405030",
				borderLeft: "2px solid #405030",
				borderBottom: "2px solid #1a2a1a",
				borderRight: "2px solid #1a2a1a",
				letterSpacing: "0.05em",
				flexShrink: 0,
			}}
		>
			{children}
		</button>
	);
}

// ── Component ────────────────────────────────────────────────────────────────

export function WeatherApp() {
	const [city, setCity] = useState("Oslo");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<WeatherResult | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFetch = useCallback(async () => {
		const q = city.trim() || "Oslo";
		setLoading(true);
		setError(null);
		try {
			const w = await getWeather(q);
			setResult(w);
		} catch (e) {
			setError(e instanceof Error ? e.message.toUpperCase() : "FETCH FAILED");
		} finally {
			setLoading(false);
		}
	}, [city]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter") handleFetch();
		},
		[handleFetch],
	);

	return (
		<div
			style={{
				flex: 1,
				display: "flex",
				flexDirection: "column",
				background: "#0a140a",
				color: "#e8e040",
				fontFamily: "monospace",
				fontSize: 12,
				overflow: "hidden",
			}}
		>
			{/* Input row */}
			<div
				style={{
					display: "flex",
					gap: 6,
					padding: "10px 12px",
					borderBottom: "1px solid #223a22",
					flexShrink: 0,
					alignItems: "center",
				}}
			>
				<span style={{ color: "#688850", fontSize: 11, flexShrink: 0 }}>CITY:</span>
				<input
					ref={inputRef}
					value={city}
					onChange={(e) => setCity(e.target.value)}
					onKeyDown={handleKeyDown}
					style={{
						flex: 1,
						background: "#0a200a",
						color: "#e8e040",
						border: "1px solid #405030",
						fontFamily: "monospace",
						fontSize: 12,
						padding: "2px 6px",
						outline: "none",
					}}
					placeholder="CITY NAME"
				/>
				<BevelButton onClick={handleFetch} disabled={loading}>
					{loading ? "..." : "GET"}
				</BevelButton>
			</div>

			{/* Content */}
			<div style={{ flex: 1, overflow: "auto", padding: "12px 14px" }}>
				{loading && <div style={{ color: "#688850", fontSize: 11 }}>FETCHING WEATHER DATA...</div>}

				{error && (
					<div style={{ color: "#c05040", fontSize: 11 }}>ERROR: {error.toUpperCase()}</div>
				)}

				{!loading && !error && !result && (
					<div style={{ color: "#405030", fontSize: 11 }}>ENTER A CITY AND PRESS GET.</div>
				)}

				{result && !loading && (
					<>
						{/* Location header */}
						<div
							style={{
								color: "#b8d850",
								fontSize: 13,
								fontWeight: "bold",
								marginBottom: 10,
								letterSpacing: "0.05em",
							}}
						>
							{wmoEmoji(result.conditionCode)} {result.location}
						</div>

						{/* Current conditions box */}
						<div
							style={{
								border: "1px solid #223a22",
								padding: "8px 10px",
								marginBottom: 12,
								background: "#0a1a0a",
							}}
						>
							<div
								style={{
									color: "#688850",
									fontSize: 10,
									marginBottom: 6,
									letterSpacing: "0.08em",
								}}
							>
								CURRENT CONDITIONS
							</div>
							<Row label="CONDITION" value={result.conditionDesc} />
							<Row label="TEMPERATURE" value={`${result.temp}°C`} />
							<Row label="HUMIDITY" value={`${result.humidity}%`} />
							<Row label="WIND" value={`${result.wind} KM/H`} />
						</div>

						{/* Forecast box */}
						<div
							style={{
								border: "1px solid #223a22",
								padding: "8px 10px",
								background: "#0a1a0a",
							}}
						>
							<div
								style={{
									color: "#688850",
									fontSize: 10,
									marginBottom: 6,
									letterSpacing: "0.08em",
								}}
							>
								3-DAY FORECAST
							</div>
							{result.forecast.map((day) => (
								<div
									key={day.label}
									style={{
										display: "flex",
										gap: 8,
										marginBottom: 4,
										fontSize: 11,
									}}
								>
									<span style={{ color: "#688850", width: 72, flexShrink: 0 }}>{day.label}</span>
									<span style={{ color: "#e8e040", width: 36, flexShrink: 0 }}>{day.hi}° /</span>
									<span style={{ color: "#b8d850", width: 30, flexShrink: 0 }}>{day.lo}°</span>
									<span style={{ color: "#688850" }}>{day.desc}</span>
								</div>
							))}
						</div>
					</>
				)}
			</div>
		</div>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div style={{ display: "flex", gap: 8, marginBottom: 3, fontSize: 11 }}>
			<span style={{ color: "#688850", width: 90, flexShrink: 0 }}>{label}</span>
			<span style={{ color: "#e8e040" }}>{value}</span>
		</div>
	);
}
