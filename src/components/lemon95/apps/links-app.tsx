"use client";

import { useEffect, useState } from "react";
import { SOCIAL_LINKS } from "@/lib/constants";

const ALL_LINKS = [
	...SOCIAL_LINKS.map((l) => ({ name: l.name.toUpperCase(), url: l.url, emoji: "★" })),
	{ name: "OOMFIES.GAY", url: "https://oomfies.gay", emoji: "🏳️‍🌈" },
	{ name: "PYTHON DISCORD", url: "https://pythondiscord.com", emoji: "🐍" },
	{ name: "TINY DOOM", url: "https://tinydoom.com", emoji: "💀" },
	{ name: "HIDEOUS MONSTER", url: "https://hideous.monster", emoji: "👹" },
	{ name: "BLACKBOX", url: "https://github.com/lemonsaurus/blackbox", emoji: "📦" },
	{ name: "AGENCY", url: "https://github.com/lemonsaurus/agency", emoji: "🤖" },
	{ name: "MIRADOR", url: "https://github.com/lemonsaurus/mirador", emoji: "🔭" },
	{ name: "LEMONSAUR.US", url: "https://lemonsaur.us", emoji: "🍋" },
];

function NavButton({ label }: { label: string }) {
	return (
		<button
			type="button"
			style={{
				background: "#c0c0c0",
				color: "#000",
				border: "2px outset #e0e0e0",
				fontFamily: "Arial, sans-serif",
				fontSize: 11,
				padding: "2px 8px",
				cursor: "default",
				userSelect: "none",
			}}
		>
			{label}
		</button>
	);
}

