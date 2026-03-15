"use client";

import { useCallback, useEffect, useRef, useState } from "react";

let msgCounter = 0;

interface MsnMessage {
	id: number;
	type: "system" | "message";
	nick?: string;
	text: string;
	timestamp: Date;
}

type ConnectionStage = "sign-in" | "signing-in" | "chat";

function formatTime(date: Date): string {
	const h = date.getHours().toString().padStart(2, "0");
	const m = date.getMinutes().toString().padStart(2, "0");
	return `${h}:${m}`;
}

// ── MSN-style Sign In Screen ─────────────────────────────────────────────────

function SignInScreen({ onSignIn }: { onSignIn: (nick: string) => void }) {
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
				background: "linear-gradient(180deg, #c5d9f1 0%, #e8f0fb 40%, #ffffff 100%)",
				fontFamily: "Tahoma, 'Segoe UI', Arial, sans-serif",
			}}
		>
			{/* MSN-style card */}
			<div
				style={{
					background: "#ffffff",
					border: "1px solid #8faacc",
					borderRadius: 4,
					width: 340,
					boxShadow: "2px 2px 8px rgba(0,0,0,0.2)",
					overflow: "hidden",
				}}
			>
				{/* Blue header */}
				<div
					style={{
						background: "linear-gradient(180deg, #0055c4 0%, #1d5fb8 50%, #0047a8 100%)",
						padding: "16px 20px",
						display: "flex",
						alignItems: "center",
						gap: 12,
					}}
				>
					<span style={{ fontSize: 32 }}>🦋</span>
					<div>
						<div
							style={{
								color: "#ffffff",
								fontSize: 18,
								fontWeight: "bold",
								letterSpacing: "0.5px",
							}}
						>
							Lemon Messenger
						</div>
						<div style={{ color: "#aad4ff", fontSize: 11 }}>Powered by LemonNet</div>
					</div>
				</div>

				{/* Form area */}
				<div style={{ padding: "20px 20px 16px" }}>
					<div style={{ fontSize: 12, color: "#333", marginBottom: 4 }}>
						<strong>Sign in</strong> to start chatting
					</div>
					<div
						style={{
							borderTop: "1px solid #d0d0d0",
							marginBottom: 14,
							marginTop: 8,
						}}
					/>

					<form onSubmit={handleSubmit}>
						<label
							htmlFor="msn-nick"
							style={{ display: "block", fontSize: 12, color: "#333", marginBottom: 4 }}
						>
							Display name:
						</label>
						<input
							id="msn-nick"
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
								border: "1px solid #7f9db9",
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
							<div style={{ color: "#cc0000", fontSize: 11, marginBottom: 8 }}>{error}</div>
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
									background: "linear-gradient(180deg, #f0f0f0 0%, #dcdcdc 100%)",
									border: "1px solid #aaaaaa",
									borderRadius: 3,
									fontSize: 12,
									fontFamily: "Tahoma, 'Segoe UI', Arial, sans-serif",
									fontWeight: "bold",
									padding: "4px 20px",
									cursor: "pointer",
									color: "#000000",
									boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
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
						background: "#dce9f9",
						borderTop: "1px solid #b0c8e8",
						padding: "6px 12px",
						fontSize: 10,
						color: "#555",
						textAlign: "center",
					}}
				>
					lemonsaurus 🍋 is waiting for you
				</div>
			</div>
		</div>
	);
}

