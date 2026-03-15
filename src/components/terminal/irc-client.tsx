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

type ConnectionStage = "intro" | "nick-prompt" | "joining" | "chat";

const MOTD_LINES = [
	"* Looking up irc.lemonnet.org...",
	"* Connecting to irc.lemonnet.org (174.87.42.1) port 6667...",
	"* Connected! Logging in...",
	"-",
	"- ██╗     ███████╗███╗   ███╗ ██████╗ ███╗   ██╗",
	"- ██║     ██╔════╝████╗ ████║██╔═══██╗████╗  ██║",
	"- ██║     █████╗  ██╔████╔██║██║   ██║██╔██╗ ██║",
	"- ██║     ██╔══╝  ██║╚██╔╝██║██║   ██║██║╚██╗██║",
	"- ███████╗███████╗██║ ╚═╝ ██║╚██████╔╝██║ ╚████║",
	"- ╚══════╝╚══════╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝",
	"-                    N E T",
	"-",
	"- Welcome to LemonNET IRC — the juiciest network on the internet.",
	"- This server was established in 1987 by Lemon Microsystems.",
	"- Current users: 1  |  Channels: 1  |  Operators: 1",
	"-",
	"- RULES:",
	"- 1. Be excellent to each other",
	"- 2. No flooding",
	"- 3. lemonsaurus is always right",
	"-",
	"- End of MOTD",
	"-",
	"* Please enter your nickname: ",
];

function formatTime(date: Date): string {
	return `[${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}]`;
}

function lineColor(type: IrcMessage["type"]): string {
	if (type === "system") return "#688850";
	return "#b8d850";
}

