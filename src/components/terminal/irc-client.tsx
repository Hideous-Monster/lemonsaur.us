"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface IrcMessage {
	type: "system" | "message" | "action";
	nick?: string;
	text: string;
	timestamp: Date;
}

interface IrcClientProps {
	onExit: () => void;
}

type ConnectionStage = "nick-select" | "intro" | "joining" | "chat";

const RAINBOW_NICK_STYLE = {
	backgroundImage: "linear-gradient(90deg, #ff5050, #ff9040, #e8e040, #40b848, #5090ff, #b860d0)",
	WebkitBackgroundClip: "text",
	WebkitTextFillColor: "transparent",
	backgroundClip: "text",
	fontWeight: "bold" as const,
};

const FONT_SIZE = "16px";

function formatTime(date: Date): string {
	return `[${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}]`;
}

function NickSpan({ nick }: { nick: string }) {
	if (nick === "@lemonsaurus") {
		return <span style={RAINBOW_NICK_STYLE}>&lt;{nick}&gt;</span>;
	}
	return <span style={{ color: "#70d0b0" }}>&lt;{nick}&gt;</span>;
}

// ── Nick selection TUI ──────────────────────────────────────────────────────

function NickSelectScreen({
	onChoose,
	onCancel,
}: {
	onChoose: (nick: string) => void;
	onCancel: () => void;
}) {
	const savedNick = typeof window !== "undefined" ? (localStorage.getItem("irc-nick") ?? "") : "";
	const [value, setValue] = useState(savedNick);
	const [error, setError] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		setTimeout(() => inputRef.current?.focus(), 50);
	}, []);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = value.trim();
		if (!trimmed) {
			setError("You need a nickname to connect.");
			return;
		}
		if (!/^[a-zA-Z0-9_]{1,16}$/.test(trimmed)) {
			setError("1-16 characters, letters/numbers/underscores only.");
			return;
		}
		localStorage.setItem("irc-nick", trimmed);
		onChoose(trimmed);
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				height: "100%",
				width: "100%",
				backgroundColor: "#0a140a",
				fontFamily: "monospace",
				padding: 24,
			}}
		>
			{/* Box */}
			<div
				style={{
					border: "2px solid #e8e040",
					borderRadius: 0,
					padding: "28px 36px",
					maxWidth: 440,
					width: "100%",
					background: "#0f1e0f",
					boxShadow: "0 0 30px rgba(232, 224, 64, 0.08)",
				}}
			>
				{/* Title */}
				<div
					style={{
						textAlign: "center",
						marginBottom: 20,
					}}
				>
					<div style={{ color: "#e8e040", fontSize: 20, fontWeight: "bold", marginBottom: 6 }}>
						LemonNET IRC
					</div>
					<div style={{ color: "#688850", fontSize: 13 }}>Connect to #lemonsaurus</div>
				</div>

				{/* Divider */}
				<div style={{ borderTop: "1px solid #2a3a2a", marginBottom: 20 }} />

				{/* Label */}
				<div style={{ color: "#b8d850", fontSize: 15, marginBottom: 10 }}>Choose a nickname:</div>

				{/* Input */}
				<form onSubmit={handleSubmit}>
					<input
						ref={inputRef}
						type="text"
						value={value}
						onChange={(e) => {
							setValue(e.target.value);
							setError("");
						}}
						onKeyDown={(e) => {
							if (e.key === "Escape") onCancel();
						}}
						maxLength={16}
						style={{
							width: "100%",
							background: "#060e06",
							border: "1px solid #405030",
							color: "#e8e040",
							fontFamily: "monospace",
							fontSize: 18,
							fontWeight: "bold",
							padding: "10px 14px",
							outline: "none",
							caretColor: "#e8e040",
							boxSizing: "border-box",
						}}
						autoComplete="off"
						autoCorrect="off"
						autoCapitalize="off"
						spellCheck={false}
						// biome-ignore lint/a11y/noAutofocus: nick input must auto-focus
						autoFocus
						placeholder="coolperson87"
						aria-label="Nickname"
					/>

					{/* Error */}
					{error && <div style={{ color: "#ff5050", fontSize: 13, marginTop: 8 }}>{error}</div>}

					{/* Buttons */}
					<div
						style={{
							display: "flex",
							gap: 12,
							marginTop: 16,
							justifyContent: "flex-end",
						}}
					>
						<button
							type="button"
							onClick={onCancel}
							style={{
								background: "transparent",
								border: "1px solid #405030",
								color: "#688850",
								fontFamily: "monospace",
								fontSize: 14,
								padding: "6px 16px",
								cursor: "pointer",
							}}
						>
							ESC Cancel
						</button>
						<button
							type="submit"
							style={{
								background: "#2a3a2a",
								border: "1px solid #e8e040",
								color: "#e8e040",
								fontFamily: "monospace",
								fontSize: 14,
								fontWeight: "bold",
								padding: "6px 20px",
								cursor: "pointer",
							}}
						>
							Connect →
						</button>
					</div>
				</form>

				{/* Hint */}
				<div style={{ color: "#405030", fontSize: 11, marginTop: 16, textAlign: "center" }}>
					Messages are delivered in real time. lemonsaurus may take a moment to respond.
				</div>
			</div>
		</div>
	);
}

