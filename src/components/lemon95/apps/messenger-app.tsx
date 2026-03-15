"use client";

import { useCallback, useEffect, useRef, useState } from "react";

let msgCounter = 0;

interface LmnMessage {
	id: number;
	type: "system" | "message";
	nick?: string;
	text: string;
	timestamp: Date;
}

type ConnectionStage = "sign-in" | "signing-in" | "chat";
type LemonStatus = "online" | "idle" | "dnd" | "offline";

const EMOJI_GRID = [
	"😊",
	"😂",
	"🤣",
	"❤️",
	"😍",
	"🥺",
	"😭",
	"😘",
	"🥰",
	"😎",
	"🤔",
	"😏",
	"🙄",
	"😤",
	"😡",
	"🤯",
	"🥳",
	"🤩",
	"😴",
	"🤢",
	"💀",
	"👻",
	"👽",
	"🤖",
	"🍋",
	"🦕",
	"🔥",
	"✨",
	"💯",
	"🎉",
	"🎮",
	"🎵",
	"👍",
	"👎",
	"👋",
	"🤝",
	"✌️",
	"🤙",
	"💪",
	"🙏",
	"😺",
	"🐍",
	"🦋",
	"🌈",
	"⭐",
	"🌙",
	"☀️",
	"🌊",
];

const FONT_OPTIONS = [
	"Tahoma",
	"Comic Sans MS",
	"Arial",
	"Georgia",
	"Courier New",
	"Impact",
	"Papyrus",
	"Wingdings",
	"Lucida Console",
	"Times New Roman",
];

function formatTime(date: Date): string {
	const h = date.getHours().toString().padStart(2, "0");
	const m = date.getMinutes().toString().padStart(2, "0");
	return `${h}:${m}`;
}

// ── Status dot helper ────────────────────────────────────────────────────────

function statusDotColor(status: LemonStatus): string {
	switch (status) {
		case "online":
			return "#44dd44";
		case "idle":
			return "#e8c020";
		case "dnd":
			return "#ff4040";
		default:
			return "#888888";
	}
}

function statusLabel(status: LemonStatus, carlaMode: boolean): string {
	if (carlaMode) return "Available (covering for lemon)";
	switch (status) {
		case "online":
			return "Online";
		case "idle":
			return "Away";
		case "dnd":
			return "Busy";
		default:
			return "Offline";
	}
}

// ── LMN-style Sign In Screen ────────────────────────────────────────────────

