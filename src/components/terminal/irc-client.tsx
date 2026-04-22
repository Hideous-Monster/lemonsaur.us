"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/telemetry";

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
type LemonStatus = "online" | "idle" | "dnd" | "offline";

const RAINBOW_NICK_STYLE = {
	backgroundImage: "linear-gradient(90deg, #ff5050, #ff9040, #e8e040, #40b848, #5090ff, #b860d0)",
	WebkitBackgroundClip: "text",
	WebkitTextFillColor: "transparent",
	backgroundClip: "text",
	fontWeight: "bold" as const,
};

const CARLA_NICK_COLOR = "#40b848";

const FONT_SIZE = "16px";

function formatTime(date: Date): string {
	return `[${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}]`;
}

function NickSpan({ nick }: { nick: string }) {
	if (nick === "@lemonsaurus") {
		return <span style={RAINBOW_NICK_STYLE}>&lt;{nick}&gt;</span>;
	}
	if (nick === "Carla") {
		return <span style={{ color: CARLA_NICK_COLOR, fontWeight: "bold" }}>&lt;{nick}&gt;</span>;
	}
	return <span style={{ color: "#70d0b0" }}>&lt;{nick}&gt;</span>;
}

// ── Status indicator ─────────────────────────────────────────────────────────

function StatusIndicator({ status }: { status: LemonStatus }) {
	const configs: Record<LemonStatus, { color: string; label: string }> = {
		online: { color: "#44dd44", label: "lemonsaurus is online" },
		idle: { color: "#e8c020", label: "lemonsaurus is idle" },
		dnd: { color: "#ff4040", label: "lemonsaurus is busy" },
		offline: { color: "#888888", label: "lemonsaurus is offline — chatting with Carla" },
	};

	const { color, label } = configs[status];

	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: 6,
				padding: "3px 10px",
				borderBottom: "1px solid #1a2a1a",
				backgroundColor: "#060e06",
				flexShrink: 0,
			}}
		>
			<span
				style={{
					display: "inline-block",
					width: 7,
					height: 7,
					borderRadius: "50%",
					background: color,
					boxShadow: `0 0 4px ${color}`,
					flexShrink: 0,
				}}
			/>
			<span style={{ color: "#688850", fontSize: 12 }}>{label}</span>
		</div>
	);
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

const MAX_MESSAGE_LENGTH = 500;
const CHAR_COUNTER_THRESHOLD = 400;
const COOLDOWN_SECONDS = 2;