// ── MOTD rendering ──────────────────────────────────────────────────────────

interface MotdLine {
	text: string;
	color?: string;
	bold?: boolean;
}

const MOTD: MotdLine[] = [
	{ text: "* Looking up irc.lemonnet.org...", color: "#688850" },
	{ text: "* Connecting to irc.lemonnet.org (174.87.42.1) port 6667...", color: "#688850" },
	{ text: "* Connected! Logging in...", color: "#40b848" },
	{ text: "" },
	{ text: " ██╗     ███████╗███╗   ███╗ ██████╗ ███╗   ██╗", color: "#ff70b0" },
	{ text: " ██║     ██╔════╝████╗ ████║██╔═══██╗████╗  ██║", color: "#ff70b0" },
	{ text: " ██║     █████╗  ██╔████╔██║██║   ██║██╔██╗ ██║", color: "#ff80b8" },
	{ text: " ██║     ██╔══╝  ██║╚██╔╝██║██║   ██║██║╚██╗██║", color: "#ff80b8" },
	{ text: " ███████╗███████╗██║ ╚═╝ ██║╚██████╔╝██║ ╚████║", color: "#ff90c0" },
	{ text: " ╚══════╝╚══════╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝", color: "#ff90c0" },
	{ text: "                    N E T", color: "#ffa0d0", bold: true },
	{ text: "" },
	{ text: " Welcome to LemonNET IRC — the juiciest network on the internet.", color: "#e8e040" },
	{ text: " This server was established in 1987 by Lemon Microsystems.", color: "#b8a030" },
	{ text: " Current users: 1  |  Channels: 1  |  Operators: 1", color: "#b8a030" },
	{ text: "" },
	{ text: " RULES:", color: "#ff5050", bold: true },
	{ text: " 1. Be excellent to each other", color: "#ff9040" },
	{ text: " 2. No flooding", color: "#ff9040" },
	{ text: " 3. Absolutely NO RAIDS.", color: "#ff5050", bold: true },
	{ text: "" },
	{ text: " End of MOTD", color: "#688850" },
	{ text: "" },
];

// ── Main IRC client ─────────────────────────────────────────────────────────