export function IrcClient({ onExit }: IrcClientProps) {
	const [messages, setMessages] = useState<IrcMessage[]>([]);
	const [input, setInput] = useState("");
	const [stage, setStage] = useState<ConnectionStage>("intro");
	const [nick, setNick] = useState("");
	const [threadId, setThreadId] = useState<string | null>(null);
	const [lastPollTime, setLastPollTime] = useState<string | null>(null);

	const scrollRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const motdIndexRef = useRef(0);
	const motdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
		if (stage === "nick-prompt" || stage === "chat") {
			setTimeout(() => inputRef.current?.focus(), 50);
		}
	}, [stage]);

	// Type out MOTD lines one by one
	useEffect(() => {
		if (stage !== "intro") return;

		function typeNextLine() {
			const idx = motdIndexRef.current;
			if (idx >= MOTD_LINES.length) return;

			const line = MOTD_LINES[idx]!;
			motdIndexRef.current = idx + 1;

			if (idx === MOTD_LINES.length - 1) {
				// Last line is the nick prompt — switch stage
				setStage("nick-prompt");
				addMessage({ type: "system", text: line });
				return;
			}

			addMessage({ type: "system", text: line });
			motdTimerRef.current = setTimeout(typeNextLine, 80);
		}

		motdTimerRef.current = setTimeout(typeNextLine, 100);

		return () => {
			if (motdTimerRef.current) clearTimeout(motdTimerRef.current);
		};
	}, [stage, addMessage]);

	// Start polling for replies once in chat
	useEffect(() => {
		if (stage !== "chat" || !threadId) return;

		pollIntervalRef.current = setInterval(async () => {
			try {
				const url = new URL("/api/irc/messages", window.location.origin);
				url.searchParams.set("threadId", threadId);
				if (lastPollTime) url.searchParams.set("since", lastPollTime);

				const res = await fetch(url.toString());
				if (!res.ok) return;

				const data = await res.json();
				const newMessages: Array<{ content: string; timestamp: string; author: string }> =
					data.messages ?? [];

				if (newMessages.length > 0) {
					setLastPollTime(newMessages[newMessages.length - 1]!.timestamp);

					for (const m of newMessages) {
						setMessages((prev) => [
							...prev,
							{
								type: "message",
								nick: `@${m.author}`,
								text: m.content,
								timestamp: new Date(m.timestamp),
							},
						]);
					}
				}
			} catch {
				// Silent — network errors don't need to surface every poll
			}
		}, 3000);

		return () => {
			if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
		};
	}, [stage, threadId, lastPollTime]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
			if (motdTimerRef.current) clearTimeout(motdTimerRef.current);
		};
	}, []);

	const doJoin = useCallback(
		async (chosenNick: string) => {
			setStage("joining");

			const joinLines = [
				"* Checking nickname...",
				`* NICK ${chosenNick} accepted`,
				"* Joining #lemonsaurus...",
				"* Now talking in #lemonsaurus",
				`* Topic for #lemonsaurus: "come chat with a lemon dinosaur 🍋"`,
				"* Set by lemonsaurus on Jan 1 1987",
				"-",
				"* lemonsaurus is here (@lemonsaurus) [operator]",
				`* ${chosenNick} has joined #lemonsaurus`,
				"-",
			];

			// Type out join lines with delays
			for (let i = 0; i < joinLines.length; i++) {
				await new Promise<void>((resolve) => {
					setTimeout(() => {
						addMessage({ type: "system", text: joinLines[i]! });
						resolve();
					}, i * 120);
				});
			}

			// Call connect API
			try {
				const res = await fetch("/api/irc/connect", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ nick: chosenNick }),
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
				setLastPollTime(new Date().toISOString());
				setStage("chat");
			} catch {
				addMessage({
					type: "system",
					text: "* Server notice: Could not reach IRC server. Check your connection.",
				});
			}
		},
		[addMessage],
	);

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			const trimmed = input.trim();
			setInput("");

			if (!trimmed) return;

			if (stage === "nick-prompt") {
				// Validate nick: alphanumeric + underscore, 1-16 chars
				if (!/^[a-zA-Z0-9_]{1,16}$/.test(trimmed)) {
					addMessage({
						type: "system",
						text: "* Error: Nickname must be 1-16 alphanumeric characters (underscores allowed).",
					});
					return;
				}
				setNick(trimmed);
				addMessage({ type: "system", text: trimmed });
				doJoin(trimmed);
				return;
			}

			if (stage !== "chat") return;

			// IRC slash commands
			if (trimmed.startsWith("/")) {
				const parts = trimmed.slice(1).split(" ");
				const cmd = parts[0]?.toLowerCase();

				if (cmd === "quit") {
					addMessage({ type: "system", text: `* Disconnecting from #lemonsaurus...` });
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
		[input, stage, nick, threadId, addMessage, doJoin, onExit],
	);

	const prompt =
		stage === "nick-prompt" ? "nickname: " : stage === "chat" ? "[#lemonsaurus] " : null;

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				width: "100%",
				backgroundColor: "#0a140a",
				color: "#b8d850",
				fontFamily: "monospace",
				fontSize: "13px",
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
					padding: "8px 12px",
					lineHeight: "1.5",
				}}
			>
				{messages.map((msg, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: messages have no stable id; index is safe here
					<div key={i} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
						{msg.type === "message" ? (
							<span>
								<span style={{ color: "#688850" }}>{formatTime(msg.timestamp)} </span>
								<span style={{ color: "#e8e040" }}>&lt;{msg.nick}&gt;</span>
								<span style={{ color: "#b8d850" }}> {msg.text}</span>
							</span>
						) : (
							<span style={{ color: lineColor(msg.type) }}>
								{formatTime(msg.timestamp)} {msg.text}
							</span>
						)}
					</div>
				))}
			</div>

			{/* Input area */}
			{prompt && (
				<form
					onSubmit={handleSubmit}
					style={{
						display: "flex",
						alignItems: "center",
						padding: "6px 12px",
						borderTop: "1px solid #1a2a1a",
						backgroundColor: "#060e06",
						flexShrink: 0,
					}}
				>
					<span style={{ color: "#688850", marginRight: "4px", whiteSpace: "nowrap" }}>
						{prompt}
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
							color: "#b8d850",
							fontFamily: "monospace",
							fontSize: "13px",
							caretColor: "#b8d850",
						}}
						autoComplete="off"
						autoCorrect="off"
						autoCapitalize="off"
						spellCheck={false}
						// biome-ignore lint/a11y/noAutofocus: IRC input must auto-focus on mount
						autoFocus
						aria-label="IRC input"
						placeholder={stage === "nick-prompt" ? "Type a nickname and press Enter" : ""}
					/>
				</form>
			)}
		</div>
	);
}
