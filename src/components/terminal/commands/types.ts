export interface TerminalLine {
	id: number;
	text: string;
	type: "input" | "output" | "system" | "logo" | "rich";
	href?: string;
	lemojiSrc?: string;
}

export interface CommandResult {
	lines: TerminalLine[];
	action?: "navigate" | "clear" | "snake" | "matrix" | "hack" | "destroy";
	href?: string;
}
