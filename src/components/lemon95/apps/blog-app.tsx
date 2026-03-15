"use client";

import { useEffect, useState } from "react";

interface BlogPost {
	slug: string;
	title: string;
	description: string;
	date: string;
	tags: string[];
	readingTime: string;
	content: string;
}

// Fake LJ metadata — classic early-2000s energy
const FAKE_MOODS = [
	{ mood: "thoughtful", icon: "🤔" },
	{ mood: "excited", icon: "😄" },
	{ mood: "nerdy", icon: "🤓" },
	{ mood: "caffeinated", icon: "☕" },
	{ mood: "nostalgic", icon: "🥲" },
	{ mood: "amused", icon: "😏" },
];

const FAKE_MUSIC = [
	"Daft Punk - Around the World",
	"Radiohead - Karma Police",
	"The Postal Service - Such Great Heights",
	"Gorillaz - Clint Eastwood",
	"Beck - Loser",
	"Weezer - Buddy Holly",
	"Death Cab for Cutie - The Sound of Settling",
	"Modest Mouse - Float On",
];

function formatLJDate(isoDate: string): string {
	const d = new Date(isoDate);
	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	const hours = d.getHours();
	const minutes = d.getMinutes().toString().padStart(2, "0");
	const ampm = hours >= 12 ? "pm" : "am";
	const h12 = hours % 12 || 12;
	return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} @ ${h12}:${minutes} ${ampm}`;
}

// Very naive markdown → plain text with some minimal HTML rendering
function renderMarkdown(md: string): string {
	return (
		md
			// Strip MDX/JSX component tags
			.replace(/<[A-Z][^>]*\/>/g, "")
			.replace(/<[A-Z][^>]*>[\s\S]*?<\/[A-Z][^>]*>/g, "")
			// headings → bold
			.replace(/^#{1,6}\s+(.+)$/gm, "<strong>$1</strong>")
			// bold
			.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
			.replace(/__(.+?)__/g, "<strong>$1</strong>")
			// italic
			.replace(/\*(.+?)\*/g, "<em>$1</em>")
			.replace(/_(.+?)_/g, "<em>$1</em>")
			// inline code
			.replace(
				/`([^`]+)`/g,
				'<code style="background:#e8e4d8;padding:1px 3px;font-family:monospace">$1</code>',
			)
			// code blocks — strip them
			.replace(/```[\s\S]*?```/g, "<em>[code block]</em>")
			// links
			.replace(
				/\[([^\]]+)\]\(([^)]+)\)/g,
				'<a href="$2" style="color:#003399" target="_blank">$1</a>',
			)
			// horizontal rules
			.replace(/^---+$/gm, '<hr style="border:1px solid #c0b89a">')
			// paragraphs: double newlines
			.replace(/\n\n+/g, '</p><p style="margin:0 0 10px">')
			.trim()
	);
}