function SignInScreen({
	onSignIn,
	serverError,
	carlaMode,
}: {
	onSignIn: (nick: string) => void;
	serverError?: string;
	carlaMode: boolean;
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
			setError("Please enter a display name.");
			return;
		}
		if (!/^[a-zA-Z0-9_]{1,16}$/.test(trimmed)) {
			setError("1-16 characters, letters/numbers/underscores only.");
			return;
		}
		localStorage.setItem("irc-nick", trimmed);
		onSignIn(trimmed);
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
				background: "linear-gradient(180deg, #f5e870 0%, #faf4c0 40%, #ffffff 100%)",
				fontFamily: "Tahoma, 'Segoe UI', Arial, sans-serif",
			}}
		>
			<div
				style={{
					background: "#ffffff",
					border: "1px solid #c8b040",
					borderRadius: 4,
					width: 340,
					boxShadow: "2px 2px 8px rgba(0,0,0,0.15)",
					overflow: "hidden",
				}}
			>
				{/* Yellow header */}
				<div
					style={{
						background: "linear-gradient(180deg, #e8d020 0%, #d4b810 50%, #c0a000 100%)",
						padding: "16px 20px",
						display: "flex",
						alignItems: "center",
						gap: 12,
					}}
				>
					<span style={{ fontSize: 32 }}>{carlaMode ? "🦋" : "🦋"}</span>
					<div>
						<div
							style={{
								color: "#ffffff",
								fontSize: 18,
								fontWeight: "bold",
								letterSpacing: "0.5px",
								textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
							}}
						>
							LMN Messenger
						</div>
						<div style={{ color: "#fff8c0", fontSize: 13 }}>Powered by LemonNet</div>
					</div>
				</div>

				{/* Server error banner */}
				{serverError && (
					<div
						style={{
							background: "#fff0f0",
							borderBottom: "1px solid #ffcccc",
							padding: "8px 16px",
							fontSize: 13,
							color: "#cc0000",
							textAlign: "center",
						}}
					>
						{serverError}
					</div>
				)}

				{/* Form area */}
				<div style={{ padding: "20px 20px 16px" }}>
					<div style={{ fontSize: 13, color: "#333", marginBottom: 4 }}>
						<strong>Sign in</strong> to start chatting
					</div>
					<div style={{ borderTop: "1px solid #d0d0d0", marginBottom: 14, marginTop: 8 }} />

					<form onSubmit={handleSubmit}>
						<label
							htmlFor="lmn-nick"
							style={{ display: "block", fontSize: 13, color: "#333", marginBottom: 4 }}
						>
							Display name:
						</label>
						<input
							id="lmn-nick"
							ref={inputRef}
							type="text"
							value={value}
							onChange={(e) => {
								setValue(e.target.value);
								setError("");
							}}
							maxLength={16}
							style={{
								width: "100%",
								border: "1px solid #c8b040",
								padding: "4px 6px",
								fontSize: 13,
								fontFamily: "Tahoma, 'Segoe UI', Arial, sans-serif",
								outline: "none",
								boxSizing: "border-box",
								marginBottom: 4,
							}}
							autoComplete="off"
							autoCorrect="off"
							autoCapitalize="off"
							spellCheck={false}
							// biome-ignore lint/a11y/noAutofocus: sign-in input must auto-focus
							autoFocus
							placeholder="e.g. coolperson87"
							aria-label="Display name"
						/>

						{error && (
							<div style={{ color: "#cc0000", fontSize: 13, marginBottom: 8 }}>{error}</div>
						)}

						<div
							style={{
								display: "flex",
								justifyContent: "flex-end",
								gap: 6,
								marginTop: 12,
							}}
						>
							<button
								type="submit"
								style={{
									background: "linear-gradient(180deg, #f8e850 0%, #e0c820 100%)",
									border: "1px solid #b0a020",
									borderRadius: 3,
									fontSize: 13,
									fontFamily: "Tahoma, 'Segoe UI', Arial, sans-serif",
									fontWeight: "bold",
									padding: "4px 20px",
									cursor: "pointer",
									color: "#333",
									boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
								}}
							>
								Sign In
							</button>
						</div>
					</form>
				</div>

				{/* Footer strip */}
				<div
					style={{
						background: "#faf0c0",
						borderTop: "1px solid #e0d080",
						padding: "6px 12px",
						fontSize: 12,
						color: "#777",
						textAlign: "center",
					}}
				>
					{carlaMode ? "Carla 🐍 is covering for lemon" : "lemonsaurus 🍋 is waiting for you"}
				</div>
			</div>
		</div>
	);
}

// ── Signing In Animation Screen ─────────────────────────────────────────────

function SigningInScreen({ nick }: { nick: string }) {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				height: "100%",
				width: "100%",
				background: "linear-gradient(180deg, #f5e870 0%, #faf4c0 40%, #ffffff 100%)",
				fontFamily: "Tahoma, 'Segoe UI', Arial, sans-serif",
				gap: 12,
			}}
		>
			<span style={{ fontSize: 40 }}>🦋</span>
			<div style={{ fontSize: 14, color: "#333" }}>
				Signing in as <strong>{nick}</strong>...
			</div>
			{/* Progress bar */}
			<div
				style={{
					width: 220,
					height: 16,
					border: "1px solid #c8b040",
					borderRadius: 2,
					background: "#faf8e8",
					overflow: "hidden",
					position: "relative",
				}}
			>
				<style>{`
					@keyframes lmn-progress {
						0%   { left: -60px; }
						100% { left: 220px; }
					}
				`}</style>
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: 60,
						height: "100%",
						background: "linear-gradient(90deg, transparent, #e8d020, transparent)",
						animationName: "lmn-progress",
						animationDuration: "1.2s",
						animationTimingFunction: "linear",
						animationIterationCount: "infinite",
					}}
				/>
			</div>
			<div style={{ fontSize: 13, color: "#777" }}>Connecting to LMN Messenger...</div>
		</div>
	);
}

const MAX_MESSAGE_LENGTH = 500;
const CHAR_COUNTER_THRESHOLD = 400;
const COOLDOWN_SECONDS = 2;

// ── Main Messenger App ──────────────────────────────────────────────────────

