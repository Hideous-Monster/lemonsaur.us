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
		| "pong"
		| "upgrade"
		| "irc"
		| "create";
	href?: string;
	asyncLines?: () => Promise<TerminalLine[]>;
	/** If set, the next user input is routed to this handler instead of the normal command parser. */
	prompt?: (input: string) => CommandResult;
}