// ── Signing In Animation Screen ──────────────────────────────────────────────

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
				background: "linear-gradient(180deg, #c5d9f1 0%, #e8f0fb 40%, #ffffff 100%)",
				fontFamily: "Tahoma, 'Segoe UI', Arial, sans-serif",
				gap: 12,
			}}
		>
			<span style={{ fontSize: 40 }}>🦋</span>
			<div style={{ fontSize: 14, color: "#333" }}>
				Signing in as <strong>{nick}</strong>...
			</div>
			{/* XP-style progress bar */}
			<div
				style={{
					width: 220,
					height: 16,
					border: "1px solid #7f9db9",
					borderRadius: 2,
					background: "#f0f4fc",
					overflow: "hidden",
					position: "relative",
				}}
			>
				<style>{`
					@keyframes msn-progress {
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
						background: "linear-gradient(90deg, transparent, #0078d4, transparent)",
						animationName: "msn-progress",
						animationDuration: "1.2s",
						animationTimingFunction: "linear",
						animationIterationCount: "infinite",
					}}
				/>
			</div>
			<div style={{ fontSize: 11, color: "#777" }}>Connecting to Lemon Messenger...</div>
		</div>
	);
}

// ── Main Messenger App ───────────────────────────────────────────────────────

export function MessengerApp() {
	const [messages, setMessages] = useState<MsnMessage[]>([]);
	const [input, setInput] = useState("");
	const [stage, setStage] = useState<ConnectionStage>("sign-in");
	const [nick, setNick] = useState("");
	const [threadId, setThreadId] = useState<string | null>(null);
	const [isTyping, setIsTyping] = useState(false);

	const scrollRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const lastPollTimeRef = useRef<string | null>(null);
	const seenMessageIds = useRef<Set<string>>(new Set());
	const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const addMessage = useCallback((msg: Omit<MsnMessage, "timestamp" | "id">) => {
		setMessages((prev) => [...prev, { ...msg, id: ++msgCounter, timestamp: new Date() }]);
	}, []);

	// Auto-scroll on new messages
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally scroll on messages change
	useEffect(() => {
		scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
	}, [messages]);

	// Focus input when in chat
	useEffect(() => {
		if (stage === "chat") {
			setTimeout(() => inputRef.current?.focus(), 50);
		}
	}, [stage]);

	// Handle sign-in: brief animation then connect
	useEffect(() => {
		if (stage !== "signing-in" || !nick) return;

		const timer = setTimeout(async () => {
			try {
				const res = await fetch("/api/irc/connect", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ nick }),
				});

				const data = await res.json();

				if (!res.ok) {
					setStage("sign-in");
					return;
				}

				setThreadId(data.threadId);
				lastPollTimeRef.current = new Date().toISOString();

				addMessage({
					type: "system",
					text: "You have connected to Lemon Messenger.",
				});
				addMessage({
					type: "system",
					text: "lemonsaurus 🍋 has joined the conversation.",
				});

				setStage("chat");
			} catch {
				setStage("sign-in");
			}
		}, 1800);

		return () => clearTimeout(timer);
	}, [stage, nick, addMessage]);

	// Poll for replies once in chat
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
								id: ++msgCounter,
								type: "message" as const,
								nick: "lemonsaurus",
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
			if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
		};
	}, []);

	const handleSignIn = useCallback((chosenNick: string) => {
		setNick(chosenNick);
		setStage("signing-in");
	}, []);

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			const trimmed = input.trim();
			setInput("");

			if (!trimmed || stage !== "chat" || !threadId) return;

			// Show message optimistically
			addMessage({ type: "message", nick, text: trimmed });

			// Show typing indicator briefly
			if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
			setIsTyping(true);
			typingTimerRef.current = setTimeout(() => setIsTyping(false), 2000);

			// Send to backend
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
							text: data.error ?? "Message delivery failed.",
						});
					}
				})
				.catch(() => {
					addMessage({
						type: "system",
						text: "Could not deliver message. Check your connection.",
					});
				});
		},
		[input, stage, nick, threadId, addMessage],
	);

	// ── Sign in / Signing in screens ──────────────────────────────────────────
	if (stage === "sign-in") {
		return <SignInScreen onSignIn={handleSignIn} />;
	}

	if (stage === "signing-in") {
		return <SigningInScreen nick={nick} />;
	}

	// ── Chat window ───────────────────────────────────────────────────────────
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				width: "100%",
				background: "#ffffff",
				fontFamily: "Tahoma, 'Segoe UI', Arial, sans-serif",
				fontSize: 13,
				overflow: "hidden",
			}}
		>
			{/* Blue gradient header */}
			<div
				style={{
					background: "linear-gradient(180deg, #0055c4 0%, #1d5fb8 50%, #0047a8 100%)",
					padding: "10px 14px",
					flexShrink: 0,
					display: "flex",
					alignItems: "center",
					gap: 10,
				}}
			>
				{/* Butterfly icon */}
				<span style={{ fontSize: 22 }}>🦋</span>

				<div style={{ flex: 1 }}>
					<div
						style={{
							color: "#ffffff",
							fontWeight: "bold",
							fontSize: 14,
							letterSpacing: "0.3px",
						}}
					>
						Lemon Messenger
					</div>
					<div style={{ color: "#aad4ff", fontSize: 11 }}>
						Chatting with <strong style={{ color: "#ffffff" }}>lemonsaurus 🍋</strong>
					</div>
				</div>

				{/* Contact status badge */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 5,
						background: "rgba(255,255,255,0.15)",
						borderRadius: 10,
						padding: "3px 10px",
					}}
				>
					{/* Green dot */}
					<span
						style={{
							display: "inline-block",
							width: 8,
							height: 8,
							borderRadius: "50%",
							background: "#44dd44",
							boxShadow: "0 0 4px #44dd44",
							flexShrink: 0,
						}}
					/>
					<span style={{ color: "#ffffff", fontSize: 11 }}>Online</span>
				</div>
			</div>

			{/* Contact info strip */}
			<div
				style={{
					background: "#dce9f9",
					borderBottom: "1px solid #b0c8e8",
					padding: "6px 14px",
					flexShrink: 0,
					display: "flex",
					alignItems: "center",
					gap: 10,
				}}
			>
				{/* Avatar */}
				<div
					style={{
						width: 36,
						height: 36,
						background: "#e8f4ff",
						border: "2px solid #7f9db9",
						borderRadius: 3,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontSize: 20,
						flexShrink: 0,
					}}
				>
					🍋
				</div>
				<div>
					<div style={{ fontWeight: "bold", fontSize: 13, color: "#003399" }}>lemonsaurus</div>
					<div style={{ fontSize: 11, color: "#556677" }}>
						<span
							style={{
								display: "inline-block",
								width: 7,
								height: 7,
								borderRadius: "50%",
								background: "#44bb44",
								marginRight: 4,
								verticalAlign: "middle",
							}}
						/>
						Available
					</div>
				</div>
			</div>

			{/* Chat message area */}
			<div
				ref={scrollRef}
				style={{
					flex: 1,
					overflowY: "auto",
					overflowX: "hidden",
					padding: "10px 14px",
					background: "#ffffff",
					borderBottom: "1px solid #c8d8e8",
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
									fontSize: 11,
									margin: "6px 0",
								}}
							>
								{msg.text}
							</div>
						);
					}

					const isLemon = msg.nick === "lemonsaurus";
					const displayNick = isLemon ? "lemonsaurus 🍋" : (msg.nick ?? nick);
					const nickColor = isLemon ? "#0033bb" : "#cc4400";

					return (
						<div key={msg.id} style={{ marginBottom: 10 }}>
							<div
								style={{
									fontSize: 11,
									color: "#999",
									marginBottom: 1,
								}}
							>
								<strong style={{ color: nickColor, marginRight: 6 }}>{displayNick}</strong>
								<span>{formatTime(msg.timestamp)}</span>
							</div>
							<div
								style={{
									color: "#111111",
									wordBreak: "break-word",
									lineHeight: "1.5",
									paddingLeft: 4,
									borderLeft: `2px solid ${isLemon ? "#4488ff" : "#ff8844"}`,
									marginLeft: 0,
									paddingTop: 1,
									paddingBottom: 1,
								}}
							>
								{msg.text}
							</div>
						</div>
					);
				})}

				{/* Typing indicator */}
				{isTyping && (
					<div
						style={{
							color: "#888888",
							fontStyle: "italic",
							fontSize: 11,
							margin: "4px 0 0",
						}}
					>
						lemonsaurus is typing...
					</div>
				)}
			</div>

			{/* Input toolbar area */}
			<div
				style={{
					background: "#f0f4fc",
					borderBottom: "1px solid #c8d8e8",
					padding: "4px 10px",
					flexShrink: 0,
					display: "flex",
					gap: 4,
					alignItems: "center",
				}}
			>
				{/* Decorative toolbar buttons */}
				<button
					type="button"
					title="Emoticons (decorative)"
					style={{
						background: "linear-gradient(180deg, #f8f8f8 0%, #e8e8e8 100%)",
						border: "1px solid #aaaaaa",
						borderRadius: 2,
						fontSize: 14,
						width: 24,
						height: 22,
						cursor: "default",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					😊
				</button>
				<button
					type="button"
					title="Font (decorative)"
					style={{
						background: "linear-gradient(180deg, #f8f8f8 0%, #e8e8e8 100%)",
						border: "1px solid #aaaaaa",
						borderRadius: 2,
						fontSize: 11,
						fontWeight: "bold",
						width: 24,
						height: 22,
						cursor: "default",
						fontFamily: "Tahoma, sans-serif",
						color: "#333",
					}}
				>
					A
				</button>
				{/* Fake font selector */}
				<select
					aria-label="Font (decorative)"
					disabled
					style={{
						fontSize: 11,
						fontFamily: "Tahoma, sans-serif",
						border: "1px solid #aaaaaa",
						background: "#ffffff",
						height: 22,
						color: "#555",
						cursor: "default",
					}}
				>
					<option>Tahoma</option>
					<option>Comic Sans MS</option>
					<option>Arial</option>
				</select>
			</div>

			{/* Text input row */}
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
					style={{
						border: "none",
						borderTop: "1px solid #c8d8e8",
						outline: "none",
						padding: "8px 12px",
						fontSize: 13,
						fontFamily: "Tahoma, 'Segoe UI', Arial, sans-serif",
						background: "#ffffff",
						color: "#111111",
						resize: "none",
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
						justifyContent: "flex-end",
						padding: "4px 8px 6px",
						background: "#f0f4fc",
						borderTop: "1px solid #dde8f4",
						gap: 6,
					}}
				>
					<button
						type="submit"
						disabled={!input.trim()}
						style={{
							background: "linear-gradient(180deg, #f0f0f0 0%, #dcdcdc 100%)",
							border: "1px solid #aaaaaa",
							borderRadius: 3,
							fontSize: 12,
							fontFamily: "Tahoma, 'Segoe UI', Arial, sans-serif",
							fontWeight: "bold",
							padding: "4px 20px",
							cursor: input.trim() ? "pointer" : "default",
							color: input.trim() ? "#000000" : "#888888",
							boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
						}}
					>
						Send
					</button>
				</div>
			</form>
		</div>
	);
}