export function IrcClient({ onExit }: IrcClientProps) {
	const [messages, setMessages] = useState<IrcMessage[]>([]);
	const [input, setInput] = useState("");
	const [stage, setStage] = useState<ConnectionStage>("nick-select");
	const [nick, setNick] = useState("");
	const [threadId, setThreadId] = useState<string | null>(null);
	const [lemonStatus, setLemonStatus] = useState<LemonStatus>("offline");
	const [carlaMode, setCarlaMode] = useState(false);
	const [statusChecked, setStatusChecked] = useState(false);
	const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
	const [isKicked, setIsKicked] = useState(false);

	const scrollRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const motdIndexRef = useRef(0);
	const motdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastPollTimeRef = useRef<string | null>(null);
	const seenMessageIds = useRef<Set<string>>(new Set());
	const carlaHistoryRef = useRef<Array<{ role: "user" | "assistant"; content: string }>>([]);
	const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const hasSentMessageRef = useRef(false);
	const [carlaThreadId, setCarlaThreadId] = useState<string | null>(null);
	const [carlaTyping, setCarlaTyping] = useState(false);

	const addMessage = useCallback((msg: Omit<IrcMessage, "timestamp">) => {
		setMessages((prev) => [...prev, { ...msg, timestamp: new Date() }]);
	}, []);

	// Check status once on mount
	useEffect(() => {
		async function checkStatus() {
			try {
				const res = await fetch("/api/irc/status");
				if (res.ok) {
					const data = await res.json();
					const status: LemonStatus = data.status ?? "offline";
					setLemonStatus(status);
					setCarlaMode(status !== "online");
				} else {
					setCarlaMode(true);
				}
			} catch {
				setCarlaMode(true);
			} finally {
				setStatusChecked(true);
			}
		}

		checkStatus();
	}, []);

	// Auto-scroll on new messages or typing indicator
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally scroll on messages/typing change
	useEffect(() => {
		setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }), 0);
	}, [messages, carlaTyping]);

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
				// MOTD done — add Carla notice if she's covering, then start joining
				if (carlaMode) {
					setMessages((prev) => [
						...prev,
						{
							type: "system",
							text: "* lemonsaurus is currently away.",
							timestamp: new Date(),
							nick: JSON.stringify({ color: "#b8a030" }),
						},
						{
							type: "system",
							text: "* Carla is here!",
							timestamp: new Date(),
							nick: JSON.stringify({ color: CARLA_NICK_COLOR }),
						},
						{
							type: "system",
							text: "",
							timestamp: new Date(),
						},
					]);
				}
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
	}, [stage, carlaMode]);

	// Start joining sequence after MOTD
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
			carlaMode
				? { text: "* Carla has joined #lemonsaurus", color: CARLA_NICK_COLOR }
				: { text: "* lemonsaurus is here (@lemonsaurus) [operator]", color: "#b8a030" },
			{ text: `* ${nick} has joined #lemonsaurus`, color: "#40b848" },
			{ text: "" },
		];

		let i = 0;
		function typeJoinLine() {
			if (i >= joinLines.length) {
				if (carlaMode) {
					// Carla mode — restore saved thread, go straight to chat
					const savedThread = localStorage.getItem(`irc-carla-thread-${nick}`);
					if (savedThread) {
						setCarlaThreadId(savedThread);
						lastPollTimeRef.current = new Date().toISOString();
					}
					setStage("chat");
				} else {
					connectToDiscord();
				}
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
				const savedThread = localStorage.getItem(`irc-thread-${nick}`);
				const res = await fetch("/api/irc/connect", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ nick, threadId: savedThread }),
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
				localStorage.setItem(`irc-thread-${nick}`, data.threadId);
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
	}, [stage, nick, addMessage, carlaMode]);

	// Start polling for replies once in chat
	// Discord mode: polls using the main threadId for lemon's replies
	// Carla mode: polls using carlaThreadIdRef once a thread is created (so lemon can jump in)
	useEffect(() => {
		if (stage !== "chat") return;

		const activeThreadId = carlaMode ? carlaThreadId : threadId;
		if (!activeThreadId) return;

		async function poll() {
			const pollThreadId = carlaMode ? carlaThreadId : threadId;
			if (!pollThreadId) return;

			try {
				const url = new URL("/api/irc/messages", window.location.origin);
				url.searchParams.set("threadId", pollThreadId);
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
						// If we're in Carla mode and lemon replies, switch to lemon mode
						if (carlaMode) {
							setCarlaMode(false);
							setLemonStatus("online");
							setThreadId(carlaThreadId);
							setMessages((prev) => [
								...prev,
								{
									type: "system",
									text: "* lemonsaurus has joined the conversation!",
									timestamp: new Date(),
									nick: JSON.stringify({ color: "#40b848", bold: true }),
								},
								...unseen.map((m) => ({
									type: "message" as const,
									nick: "@lemonsaurus",
									text: m.content,
									timestamp: new Date(m.timestamp),
								})),
							]);
						} else {
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
				}
			} catch {
				// Silent
			}
		}

		pollIntervalRef.current = setInterval(poll, 3000);

		return () => {
			if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
		};
	}, [stage, threadId, carlaMode, carlaThreadId]);

	// Send disconnect notification on unmount / tab close (only if user actually chatted)
	useEffect(() => {
		function sendDisconnect() {
			if (!hasSentMessageRef.current) return;
			const activeThreadId = carlaMode ? carlaThreadId : threadId;
			if (!activeThreadId || !nick) return;
			navigator.sendBeacon(
				"/api/irc/disconnect",
				new Blob([JSON.stringify({ threadId: activeThreadId, nick })], {
					type: "application/json",
				}),
			);
		}

		window.addEventListener("beforeunload", sendDisconnect);
		return () => {
			window.removeEventListener("beforeunload", sendDisconnect);
			sendDisconnect();
		};
	}, [nick, threadId, carlaThreadId, carlaMode]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
			if (motdTimerRef.current) clearTimeout(motdTimerRef.current);
			if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
		};
	}, []);

	const handleNickChosen = useCallback(
		(chosenNick: string) => {
			setNick(chosenNick);
			track("chat_opened", { surface: "irc" });
			track("identify", { nick: chosenNick });
			// Wait for status check before proceeding
			if (statusChecked) {
				setStage("intro");
			} else {
				// Status check should be near-instant, but handle the edge case
				const waitForStatus = setInterval(() => {
					// statusChecked will be updated by the time this runs
					setStage("intro");
					clearInterval(waitForStatus);
				}, 100);
			}
		},
		[statusChecked],
	);

	const sendToCarla = useCallback(
		async (userMessage: string) => {
			// Add to history
			carlaHistoryRef.current = [
				...carlaHistoryRef.current,
				{ role: "user" as const, content: userMessage },
			].slice(-20);

			try {
				const res = await fetch("/api/irc/chat", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						messages: carlaHistoryRef.current,
						nick,
						threadId: carlaThreadId,
					}),
				});

				const data = await res.json();

				if (!res.ok) {
					addMessage({
						type: "system",
						text: `* Carla seems to be having trouble responding. (${data.error ?? "Unknown error"})`,
					});
					return;
				}

				const reply: string = data.reply ?? "Sorry, I couldn't come up with a response!";
				const wasKicked: boolean = data.kicked === true;
				const kickReason: string | null =
					typeof data.kickReason === "string" ? data.kickReason : null;

				// Store thread ID for subsequent requests and polling
				if (data.threadId) {
					if (data.threadId !== carlaThreadId) {
						setCarlaThreadId(data.threadId);
						localStorage.setItem(`irc-carla-thread-${nick}`, data.threadId);
					}
					if (!lastPollTimeRef.current) {
						lastPollTimeRef.current = new Date().toISOString();
					}
				}

				carlaHistoryRef.current = [
					...carlaHistoryRef.current,
					{ role: "assistant" as const, content: reply },
				].slice(-20);

				// Typing delay: wordCount / 100 WPM, min 1s, max 8s
				const wordCount = reply.trim().split(/\s+/).length;
				const delayMs = Math.min(Math.max((wordCount / 100) * 60 * 1000, 1000), 8000);

				setCarlaTyping(true);
				setTimeout(() => {
					setCarlaTyping(false);
					addMessage({ type: "message", nick: "Carla", text: reply });
					if (wasKicked) {
						setIsKicked(true);
						addMessage({
							type: "system",
							text: `* ${nick} was kicked from #lemonsaurus by Carla (${kickReason ?? "no reason given"})`,
						});
					}
				}, delayMs);
			} catch {
				addMessage({
					type: "system",
					text: "* Carla seems to be away too. Try again in a moment!",
				});
			}
		},
		[nick, addMessage, carlaThreadId],
	);

	const startCooldown = useCallback(() => {
		setCooldownSeconds(COOLDOWN_SECONDS);
		if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
		cooldownIntervalRef.current = setInterval(() => {
			setCooldownSeconds((prev) => {
				if (prev <= 1) {
					if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
					setTimeout(() => inputRef.current?.focus(), 10);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	}, []);

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			const trimmed = input.trim();
			setInput("");

			if (!trimmed || stage !== "chat" || isKicked) return;

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
					track("identify", { nick: newNick });
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
			hasSentMessageRef.current = true;
			addMessage({ type: "message", nick, text: trimmed });
			startCooldown();

			if (carlaMode) {
				// Carla mode — send to AI
				sendToCarla(trimmed);
				return;
			}

			// Discord mode — send to thread
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
		[
			input,
			stage,
			nick,
			threadId,
			carlaMode,
			addMessage,
			onExit,
			sendToCarla,
			startCooldown,
			isKicked,
		],
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
			{/* Status indicator */}
			<StatusIndicator status={lemonStatus} />

			{/* Scrollable message area */}
			<div
				ref={scrollRef}
				style={{
					flex: 1,
					overflowY: "auto",
					scrollbarWidth: "none",
					overflowX: "hidden",
					padding: "10px 14px",
					scrollbarGutter: "stable",
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
				<div
					style={{
						borderTop: "1px solid #2a3a2a",
						backgroundColor: "#060e06",
						flexShrink: 0,
					}}
				>
					<form
						onSubmit={handleSubmit}
						style={{
							display: "flex",
							alignItems: "center",
							padding: "10px 14px",
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
							[#lemonsaurus]
							{isKicked ? (
								<span style={{ color: "#a04040", marginLeft: 4 }}>(kicked)</span>
							) : cooldownSeconds > 0 ? (
								<span style={{ color: "#405030", marginLeft: 4 }}>({cooldownSeconds}s)</span>
							) : null}{" "}
						</span>
						<input
							ref={inputRef}
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							disabled={cooldownSeconds > 0 || isKicked}
							maxLength={MAX_MESSAGE_LENGTH}
							placeholder={isKicked ? "you have been kicked from the channel" : undefined}
							style={{
								flex: 1,
								background: "transparent",
								border: "none",
								outline: "none",
								color: cooldownSeconds > 0 || isKicked ? "#405030" : "#e8e040",
								fontFamily: "monospace",
								fontSize: FONT_SIZE,
								caretColor: "#e8e040",
								cursor: cooldownSeconds > 0 || isKicked ? "not-allowed" : "text",
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
					{input.length > CHAR_COUNTER_THRESHOLD && (
						<div
							style={{
								textAlign: "right",
								paddingRight: 14,
								paddingBottom: 4,
								fontSize: 11,
								color: input.length >= MAX_MESSAGE_LENGTH ? "#ff5050" : "#4a5a3a",
								fontFamily: "monospace",
							}}
						>
							{input.length}/{MAX_MESSAGE_LENGTH}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