export function LinksApp() {
	const [visitorCount] = useState(() => 14832 + Math.floor(Math.random() * 500));
	const [marqueeOffset, setMarqueeOffset] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => setMarqueeOffset((o) => o + 1), 50);
		return () => clearInterval(interval);
	}, []);

	return (
		<div
			style={{
				flex: 1,
				display: "flex",
				flexDirection: "column",
				background: "#c0c0c0",
				overflow: "hidden",
				fontFamily: "Arial, sans-serif",
			}}
		>
			{/* Toolbar */}
			<div
				style={{
					display: "flex",
					gap: 4,
					padding: "4px 6px",
					background: "#c0c0c0",
					borderBottom: "1px solid #808080",
					flexShrink: 0,
				}}
			>
				<NavButton label="◀ Back" />
				<NavButton label="Forward ▶" />
				<NavButton label="🔄 Reload" />
				<NavButton label="🏠 Home" />
			</div>

			{/* Address bar */}
			<div
				style={{
					display: "flex",
					gap: 6,
					padding: "3px 6px",
					background: "#c0c0c0",
					borderBottom: "2px solid #808080",
					flexShrink: 0,
					alignItems: "center",
				}}
			>
				<span style={{ fontSize: 11, color: "#000" }}>Location:</span>
				<div
					style={{
						flex: 1,
						background: "#fff",
						border: "1px inset #808080",
						padding: "1px 4px",
						fontSize: 11,
						fontFamily: "monospace",
						color: "#000080",
					}}
				>
					http://www.lemonsaurus.geocities.com/links.htm
				</div>
			</div>

			{/* Webpage content */}
			<div
				style={{
					flex: 1,
					background: "#ffff99",
					overflow: "auto",
					padding: 0,
				}}
			>
				<style>{`
					@keyframes geocitiesBlink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
					@keyframes geocitiesSpin { to{transform:rotate(360deg)} }
					@keyframes geocitiesRainbow {
						0%{color:#ff0000} 16%{color:#ff8800} 33%{color:#ffff00}
						50%{color:#00ff00} 66%{color:#0088ff} 83%{color:#8800ff} 100%{color:#ff0000}
					}
				`}</style>

				{/* Starfield background tiling */}
				<div
					style={{
						background: "linear-gradient(180deg, #000033 0%, #000066 50%, #000033 100%)",
						padding: "12px 16px",
						backgroundImage:
							"radial-gradient(white 1px, transparent 1px), radial-gradient(white 1px, transparent 1px)",
						backgroundSize: "40px 40px, 60px 60px",
						backgroundPosition: "0 0, 30px 30px",
					}}
				>
					{/* Animated banner */}
					<div
						style={{
							textAlign: "center",
							fontFamily: "Impact, Arial Black, sans-serif",
							fontSize: 32,
							color: "#ff0000",
							textShadow: "3px 3px #000, -1px -1px #ffff00",
							marginBottom: 4,
							animation: "geocitiesRainbow 3s linear infinite",
						}}
					>
						🍋 LEMONSAURUS' CYBER LINKS 🍋
					</div>

					{/* Marquee */}
					<div
						style={{
							overflow: "hidden",
							height: 18,
							marginBottom: 8,
						}}
					>
						<div
							style={{
								fontFamily: "Comic Sans MS, cursive",
								fontSize: 12,
								color: "#00ff00",
								whiteSpace: "nowrap",
								transform: `translateX(${600 - (marqueeOffset % 800)}px)`,
							}}
						>
							★ ★ ★ WELCOME TO THE ULTIMATE LINKS PAGE ★ ★ ★ sign my guestbook plz ★ ★ ★ last
							updated feb 2003 ★ ★ ★
						</div>
					</div>

					{/* Best viewed badge */}
					<div style={{ textAlign: "center", marginBottom: 10 }}>
						<span
							style={{
								background: "#000080",
								color: "#fff",
								fontSize: 9,
								padding: "2px 6px",
								border: "2px solid #ffff00",
								animation: "geocitiesBlink 1.2s step-end infinite",
								display: "inline-block",
							}}
						>
							★ BEST VIEWED IN NETSCAPE NAVIGATOR 4.0 AT 800x600 ★
						</span>
					</div>

					<hr style={{ border: "none", borderTop: "3px double #ff00ff", margin: "8px 0" }} />

					{/* Visitor counter */}
					<div
						style={{
							textAlign: "center",
							marginBottom: 10,
							fontFamily: "Courier New, monospace",
							fontSize: 11,
							color: "#ffff00",
						}}
					>
						<span
							style={{ display: "inline-block", animation: "geocitiesSpin 3s linear infinite" }}
						>
							🌐
						</span>{" "}
						YOU ARE VISITOR #{visitorCount.toLocaleString()}{" "}
						<span
							style={{ display: "inline-block", animation: "geocitiesSpin 3s linear infinite" }}
						>
							🌐
						</span>
					</div>

					{/* Under construction */}
					<div
						style={{
							textAlign: "center",
							marginBottom: 10,
							fontSize: 10,
							color: "#ff8800",
							animation: "geocitiesBlink 0.8s step-end infinite",
						}}
					>
						🚧 UNDER CONSTRUCTION 🚧 UNDER CONSTRUCTION 🚧
					</div>

					<hr style={{ border: "none", borderTop: "2px dashed #00ffff", margin: "8px 0" }} />

					{/* Links */}
					<table
						style={{
							width: "100%",
							borderCollapse: "collapse",
							fontFamily: "Arial, sans-serif",
							fontSize: 12,
						}}
					>
						<tbody>
							{ALL_LINKS.map((link) => (
								<tr key={link.url}>
									<td
										style={{
											padding: "5px 6px",
											borderBottom: "1px dashed #ff00ff",
											width: 24,
											textAlign: "center",
											fontSize: 14,
										}}
									>
										{link.emoji}
									</td>
									<td
										style={{
											padding: "5px 6px",
											borderBottom: "1px dashed #ff00ff",
											color: "#ffffff",
											fontWeight: "bold",
											fontSize: 12,
											whiteSpace: "nowrap",
											textShadow: "1px 1px 2px #000",
										}}
									>
										{link.name}
									</td>
									<td
										style={{
											padding: "5px 6px",
											borderBottom: "1px dashed #ff00ff",
										}}
									>
										<a
											href={link.url}
											target="_blank"
											rel="noopener noreferrer"
											style={{
												color: "#000000",
												textDecoration: "underline",
												fontFamily: "monospace",
												fontSize: 11,
												fontWeight: "bold",
												textShadow: "1px 1px 0 #ff88cc",
												wordBreak: "break-all",
											}}
										>
											{link.url}
										</a>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					<hr style={{ border: "none", borderTop: "3px double #ff00ff", margin: "10px 0" }} />

					{/* Webrings */}
					<div
						style={{
							textAlign: "center",
							marginBottom: 8,
							fontFamily: "Comic Sans MS, cursive",
							fontSize: 11,
							color: "#ff88ff",
						}}
					>
						member of the 🍋 LEMON WEBRING 🍋
						<br />
						[◀ prev] [random] [next ▶]
					</div>

					{/* GIF collection */}
					<div
						style={{
							textAlign: "center",
							fontSize: 18,
							marginBottom: 8,
							letterSpacing: 4,
						}}
					>
						<span
							style={{ display: "inline-block", animation: "geocitiesSpin 2s linear infinite" }}
						>
							🍋
						</span>
						<span
							style={{ display: "inline-block", animation: "geocitiesSpin 2.5s linear infinite" }}
						>
							⭐
						</span>
						<span
							style={{ display: "inline-block", animation: "geocitiesSpin 1.5s linear infinite" }}
						>
							🍋
						</span>
						<span
							style={{ display: "inline-block", animation: "geocitiesSpin 3s linear infinite" }}
						>
							💫
						</span>
						<span
							style={{ display: "inline-block", animation: "geocitiesSpin 2s linear infinite" }}
						>
							🍋
						</span>
					</div>

					{/* Footer */}
					<div
						style={{
							textAlign: "center",
							fontFamily: "Comic Sans MS, cursive",
							fontSize: 9,
							color: "#808080",
							paddingBottom: 12,
						}}
					>
						made with notepad · last updated sometime in 2003
						<br />
						no animals were harmed in the making of this webpage
						<br />
						this site is Y2K compliant ✓
					</div>
				</div>
			</div>
		</div>
	);
}