export function IrcClient({ onExit }: IrcClientProps) {
	const [messages, setMessages] = useState<IrcMessage[]>([]);
	const [input, setInput] = useState("");
	const [stage, setStage] = useState<ConnectionStage>("nick-select");
	const [nick, setNick] = useState("");
	const [threadId, setThreadId] = useState<string | null>(null);

	const scrollRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const motdIndexRef = useRef(0);
	const motdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastPollTimeRef = useRef<string | null>(null);
	const seenMessageIds = useRef<Set<string>>(new Set());

	const addMessage = useCallback((msg: Omit<IrcMessage, "timestamp">) => {
		setMessages((prev) => [...prev, { ...msg, timestamp: new Date() }]);
	}, []);

	// Auto-scroll on new messages
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally scroll on messages change
	useEffect(() => {
		scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
	}, [messages]);

	// Focus input when ready
	useEffect(() => {
		if (stage === "chat") {
			setTimeout(() => inputRef.current?.focus(), 50);
		}
	}, [stage]);

	// Type out MOTD lines one by one
	useEffect(() => {
		if (stage !== "intro") return;

		function typeNextLine() {
			const idx = motdIndexRef.current;
			if (idx >= MOTD.length) {
				// MOTD done — immediately start joining
				setStage("joining");
				return;
			}

			const line = MOTD[idx]!;
			motdIndexRef.current = idx + 1;

			setMessages((prev) => [
				...prev,
				{
					type: "system",
					text: line.text,
					timestamp: new Date(),
					// stash color/bold in nick field as a hack to avoid changing the interface
					nick: JSON.stringify({ color: line.color, bold: line.bold }),
				},
			]);
			motdTimerRef.current = setTimeout(typeNextLine, 80);
		}

		motdTimerRef.current = setTimeout(typeNextLine, 100);

		return () => {
			if (motdTimerRef.current) clearTimeout(motdTimerRef.current);
		};
	}, [stage]);

	// Start joining sequence after MOTD
	// biome-ignore lint/correctness/useExhaustiveDependencies: nick is set before stage transitions
	useEffect(() => {
		if (stage !== "joining" || !nick) return;

		const joinLines: MotdLine[] = [
			{ text: `* NICK ${nick} accepted`, color: "#40b848" },
			{ text: "* Joining #lemonsaurus...", color: "#688850" },
			{ text: "* Now talking in #lemonsaurus", color: "#40b848" },
			{
				text: `* Topic: "ask me whatever. stupid questions encouraged and embraced."`,
				color: "#e8e040",
			},
			{ text: "* Set by lemonsaurus on Mar 15 1995", color: "#688850" },
			{ text: "" },
			{ text: "* lemonsaurus is here (@lemonsaurus) [operator]", color: "#b8a030" },
			{ text: `* ${nick} has joined #lemonsaurus`, color: "#40b848" },
			{ text: "" },
		];

		let i = 0;
		function typeJoinLine() {
			if (i >= joinLines.length) {
				// Done — connect to Discord
				connectToDiscord();
				return;
			}
			const line = joinLines[i]!;
			i++;
			setMessages((prev) => [
				...prev,
				{
					type: "system",
					text: line.text,
					timestamp: new Date(),
					nick: JSON.stringify({ color: line.color, bold: line.bold }),
				},
			]);
			motdTimerRef.current = setTimeout(typeJoinLine, 120);
		}

		async function connectToDiscord() {
			try {
				const res = await fetch("/api/irc/connect", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ nick }),
				});

				const data = await res.json();

				if (!res.ok) {
					addMessage({
						type: "system",
						text: `* Server notice: ${data.error ?? "Connection failed."}`,
					});
					return;
				}

				setThreadId(data.threadId);
				lastPollTimeRef.current = new Date().toISOString();
				setStage("chat");
			} catch {
				addMessage({
					type: "system",
					text: "* Server notice: Could not reach IRC server. Check your connection.",
				});
			}
		}

		motdTimerRef.current = setTimeout(typeJoinLine, 200);

		return () => {
			if (motdTimerRef.current) clearTimeout(motdTimerRef.current);
		};
	}, [stage, nick, addMessage]);

	// Start polling for replies once in chat
	useEffect(() => {
		if (stage !== "chat" || !threadId) return;

		async function poll() {
			try {
				const url = new URL("/api/irc/messages", window.location.origin);
				url.searchParams.set("threadId", threadId!);
				if (lastPollTimeRef.current) url.searchParams.set("since", lastPollTimeRef.current);

				const res = await fetch(url.toString());
				if (!res.ok) return;

				const data = await res.json();
				const newMessages: Array<{
					id: string;
					content: string;
					timestamp: string;
					author: string;
				}> = data.messages ?? [];

				if (newMessages.length > 0) {
					lastPollTimeRef.current = newMessages[newMessages.length - 1]!.timestamp;

					const unseen = newMessages.filter((m) => !seenMessageIds.current.has(m.id));
					for (const m of unseen) {
						seenMessageIds.current.add(m.id);
					}

					if (unseen.length > 0) {
						setMessages((prev) => [
							...prev,
							...unseen.map((m) => ({
								type: "message" as const,
								nick: "@lemonsaurus",
								text: m.content,
								timestamp: new Date(m.timestamp),
							})),
						]);
					}
				}
			} catch {
				// Silent
			}
		}

		pollIntervalRef.current = setInterval(poll, 3000);

		return () => {
			if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
		};
	}, [stage, threadId]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
			if (motdTimerRef.current) clearTimeout(motdTimerRef.current);
		};
	}, []);

	const handleNickChosen = useCallback((chosenNick: string) => {
		setNick(chosenNick);
		setStage("intro");
	}, []);

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			const trimmed = input.trim();
			setInput("");

			if (!trimmed || stage !== "chat") return;

			// IRC slash commands
			if (trimmed.startsWith("/")) {
				const parts = trimmed.slice(1).split(" ");
				const cmd = parts[0]?.toLowerCase();

				if (cmd === "quit") {
					addMessage({ type: "system", text: "* Disconnecting from #lemonsaurus..." });
					addMessage({ type: "system", text: `* ${nick} has quit (Leaving)` });
					if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
					setTimeout(onExit, 800);
					return;
				}

				if (cmd === "nick" && parts[1]) {
					const newNick = parts[1];
					if (!/^[a-zA-Z0-9_]{1,16}$/.test(newNick)) {
						addMessage({
							type: "system",
							text: "* Error: Invalid nickname. Must be 1-16 alphanumeric characters.",
						});
						return;
					}
					addMessage({ type: "system", text: `* ${nick} is now known as ${newNick}` });
					setNick(newNick);
					localStorage.setItem("irc-nick", newNick);
					return;
				}

				if (cmd === "help") {
					addMessage({ type: "system", text: "* Available commands: /quit  /nick <name>" });
					return;
				}

				addMessage({ type: "system", text: `* Unknown command: ${trimmed}` });
				return;
			}

			// Regular message — show optimistically
			addMessage({ type: "message", nick, text: trimmed });

			// Send to Discord
			if (!threadId) return;

			fetch("/api/irc/send", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ threadId, nick, message: trimmed }),
			})
				.then(async (res) => {
					if (!res.ok) {
						const data = await res.json().catch(() => ({}));
						addMessage({
							type: "system",
							text: `* Server notice: ${data.error ?? "Message delivery failed."}`,
						});
					}
				})
				.catch(() => {
					addMessage({
						type: "system",
						text: "* Server notice: Could not deliver message. Check your connection.",
					});
				});
		},
		[input, stage, nick, threadId, addMessage, onExit],
	);

	// ── Nick selection screen ───────────────────────────────────────────────
	if (stage === "nick-select") {
		return <NickSelectScreen onChoose={handleNickChosen} onCancel={onExit} />;
	}

	// ── IRC view ────────────────────────────────────────────────────────────
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				width: "100%",
				backgroundColor: "#0a140a",
				color: "#e8e040",
				fontFamily: "monospace",
				fontSize: FONT_SIZE,
				overflow: "hidden",
			}}
		>
			{/* Scrollable message area */}
			<div
				ref={scrollRef}
				style={{
					flex: 1,
					overflowY: "auto",
					overflowX: "hidden",
					padding: "10px 14px",
					lineHeight: "1.7",
				}}
			>
				{messages.map((msg, i) => {
					// System messages with embedded color info
					if (msg.type !== "message") {
						let color = "#e8e040";
						let bold = false;
						if (msg.nick) {
							try {
								const meta = JSON.parse(msg.nick);
								if (meta.color) color = meta.color;
								if (meta.bold) bold = meta.bold;
							} catch {
								// ignore
							}
						}
						return (
							// biome-ignore lint/suspicious/noArrayIndexKey: messages have no stable id
							<div key={i} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
								<span style={{ color, fontWeight: bold ? "bold" : "normal" }}>{msg.text}</span>
							</div>
						);
					}

					// Chat messages
					return (
						// biome-ignore lint/suspicious/noArrayIndexKey: messages have no stable id
						<div key={i} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
							<span style={{ color: "#688850" }}>{formatTime(msg.timestamp)} </span>
							<NickSpan nick={msg.nick!} />
							<span style={{ color: "#e8e040" }}> {msg.text}</span>
						</div>
					);
				})}
			</div>

			{/* Input area */}
			{stage === "chat" && (
				<form
					onSubmit={handleSubmit}
					style={{
						display: "flex",
						alignItems: "center",
						padding: "10px 14px",
						borderTop: "1px solid #2a3a2a",
						backgroundColor: "#060e06",
						flexShrink: 0,
					}}
				>
					<span
						style={{
							color: "#688850",
							marginRight: "6px",
							whiteSpace: "nowrap",
							fontSize: FONT_SIZE,
						}}
					>
						[#lemonsaurus]{" "}
					</span>
					<input
						ref={inputRef}
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						style={{
							flex: 1,
							background: "transparent",
							border: "none",
							outline: "none",
							color: "#e8e040",
							fontFamily: "monospace",
							fontSize: FONT_SIZE,
							caretColor: "#e8e040",
						}}
						autoComplete="off"
						autoCorrect="off"
						autoCapitalize="off"
						spellCheck={false}
						// biome-ignore lint/a11y/noAutofocus: IRC input must auto-focus
						autoFocus
						aria-label="IRC message input"
					/>
				</form>
			)}
		</div>
	);
}
