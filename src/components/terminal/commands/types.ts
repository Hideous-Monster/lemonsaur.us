export interface TerminalLine {
	id: number;
	text: string;
	type: "input" | "output" | "system" | "logo" | "rich";
	href?: string;
	lemojiSrc?: string;
	noWrap?: boolean;
}

export interface CommandResult {
	lines: TerminalLine[];
	action?:
		| "navigate"
		| "clear"
		| "snake"
		| "matrix"
		| "hack"
		| "doom"
		| "destroy"
		| "tetris"
		| "pong";
	href?: string;
	asyncLines?: () => Promise<TerminalLine[]>;
}
