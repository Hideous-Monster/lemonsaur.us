import type { TerminalLine } from "./types";

// Lemon ASCII art lines (braille)
const ART = [
	"⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣠⣤⣤⣤⣤⣄⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
	"⠀⠀⠀⠀⠀⠀⢀⣠⣴⣾⣿⡿⠛⠉⠉⠉⠉⠛⢿⣿⣷⣦⣄⡀⠀⠀⠀⠀⠀⠀",
	"⠀⠀⠀⠀⢀⣴⡿⠋⠉⠙⢿⣇⠀⠀⠀⠀⠀⠀⣸⡿⠋⠉⠙⠿⣦⡀⠀⠀⠀⠀",
	"⠀⠀⠀⣰⣿⠋⠀⠀⠀⠀⠈⢿⡀⠀⠀⠀⠀⢠⡿⠁⠀⠀⠀⠀⠘⢿⣆⠀⠀⠀",
	"⠀⠀⣰⣿⣇⠀⠀⠀⠀⠀⠀⠈⢧⠀⠀⠀⠀⡾⠁⠀⠀⠀⠀⠀⠀⣸⣿⣆⠀⠀",
	"⠀⢰⣿⡿⠿⢷⣦⣄⡀⠀⠀⠀⠈⠆⠀⠀⠐⠁⠀⠀⠀⢀⣠⣴⡾⠿⢿⣿⡆⠀",
	"⠀⣾⡟⠀⠀⠀⠀⠈⠉⠓⠢⠄⠀⣠⣴⣦⣄⠀⠠⠔⠚⠉⠉⠀⠀⠀⠀⢻⣷⠀",
	"⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠰⣿⣿⣿⣿⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠀",
	"⠀⢿⣧⠀⠀⠀⠀⣀⣠⡤⠐⠀⠀⠙⠻⠟⠋⠀⠀⠢⢤⣀⡀⠀⠀⠀⠀⣼⡿⠀",
	"⠀⠸⣿⣷⣶⡾⠟⠋⠁⠀⠀⠀⢀⠆⠀⠀⠠⡀⠀⠀⠀⠈⠙⠻⢷⣶⣾⣿⠇⠀",
	"⠀⠀⠹⣿⡏⠀⠀⠀⠀⠀⠀⢀⡞⠀⠀⠀⠀⢷⡀⠀⠀⠀⠀⠀⠀⢹⣿⠏⠀⠀",
	"⠀⠀⠀⠹⣷⣄⠀⠀⠀⠀⢀⣾⠁⠀⠀⠀⠀⠘⣷⡀⠀⠀⠀⠀⢠⣾⠏⠀⠀⠀",
	"⠀⠀⠀⠀⠈⠻⣷⣤⣀⣠⣾⡇⠀⠀⠀⠀⠀⠀⢹⣷⣄⣀⣠⣶⠟⠁⠀⠀⠀⠀",
	"⠀⠀⠀⠀⠀⠀⠈⠙⠻⢿⣿⣷⣤⣀⣀⣀⣀⣤⣾⣿⡿⠟⠋⠁⠀⠀⠀⠀⠀⠀",
	"⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠙⠛⠛⠛⠛⠋⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
];

// Yellow-to-green gradient for the lemon art
const ART_COLORS = [
	"#e8e040",
	"#e8e040",
	"#e0d838",
	"#d8d030",
	"#d0c828",
	"#c0c020",
	"#a8b830",
	"#90b038",
	"#78a840",
	"#60a048",
	"#50a040",
	"#48a838",
	"#40b848",
	"#40b848",
	"#40b848",
];

const INFO: [string, string, string, string][] = [
	["", "LEMONSAURUS", "", "#e8e040"],
	["", "───────────────────────────────", "", "#405030"],
	["OS", "LEMON 87 JUICY", "#b8d850", "#f0f0d0"],
	["HOST", "OSLO, NORWAY", "#b8d850", "#f0f0d0"],
	["KERNEL", "6.502-SID-PETSCII", "#b8d850", "#f0f0d0"],
	["UPTIME", "SINCE 1987", "#b8d850", "#f0f0d0"],
	["SHELL", "LEMSH 1.0", "#b8d850", "#f0f0d0"],
	["CPU", "MOS 6510 @ 1.023 MHZ", "#b8d850", "#f0f0d0"],
	["GPU", "VIC-II 320x200", "#b8d850", "#f0f0d0"],
	["RAM", "87K (38911 BASIC BYTES FREE)", "#b8d850", "#f0f0d0"],
	["DISK", "1541 FLOPPY (170K)", "#b8d850", "#f0f0d0"],
	["SOUND", "SID 6581 3-VOICE SYNTH", "#b8d850", "#f0f0d0"],
	["THEME", "ALGEBRAIC", "#b8d850", "#f0f0d0"],
	["", "", "", ""],
];

const PALETTE_COLORS = [
	"#0a140a",
	"#223a22",
	"#405030",
	"#688850",
	"#40b848",
	"#70e070",
	"#b8d850",
	"#e8e040",
	"#d0a030",
	"#c05040",
	"#70d0b0",
	"#a050d0",
	"#f0f0d0",
	"#d0f050",
];

export function neofetch(
	ln: (text: string, type: TerminalLine["type"]) => TerminalLine,
): TerminalLine[] {
	const artWidth = "320px";
	const lines: TerminalLine[] = [];

	for (let i = 0; i < ART.length; i++) {
		const artLine = ART[i]!;
		const color = ART_COLORS[i] || "#40b848";

		let rightSide = "";
		if (i < INFO.length) {
			const [label, value, labelColor, valueColor] = INFO[i]!;
			if (label) {
				rightSide = `<span style="color:${labelColor}">${label}</span><span style="color:#688850">: </span><span style="color:${valueColor}">${value}</span>`;
			} else if (value) {
				rightSide = `<span style="color:${valueColor}">${value}</span>`;
			}
		}

		if (i === ART.length - 1) {
			rightSide = PALETTE_COLORS.map((c) => `<span style="color:${c}">\u2588\u2588</span>`).join(
				"",
			);
		}

		const html = `<span style="display:inline-block;width:${artWidth};color:${color}">${artLine}</span>${rightSide}`;
		lines.push(ln(html, "rich"));
	}

	return lines;
}