function PostEntry({
	post,
	mood,
	music,
}: {
	post: BlogPost;
	mood: (typeof FAKE_MOODS)[0];
	music: string;
}) {
	const [expanded, setExpanded] = useState(false);
	const rendered = renderMarkdown(post.content);

	// Show a teaser — first ~400 chars of rendered content
	const isLong = rendered.length > 400;
	const teaser = isLong && !expanded ? `${rendered.slice(0, 400)}...` : rendered;

	return (
		<div
			style={{
				marginBottom: 0,
				borderBottom: "1px solid #c0b89a",
			}}
		>
			{/* Entry header with date */}
			<div
				style={{
					background: "#d9d0b8",
					borderBottom: "1px solid #b8b098",
					padding: "4px 10px",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<span
					style={{
						fontFamily: "Verdana, Arial, sans-serif",
						fontSize: 11,
						color: "#555533",
						fontWeight: "bold",
					}}
				>
					{formatLJDate(post.date)}
				</span>
				<span
					style={{
						fontFamily: "Verdana, Arial, sans-serif",
						fontSize: 10,
						color: "#888866",
					}}
				>
					{post.readingTime}
				</span>
			</div>

			{/* Entry body */}
			<div style={{ padding: "10px 14px", background: "#faf7f0" }}>
				{/* Subject */}
				<div
					style={{
						fontFamily: "Georgia, 'Times New Roman', serif",
						fontSize: 15,
						fontWeight: "bold",
						color: "#003399",
						marginBottom: 8,
					}}
				>
					<a
						href={`/blog/${post.slug}`}
						target="_blank"
						rel="noreferrer"
						style={{ color: "#003399", textDecoration: "none" }}
						onClick={(e) => e.stopPropagation()}
					>
						{post.title}
					</a>
				</div>

				{/* Content */}
				<div
					// biome-ignore lint/security/noDangerouslySetInnerHtml: rendering our own markdown content
					dangerouslySetInnerHTML={{
						__html: `<p style="margin:0 0 10px">${teaser}</p>`,
					}}
					style={{
						fontFamily: "Georgia, 'Times New Roman', serif",
						fontSize: 13,
						color: "#333311",
						lineHeight: 1.6,
					}}
				/>

				{isLong && (
					<button
						type="button"
						onClick={() => setExpanded((v) => !v)}
						style={{
							fontFamily: "Verdana, Arial, sans-serif",
							fontSize: 11,
							color: "#003399",
							cursor: "pointer",
							textDecoration: "underline",
							display: "block",
							marginTop: 4,
							background: "none",
							border: "none",
							padding: 0,
						}}
					>
						{expanded ? "( collapse )" : "( read more... )"}
					</button>
				)}

				{/* LJ-style metadata footer */}
				<div
					style={{
						marginTop: 12,
						paddingTop: 8,
						borderTop: "1px dashed #c0b89a",
						fontFamily: "Verdana, Arial, sans-serif",
						fontSize: 11,
						color: "#666644",
					}}
				>
					<div style={{ marginBottom: 2 }}>
						<span style={{ color: "#888866" }}>Current Mood: </span>
						<span style={{ color: "#003399" }}>
							{mood.icon} {mood.mood}
						</span>
					</div>
					<div style={{ marginBottom: 2 }}>
						<span style={{ color: "#888866" }}>Current Music: </span>
						<span style={{ color: "#333311", fontStyle: "italic" }}>{music}</span>
					</div>
					{post.tags.length > 0 && (
						<div>
							<span style={{ color: "#888866" }}>Tags: </span>
							{post.tags.map((tag, i) => (
								<span key={tag}>
									<a
										href={`/blog/tag/${tag}`}
										target="_blank"
										rel="noreferrer"
										style={{ color: "#003399", textDecoration: "none" }}
										onClick={(e) => e.stopPropagation()}
									>
										{tag}
									</a>
									{i < post.tags.length - 1 && ", "}
								</span>
							))}
						</div>
					)}
				</div>

				{/* Comments line */}
				<div
					style={{
						marginTop: 8,
						fontFamily: "Verdana, Arial, sans-serif",
						fontSize: 11,
						color: "#888866",
						textAlign: "right",
					}}
				>
					<a
						href={`/blog/${post.slug}#comments`}
						target="_blank"
						rel="noreferrer"
						style={{ color: "#003399" }}
						onClick={(e) => e.stopPropagation()}
					>
						(leave a comment)
					</a>
				</div>
			</div>
		</div>
	);
}

export function BlogApp() {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetch("/blog/feed.json")
			.then((r) => r.json())
			.then((data) => {
				setPosts(data as BlogPost[]);
				setLoading(false);
			})
			.catch((e) => {
				setError(e instanceof Error ? e.message : "Failed to load posts");
				setLoading(false);
			});
	}, []);

	// Deterministic fake metadata per post (stable across renders)
	const postMeta = posts.map((_p, i) => ({
		mood: FAKE_MOODS[i % FAKE_MOODS.length]!,
		music: FAKE_MUSIC[i % FAKE_MUSIC.length]!,
	}));

	return (
		<div
			style={{
				flex: 1,
				display: "flex",
				flexDirection: "column",
				background: "#c0c0c0",
				overflow: "hidden",
			}}
		>
			{/* CSS animations */}
			<style>{`
				@keyframes ljBlink {
					0%, 49% { opacity: 1; }
					50%, 100% { opacity: 0; }
				}
				@keyframes ljMarquee {
					from { transform: translateX(100%); }
					to   { transform: translateX(-100%); }
				}
			`}</style>

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
					fontFamily: "Arial, sans-serif",
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
					http://www.livejournal.com/users/lemonsaurus
				</div>
			</div>

			{/* Main LJ page */}
			<div
				style={{
					flex: 1,
					overflow: "auto",
					background: "#f5f0e8",
				}}
			>
				{/* LJ page header bar */}
				<div
					style={{
						background: "#003399",
						padding: "4px 10px",
						display: "flex",
						alignItems: "center",
						gap: 10,
					}}
				>
					{/* LJ-style pencil logo */}
					<div
						style={{
							background: "#6699cc",
							border: "2px outset #99bbee",
							padding: "2px 6px",
							fontFamily: "Georgia, serif",
							fontSize: 13,
							fontWeight: "bold",
							color: "#fff",
							letterSpacing: "0.05em",
						}}
					>
						LJ
					</div>
					<span
						style={{
							fontFamily: "Verdana, Arial, sans-serif",
							fontSize: 11,
							color: "#99ccff",
						}}
					>
						LiveJournal
					</span>
					<div style={{ flex: 1 }} />
					<span
						style={{
							fontFamily: "Verdana, Arial, sans-serif",
							fontSize: 10,
							color: "#6699cc",
						}}
					>
						[{" "}
						<span style={{ color: "#99ccff", textDecoration: "underline", cursor: "default" }}>
							update journal
						</span>{" "}
						] [{" "}
						<span style={{ color: "#99ccff", textDecoration: "underline", cursor: "default" }}>
							friends
						</span>{" "}
						] [{" "}
						<span style={{ color: "#99ccff", textDecoration: "underline", cursor: "default" }}>
							userinfo
						</span>{" "}
						]
					</span>
				</div>

				{/* Layout: sidebar + entries */}
				<div style={{ display: "flex", gap: 0, alignItems: "flex-start" }}>
					{/* Sidebar */}
					<div
						style={{
							width: 160,
							flexShrink: 0,
							borderRight: "1px solid #c0b89a",
							background: "#eee8d5",
							padding: "10px 8px",
							fontFamily: "Verdana, Arial, sans-serif",
							fontSize: 11,
						}}
					>
						{/* Userpic placeholder */}
						<div
							style={{
								width: 100,
								height: 100,
								margin: "0 auto 8px",
								background: "#d9d0b8",
								border: "2px inset #b8b098",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: 40,
								color: "#998866",
							}}
						>
							🍋
						</div>

						{/* Username */}
						<div
							style={{
								textAlign: "center",
								fontWeight: "bold",
								color: "#003399",
								marginBottom: 6,
								fontSize: 13,
								fontFamily: "Georgia, serif",
							}}
						>
							lemonsaurus
						</div>
						<div
							style={{
								textAlign: "center",
								color: "#666644",
								fontSize: 10,
								fontStyle: "italic",
								marginBottom: 10,
							}}
						>
							a citrus dinosaur
						</div>

						{/* Separator */}
						<div style={{ borderTop: "1px solid #c0b89a", marginBottom: 8 }} />

						{/* User info */}
						<SidebarSection title="Userinfo">
							<SidebarRow label="Entries:" value={String(posts.length || "…")} />
							<SidebarRow label="Friends:" value="42" />
							<SidebarRow label="Of:" value="17" />
							<SidebarRow label="Member:" value="Since 2003" />
							<SidebarRow label="Location:" value="Oslo, NO" />
						</SidebarSection>

						{/* Separator */}
						<div style={{ borderTop: "1px solid #c0b89a", margin: "8px 0" }} />

						{/* Recent entries */}
						<SidebarSection title="Recent Entries">
							{posts.slice(0, 5).map((p) => (
								<div key={p.slug} style={{ marginBottom: 4 }}>
									<a
										href={`/blog/${p.slug}`}
										target="_blank"
										rel="noreferrer"
										style={{ color: "#003399", textDecoration: "none", fontSize: 10 }}
									>
										{p.title.length > 22 ? `${p.title.slice(0, 22)}…` : p.title}
									</a>
								</div>
							))}
						</SidebarSection>

						{/* Separator */}
						<div style={{ borderTop: "1px solid #c0b89a", margin: "8px 0" }} />

						{/* Calendar widget */}
						<SidebarSection title="Calendar">
							<MiniCalendar posts={posts} />
						</SidebarSection>

						{/* Separator */}
						<div style={{ borderTop: "1px solid #c0b89a", margin: "8px 0" }} />

						{/* Easter egg: blinking "online now!" */}
						<div
							style={{
								textAlign: "center",
								fontSize: 9,
								color: "#009900",
								fontWeight: "bold",
								animation: "ljBlink 1.5s step-end infinite",
							}}
						>
							● ONLINE NOW
						</div>

						<div style={{ marginTop: 8, textAlign: "center" }}>
							{/* Friend button */}
							<button
								type="button"
								style={{
									background: "#003399",
									color: "#fff",
									border: "2px outset #6699cc",
									fontFamily: "Verdana, sans-serif",
									fontSize: 10,
									padding: "2px 8px",
									cursor: "pointer",
									display: "block",
									width: "100%",
									marginBottom: 4,
								}}
							>
								Add Friend
							</button>
							<button
								type="button"
								style={{
									background: "#c0c0c0",
									color: "#000",
									border: "2px outset #fff",
									fontFamily: "Verdana, sans-serif",
									fontSize: 10,
									padding: "2px 8px",
									cursor: "pointer",
									display: "block",
									width: "100%",
								}}
							>
								Message
							</button>
						</div>
					</div>

					{/* Main entries column */}
					<div style={{ flex: 1, minWidth: 0 }}>
						{/* Journal header */}
						<div
							style={{
								background: "#d9d0b8",
								borderBottom: "2px solid #b8b098",
								padding: "10px 14px",
							}}
						>
							<div
								style={{
									fontFamily: "Georgia, 'Times New Roman', serif",
									fontSize: 20,
									fontWeight: "bold",
									color: "#003399",
									marginBottom: 2,
								}}
							>
								lemonsaurus's journal
							</div>
							<div
								style={{
									fontFamily: "Verdana, Arial, sans-serif",
									fontSize: 11,
									color: "#666644",
									fontStyle: "italic",
								}}
							>
								"a citrus dinosaur who writes code and occasionally writes words"
							</div>
						</div>

						{/* Scrolling marquee easter egg */}
						<div
							style={{
								background: "#003399",
								overflow: "hidden",
								padding: "2px 0",
								borderBottom: "1px solid #6699cc",
							}}
						>
							<div
								style={{
									display: "inline-block",
									animation: "ljMarquee 25s linear infinite",
									whiteSpace: "nowrap",
									fontFamily: "Verdana, sans-serif",
									fontSize: 10,
									color: "#ffff99",
								}}
							>
								★ WELCOME TO MY LIVEJOURNAL ★ &nbsp;&nbsp; don't steal my layout!!! &nbsp;&nbsp; ★
								PROTECTED ENTRIES require you to be on my friends list ★ &nbsp;&nbsp; best viewed at
								1024x768 in IE6 &nbsp;&nbsp; ★ NO DRAMA PLZ ★
							</div>
						</div>

						{/* Posts */}
						{loading && (
							<div
								style={{
									padding: 24,
									fontFamily: "Verdana, Arial, sans-serif",
									fontSize: 12,
									color: "#888866",
									textAlign: "center",
								}}
							>
								Loading journal entries...
							</div>
						)}

						{error && (
							<div
								style={{
									padding: 24,
									fontFamily: "Verdana, Arial, sans-serif",
									fontSize: 12,
									color: "#cc3333",
									textAlign: "center",
								}}
							>
								Error loading posts: {error}
							</div>
						)}

						{!loading && !error && posts.length === 0 && (
							<div
								style={{
									padding: 24,
									fontFamily: "Georgia, serif",
									fontSize: 13,
									color: "#666644",
									textAlign: "center",
									fontStyle: "italic",
								}}
							>
								No journal entries yet. *tumbleweed*
							</div>
						)}

						{posts.map((post, i) => (
							<PostEntry
								key={post.slug}
								post={post}
								mood={postMeta[i]!.mood}
								music={postMeta[i]!.music}
							/>
						))}

						{/* Footer */}
						{!loading && posts.length > 0 && (
							<div
								style={{
									padding: "10px 14px",
									fontFamily: "Verdana, Arial, sans-serif",
									fontSize: 10,
									color: "#888866",
									textAlign: "center",
									borderTop: "1px solid #c0b89a",
									background: "#eee8d5",
								}}
							>
								[{" "}
								<span style={{ color: "#003399", textDecoration: "underline", cursor: "default" }}>
									earlier entries
								</span>{" "}
								]{" — "}
								Powered by <span style={{ color: "#003399", fontWeight: "bold" }}>LiveJournal</span>
								{" — "}
								<span
									style={{ animation: "ljBlink 2s step-end infinite", display: "inline-block" }}
								>
									♥
								</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div style={{ marginBottom: 6 }}>
			<div
				style={{
					fontWeight: "bold",
					color: "#555533",
					fontSize: 11,
					marginBottom: 4,
					textTransform: "uppercase",
					letterSpacing: "0.05em",
				}}
			>
				{title}
			</div>
			{children}
		</div>
	);
}

function SidebarRow({ label, value }: { label: string; value: string }) {
	return (
		<div
			style={{ display: "flex", justifyContent: "space-between", marginBottom: 2, fontSize: 10 }}
		>
			<span style={{ color: "#888866" }}>{label}</span>
			<span style={{ color: "#333311", fontWeight: "bold" }}>{value}</span>
		</div>
	);
}

function MiniCalendar({ posts }: { posts: BlogPost[] }) {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth();
	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];

	// Which days in this month have posts?
	const activeDays = new Set(
		posts
			.map((p) => new Date(p.date))
			.filter((d) => d.getFullYear() === year && d.getMonth() === month)
			.map((d) => d.getDate()),
	);

	const firstDay = new Date(year, month, 1).getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	const cells: (number | null)[] = [
		...Array(firstDay).fill(null),
		...Array.from({ length: daysInMonth }, (_, i) => i + 1),
	];

	// Pad to full weeks
	while (cells.length % 7 !== 0) cells.push(null);

	return (
		<div>
			<div
				style={{
					textAlign: "center",
					fontWeight: "bold",
					color: "#555533",
					fontSize: 10,
					marginBottom: 4,
				}}
			>
				{months[month]} {year}
			</div>
			<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9 }}>
				<thead>
					<tr>
						{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
							<th
								key={d}
								style={{
									color: "#888866",
									fontWeight: "normal",
									padding: "1px 0",
									textAlign: "center",
								}}
							>
								{d}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{Array.from({ length: cells.length / 7 }, (_, row) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: calendar row, index is appropriate
						<tr key={row}>
							{cells.slice(row * 7, row * 7 + 7).map((day, col) => (
								<td
									// biome-ignore lint/suspicious/noArrayIndexKey: calendar grid — row+col is the natural coordinate key
									key={`${row}-${col}`}
									style={{
										textAlign: "center",
										padding: "1px 0",
										color: day && activeDays.has(day) ? "#003399" : "#888866",
										fontWeight: day && activeDays.has(day) ? "bold" : "normal",
										textDecoration: day && activeDays.has(day) ? "underline" : "none",
										cursor: day && activeDays.has(day) ? "pointer" : "default",
									}}
								>
									{day ?? ""}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
