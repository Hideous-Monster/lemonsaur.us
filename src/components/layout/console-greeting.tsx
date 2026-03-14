"use client";

import { useEffect } from "react";

export function ConsoleGreeting() {
	useEffect(() => {
		console.log("%cHey! 👋", "font-size:16px;font-weight:bold;color:#b8d850");
		console.log(
			"%cThere's nothing really here, you sneaky nerd!\n\nYou might find something by using 'ls -a' in the terminal, though... 👀",
			"font-size:13px;color:#70e070",
		);
	}, []);

	return null;
}