export function MessengerApp() {
	const [messages, setMessages] = useState<LmnMessage[]>([]);
	const [input, setInput] = useState("");
	const [stage, setStage] = useState<ConnectionStage>("sign-in");
	const [nick, setNick] = useState("");
	const [threadId, setThreadId] = useState<string | null>(null);
	const [isTyping, setIsTyping] = useState(false);
	const [chatFont, setChatFont] = useState("Tahoma");
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [connectError, setConnectError] = useState("");
	const [lemonStatus, setLemonStatus] = useState<LemonStatus>("offline");
	const [carlaMode, setCarlaMode] = useState(false);
	const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

	const scrollRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const lastPollTimeRef = useRef<string | null>(null);
	const seenMessageIds = useRef<Set<string>>(new Set());
	const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const carlaHistoryRef = useRef<Array<{ role: "user" | "assistant"; content: string }>>([]);
	const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const [carlaThreadId, setCarlaThreadId] = useState<string | null>(null);

	const addMessage = useCallback((msg: Omit<LmnMessage, "timestamp" | "id">) => {
		setMessages((prev) => [...prev, { ...msg, id: ++msgCounter, timestamp: new Date() }]);
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
			}
		}

		checkStatus();
	}, []);

	// Auto-scroll
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally scroll on messages/typing change
	useEffect(() => {
		setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }), 0);
	}, [messages, isTyping]);

	// Focus input when in chat
	useEffect(() => {
		if (stage === "chat") {
			setTimeout(() => inputRef.current?.focus(), 50);
		}
	}, [stage]);

	// Handle sign-in: brief animation then connect
	useEffect(() => {
		if (stage !== "signing-in" || !nick) return;

		if (carlaMode) {
			// Carla mode — skip Discord entirely
			const timer = setTimeout(() => {
				addMessage({ type: "system", text: "You have connected to LMN Messenger." });
				addMessage({
					type: "system",
					text: "Carla 🐍 has joined the conversation.",
				});
				setStage("chat");
			}, 1800);
			return () => clearTimeout(timer);
		}

		// Discord mode
		const timer = setTimeout(async () => {
			try {
				const res = await fetch("/api/irc/connect", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ nick }),
				});

				const data = await res.json();

				if (!res.ok) {
					setConnectError(data.error ?? "Connection failed. Please try again.");
					setStage("sign-in");
					return;
				}

				setThreadId(data.threadId);
				lastPollTimeRef.current = new Date().toISOString();

				addMessage({ type: "system", text: "You have connected to LMN Messenger." });
				addMessage({
					type: "system",
					text: "lemonsaurus 🍋 has joined the conversation.",
				});

				setStage("chat");
			} catch {
				setConnectError("Could not reach LMN Messenger. Check your connection.");
				setStage("sign-in");
			}
		}, 1800);

		return () => clearTimeout(timer);
	}, [stage, nick, carlaMode, addMessage]);

	// Poll for replies
	// Discord mode: polls the main threadId for lemon's replies
	// Carla mode: polls carlaThreadIdRef once a thread is created (so lemon can jump in)
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
						if (carlaMode) {
							setCarlaMode(false);
							setLemonStatus("online");
							setThreadId(carlaThreadId);
							setMessages((prev) => [
								...prev,
								{
									id: ++msgCounter,
									type: "system" as const,
									text: "lemonsaurus 🍋 has joined the conversation!",
									timestamp: new Date(),
								},
								...unseen.map((m) => ({
									id: ++msgCounter,
									type: "message" as const,
									nick: "lemonsaurus",
									text: m.content,
									timestamp: new Date(m.timestamp),
								})),
							]);
						} else {
							setMessages((prev) => [
								...prev,
								...unseen.map((m) => ({
									id: ++msgCounter,
									type: "message" as const,
									nick: "lemonsaurus",
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

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
			if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
			if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
		};
	}, []);

	const handleSignIn = useCallback((chosenNick: string) => {
		setConnectError("");
		setNick(chosenNick);
		setStage("signing-in");
	}, []);

	const sendToCarla = useCallback(
		async (userMessage: string) => {
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
						text: data.error ?? "Carla seems to be having trouble responding.",
					});
					return;
				}

				const reply: string = data.reply ?? "Sorry, I couldn't come up with a response!";

				// Store thread ID for subsequent requests and polling
				if (data.threadId && !carlaThreadId) {
					setCarlaThreadId(data.threadId);
					lastPollTimeRef.current = new Date().toISOString();
				}

				carlaHistoryRef.current = [
					...carlaHistoryRef.current,
					{ role: "assistant" as const, content: reply },
				].slice(-20);

				// Typing delay: wordCount / 100 WPM, min 1s, max 8s
				const wordCount = reply.trim().split(/\s+/).length;
				const delayMs = Math.min(Math.max((wordCount / 100) * 60 * 1000, 1000), 8000);

				setIsTyping(true);
				if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
				typingTimerRef.current = setTimeout(() => {
					setIsTyping(false);
					setMessages((prev) => [
						...prev,
						{
							id: ++msgCounter,
							type: "message",
							nick: "Carla",
							text: reply,
							timestamp: new Date(),
						},
					]);
				}, delayMs);
			} catch {
				setIsTyping(false);
				addMessage({
					type: "system",
					text: "Carla seems to be away too. Try again in a moment!",
				});
			}
		},
		[nick, addMessage],
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

			if (!trimmed || stage !== "chat") return;

			addMessage({ type: "message", nick, text: trimmed });
			startCooldown();

			if (carlaMode) {
				sendToCarla(trimmed);
				return;
			}

			// Discord mode
			if (!threadId) return;

			if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
			setIsTyping(true);
			typingTimerRef.current = setTimeout(() => setIsTyping(false), 2000);

			fetch("/api/irc/send", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ threadId, nick, message: trimmed }),
			})
				.then(async (res) => {
					if (!res.ok) {
						const data = await res.json().catch(() => ({}));
						addMessage({ type: "system", text: data.error ?? "Message delivery failed." });
					}
				})
				.catch(() => {
					addMessage({
						type: "system",
						text: "Could not deliver message. Check your connection.",
					});
				});
		},
		[input, stage, nick, threadId, carlaMode, addMessage, sendToCarla, startCooldown],
	);

	if (stage === "sign-in")
		return (
			<SignInScreen onSignIn={handleSignIn} serverError={connectError} carlaMode={carlaMode} />
		);
	if (stage === "signing-in") return <SigningInScreen nick={nick} />;

	// Determine contact display values
	const contactName = carlaMode ? "Carla" : "lemonsaurus";
	const contactEmoji = carlaMode ? "🐍" : "🍋";
	const contactDotColor = carlaMode ? "#40b848" : statusDotColor(lemonStatus);
	const contactStatusLabel = statusLabel(lemonStatus, carlaMode);

	// ── Chat window ─────────────────────────────────────────────────────────
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				width: "100%",
				background: "#ffffff",
				fontFamily: "Tahoma, 'Segoe UI', Arial, sans-serif",
				fontSize: 14,
				overflow: "hidden",
			}}
		>
			{/* Yellow gradient header */}
			<div
				style={{
					background: "linear-gradient(180deg, #e8d020 0%, #d4b810 50%, #c0a000 100%)",
					padding: "10px 14px",
					flexShrink: 0,
					display: "flex",
					alignItems: "center",
					gap: 10,
				}}
			>
				<span style={{ fontSize: 22 }}>🦋</span>
				<div style={{ flex: 1 }}>
					<div
						style={{
							color: "#ffffff",
							fontWeight: "bold",
							fontSize: 14,
							letterSpacing: "0.3px",
							textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
						}}
					>
						LMN Messenger
					</div>
					<div style={{ color: "#fff8c0", fontSize: 13 }}>
						Chatting with{" "}
						<strong style={{ color: "#ffffff" }}>
							{contactName} {contactEmoji}
						</strong>
					</div>
				</div>

				{/* Status badge */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 5,
						background: "rgba(255,255,255,0.25)",
						borderRadius: 10,
						padding: "3px 10px",
					}}
				>
					<span
						style={{
							display: "inline-block",
							width: 8,
							height: 8,
							borderRadius: "50%",
							background: contactDotColor,
							boxShadow: `0 0 4px ${contactDotColor}`,
							flexShrink: 0,
						}}
					/>
					<span
						style={{ color: "#ffffff", fontSize: 13, textShadow: "1px 1px 1px rgba(0,0,0,0.2)" }}
					>
						{carlaMode ? "Available" : contactStatusLabel}
					</span>
				</div>
			</div>

			{/* Contact info strip */}
			<div
				style={{
					background: "#faf4d0",
					borderBottom: "1px solid #e0d080",
					padding: "6px 14px",
					flexShrink: 0,
					display: "flex",
					alignItems: "center",
					gap: 10,
				}}
			>
				<img
					src={carlaMode ? "/images/carla_avatar.avif" : "/images/lemon_portrait.avif"}
					alt={contactName}
					style={{
						width: 36,
						height: 36,
						border: "2px solid #c8b040",
						borderRadius: 3,
						objectFit: "cover",
						imageRendering: "pixelated",
						flexShrink: 0,
					}}
				/>
				<div>
					<div
						style={{
							fontWeight: "bold",
							fontSize: 13,
							...(carlaMode
								? { color: "#40b848" }
								: {
										backgroundImage:
											"linear-gradient(90deg, #ff5050, #ff9040, #e8e040, #40b848, #5090ff, #b860d0)",
										WebkitBackgroundClip: "text",
										WebkitTextFillColor: "transparent",
										backgroundClip: "text",
									}),
						}}
					>
						{contactName} {contactEmoji}
					</div>
					<div style={{ fontSize: 13, color: "#888" }}>
						<span
							style={{
								display: "inline-block",
								width: 7,
								height: 7,
								borderRadius: "50%",
								background: contactDotColor,
								marginRight: 4,
								verticalAlign: "middle",
							}}
						/>
						{contactStatusLabel}
					</div>
				</div>
			</div>

			{/* Chat messages */}
			<div
				ref={scrollRef}
				style={{
					flex: 1,
					overflowY: "auto",
					overflowX: "hidden",
					padding: "10px 14px",
					background: "#ffffff",
					borderBottom: "1px solid #e0d080",
				}}
			>
				{messages.map((msg) => {
					if (msg.type === "system") {
						return (
							<div
								key={msg.id}
								style={{
									textAlign: "center",
									color: "#888888",
									fontStyle: "italic",
									fontSize: 13,
									margin: "6px 0",
								}}
							>
								{msg.text}
							</div>
						);
					}

					const isLemon = msg.nick === "lemonsaurus";
					const isCarla = msg.nick === "Carla";
					const isRemote = isLemon || isCarla;

					return (
						<div
							key={msg.id}
							style={{
								marginBottom: 10,
								textAlign: isRemote ? "right" : "left",
							}}
						>
							<div style={{ fontSize: 13, color: "#999", marginBottom: 1 }}>
								{isRemote ? (
									<>
										<span>{formatTime(msg.timestamp)} </span>
										<strong>
											{isCarla ? (
												<span style={{ color: "#40b848" }}>Carla 🐍</span>
											) : (
												<>
													<span
														style={{
															backgroundImage:
																"linear-gradient(90deg, #ff5050, #ff9040, #e8e040, #40b848, #5090ff, #b860d0)",
															WebkitBackgroundClip: "text",
															WebkitTextFillColor: "transparent",
															backgroundClip: "text",
														}}
													>
														lemonsaurus
													</span>{" "}
													🍋
												</>
											)}
										</strong>
									</>
								) : (
									<>
										<strong style={{ color: "#cc4400", marginRight: 6 }}>{msg.nick ?? nick}</strong>
										<span>{formatTime(msg.timestamp)}</span>
									</>
								)}
							</div>
							<div
								style={{
									color: "#111111",
									wordBreak: "break-word",
									lineHeight: "1.5",
									display: "inline-block",
									textAlign: "left",
									maxWidth: "85%",
									padding: "4px 8px",
									borderRadius: 4,
									background: isRemote ? "#fff8d0" : "#f0f0f0",
									borderLeft: isRemote ? "none" : "2px solid #ff8844",
									borderRight: isRemote ? `2px solid ${isCarla ? "#40b848" : "#e8d020"}` : "none",
									fontFamily: isRemote ? "Tahoma, sans-serif" : chatFont,
								}}
							>
								{msg.text}
							</div>
						</div>
					);
				})}

				{isTyping && (
					<div style={{ color: "#888888", fontStyle: "italic", fontSize: 13, margin: "4px 0 0" }}>
						{carlaMode ? "Carla is typing..." : "lemonsaurus is typing..."}
					</div>
				)}
			</div>

			{/* Emoji picker popup */}
			{showEmojiPicker && (
				<div
					style={{
						background: "#ffffff",
						border: "1px solid #c8b040",
						borderBottom: "none",
						padding: 8,
						flexShrink: 0,
						display: "grid",
						gridTemplateColumns: "repeat(8, 1fr)",
						gap: 2,
						maxHeight: 140,
						overflowY: "auto",
					}}
				>
					{EMOJI_GRID.map((emoji) => (
						<button
							key={emoji}
							type="button"
							onClick={() => {
								setInput((prev) => prev + emoji);
								setShowEmojiPicker(false);
								inputRef.current?.focus();
							}}
							style={{
								background: "transparent",
								border: "1px solid transparent",
								borderRadius: 3,
								fontSize: 18,
								width: 32,
								height: 32,
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								padding: 0,
							}}
							onMouseEnter={(e) => {
								(e.currentTarget as HTMLButtonElement).style.background = "#faf0c0";
								(e.currentTarget as HTMLButtonElement).style.borderColor = "#e0d080";
							}}
							onMouseLeave={(e) => {
								(e.currentTarget as HTMLButtonElement).style.background = "transparent";
								(e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
							}}
						>
							{emoji}
						</button>
					))}
				</div>
			)}

			{/* Toolbar */}
			<div
				style={{
					background: "#faf8e8",
					borderBottom: "1px solid #e0d880",
					padding: "4px 10px",
					flexShrink: 0,
					display: "flex",
					gap: 4,
					alignItems: "center",
				}}
			>
				<button
					type="button"
					title="Emoticons"
					onClick={() => setShowEmojiPicker((v) => !v)}
					style={{
						background: showEmojiPicker
							? "linear-gradient(180deg, #e0e0e0 0%, #d0d0d0 100%)"
							: "linear-gradient(180deg, #f8f8f8 0%, #e8e8e8 100%)",
						border: `1px solid ${showEmojiPicker ? "#888" : "#aaaaaa"}`,
						borderRadius: 2,
						fontSize: 14,
						width: 24,
						height: 22,
						cursor: "pointer",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					😊
				</button>
				<select
					aria-label="Font"
					value={chatFont}
					onChange={(e) => {
						setChatFont(e.target.value);
						inputRef.current?.focus();
					}}
					style={{
						fontSize: 13,
						fontFamily: chatFont,
						border: "1px solid #aaaaaa",
						background: "#ffffff",
						height: 22,
						color: "#333",
						cursor: "pointer",
						maxWidth: 140,
					}}
				>
					{FONT_OPTIONS.map((f) => (
						<option key={f} value={f} style={{ fontFamily: f }}>
							{f}
						</option>
					))}
				</select>
			</div>

			{/* Input */}
			<form
				onSubmit={handleSubmit}
				style={{
					display: "flex",
					flexDirection: "column",
					flexShrink: 0,
					background: "#ffffff",
				}}
			>
				<input
					ref={inputRef}
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onMouseDown={(e) => e.stopPropagation()}
					disabled={cooldownSeconds > 0}
					maxLength={MAX_MESSAGE_LENGTH}
					style={{
						border: "none",
						borderTop: "1px solid #e0d880",
						outline: "none",
						padding: "8px 12px",
						fontSize: 13,
						fontFamily: chatFont,
						background: cooldownSeconds > 0 ? "#f8f8f0" : "#ffffff",
						color: cooldownSeconds > 0 ? "#aaa" : "#111111",
						cursor: cooldownSeconds > 0 ? "not-allowed" : "text",
					}}
					autoComplete="off"
					autoCorrect="off"
					autoCapitalize="off"
					spellCheck={false}
					placeholder="Type a message..."
					aria-label="Message input"
				/>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						padding: "4px 8px 6px",
						background: "#faf8e8",
						borderTop: "1px solid #f0e8c0",
						gap: 6,
					}}
				>
					<div
						style={{
							fontSize: 13,
							color: input.length >= MAX_MESSAGE_LENGTH ? "#cc0000" : "#aaa",
							fontFamily: "Tahoma, 'Segoe UI', Arial, sans-serif",
							visibility: input.length > CHAR_COUNTER_THRESHOLD ? "visible" : "hidden",
						}}
					>
						{input.length}/{MAX_MESSAGE_LENGTH}
					</div>
					<button
						type="submit"
						disabled={!input.trim() || cooldownSeconds > 0}
						style={{
							background:
								cooldownSeconds > 0
									? "linear-gradient(180deg, #e8e8e8 0%, #d8d8d8 100%)"
									: "linear-gradient(180deg, #f8e850 0%, #e0c820 100%)",
							border: `1px solid ${cooldownSeconds > 0 ? "#cccccc" : "#b0a020"}`,
							borderRadius: 3,
							fontSize: 13,
							fontFamily: "Tahoma, 'Segoe UI', Arial, sans-serif",
							fontWeight: "bold",
							padding: "4px 20px",
							cursor: input.trim() && cooldownSeconds === 0 ? "pointer" : "default",
							color: input.trim() && cooldownSeconds === 0 ? "#333" : "#999",
							boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
							minWidth: 60,
						}}
					>
						{cooldownSeconds > 0 ? `${cooldownSeconds}s` : "Send"}
					</button>
				</div>
			</form>
		</div>
	);
}
