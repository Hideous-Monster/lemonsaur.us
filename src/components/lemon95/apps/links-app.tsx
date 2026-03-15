"use client";

import { SOCIAL_LINKS } from "@/lib/constants";

// ── Extra links not in SOCIAL_LINKS ─────────────────────────────────────────

const EXTRA_LINKS = [{ name: "LEMONSAUR.US", url: "https://lemonsaur.us", emoji: "🍋" }];

// ── Netscape-style nav bar ───────────────────────────────────────────────────

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

// ── Component ────────────────────────────────────────────────────────────────

export function LinksApp() {
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
			{/* Menu bar */}
			<div
				style={{
					display: "flex",
					gap: 0,
					background: "#c0c0c0",
					borderBottom: "1px solid #808080",
					padding: "2px 4px",
					fontSize: 11,
					flexShrink: 0,
				}}
			>
				{["File", "Edit", "View", "Go", "Bookmarks", "Help"].map((m) => (
					<span
						key={m}
						style={{
							padding: "2px 8px",
							cursor: "default",
							color: "#000",
							userSelect: "none",
						}}
					>
						{m}
					</span>
				))}
			</div>

			{/* Toolbar */}
			<div
				style={{
					display: "flex",
					gap: 4,
					padding: "4px 6px",
					background: "#c0c0c0",
					borderBottom: "1px solid #808080",
					flexShrink: 0,
					alignItems: "center",
				}}
			>
				<NavButton label="◀ Back" />
				<NavButton label="Forward ▶" />
				<NavButton label="🔄 Reload" />
				<NavButton label="🏠 Home" />
				<NavButton label="🔍 Search" />
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
				<span style={{ fontSize: 11, color: "#000", fontFamily: "Arial, sans-serif" }}>
					Location:
				</span>
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
				<button
					type="button"
					style={{
						background: "#c0c0c0",
						border: "2px outset #e0e0e0",
						fontSize: 10,
						padding: "1px 8px",
						cursor: "default",
					}}
				>
					Go
				</button>
			</div>

			{/* Webpage content */}
			<div
				style={{
					flex: 1,
					background: "#ffff99",
					overflow: "auto",
					padding: "16px 20px",
				}}
			>
				{/* Blinking "BEST VIEWED" badge */}
				<div
					style={{
						textAlign: "center",
						marginBottom: 14,
					}}
				>
					<style>{`
						@keyframes linkBlink {
							0%, 49% { opacity: 1; }
							50%, 100% { opacity: 0; }
						}
					`}</style>
					<span
						style={{
							background: "#000080",
							color: "#ffffff",
							fontFamily: "Arial, sans-serif",
							fontSize: 10,
							padding: "2px 8px",
							border: "2px solid #ffff00",
							animation: "linkBlink 1.2s step-end infinite",
							display: "inline-block",
						}}
					>
						★ BEST VIEWED IN NETSCAPE NAVIGATOR 4.0 ★
					</span>
				</div>

				{/* Page title */}
				<div
					style={{
						textAlign: "center",
						fontFamily: "Impact, Arial Black, sans-serif",
						fontSize: 28,
						color: "#ff0000",
						textShadow: "3px 3px #000080",
						marginBottom: 4,
					}}
				>
					🍋 LEMONSAURUS' LINKS 🍋
				</div>
				<div
					style={{
						textAlign: "center",
						fontFamily: "Comic Sans MS, cursive",
						fontSize: 12,
						color: "#000080",
						marginBottom: 16,
					}}
				>
					my totally rad corner of teh internetz!!
				</div>

				{/* Horizontal rule */}
				<hr style={{ borderTop: "4px double #ff00ff", marginBottom: 14 }} />

				{/* Links table */}
				<table
					style={{
						width: "100%",
						borderCollapse: "collapse",
						fontFamily: "Arial, sans-serif",
						fontSize: 13,
					}}
				>
					<tbody>
						{SOCIAL_LINKS.map((link) => (
							<tr key={link.name}>
								<td
									style={{
										padding: "6px 10px",
										borderBottom: "1px dashed #ff00ff",
										width: 28,
										textAlign: "center",
										fontSize: 16,
									}}
								>
									★
								</td>
								<td
									style={{
										padding: "6px 8px",
										borderBottom: "1px dashed #ff00ff",
										width: 100,
										color: "#000080",
										fontWeight: "bold",
									}}
								>
									{link.name.toUpperCase()}
								</td>
								<td
									style={{
										padding: "6px 8px",
										borderBottom: "1px dashed #ff00ff",
									}}
								>
									<a
										href={link.url}
										target="_blank"
										rel="noopener noreferrer"
										style={{
											color: "#0000ee",
											textDecoration: "underline",
											fontFamily: "monospace",
											fontSize: 11,
											wordBreak: "break-all",
										}}
									>
										{link.url}
									</a>
								</td>
							</tr>
						))}
						{EXTRA_LINKS.map((link) => (
							<tr key={link.name}>
								<td
									style={{
										padding: "6px 10px",
										borderBottom: "1px dashed #ff00ff",
										width: 28,
										textAlign: "center",
										fontSize: 16,
									}}
								>
									{link.emoji}
								</td>
								<td
									style={{
										padding: "6px 8px",
										borderBottom: "1px dashed #ff00ff",
										width: 100,
										color: "#000080",
										fontWeight: "bold",
									}}
								>
									{link.name}
								</td>
								<td
									style={{
										padding: "6px 8px",
										borderBottom: "1px dashed #ff00ff",
									}}
								>
									<a
										href={link.url}
										target="_blank"
										rel="noopener noreferrer"
										style={{
											color: "#0000ee",
											textDecoration: "underline",
											fontFamily: "monospace",
											fontSize: 11,
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

				{/* Footer */}
				<div
					style={{
						textAlign: "center",
						marginTop: 16,
						fontFamily: "Comic Sans MS, cursive",
						fontSize: 10,
						color: "#808080",
					}}
				>
					last updated: sometime in 2003 · made with notepad · no tables were harmed
				</div>
			</div>
		</div>
	);
}
