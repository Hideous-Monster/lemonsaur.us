"use client";

import { useEffect, useState } from "react";

const FOOTER_MESSAGES = [
	"📞 IF YOUR NAME IS YOLANDI, CALL ME",
	"💈 SHAVE MY HEAD, I AM BALD",
	"🥢 CHOPSTICKS HAVE MANY USES",
	"🍌 DING DONG DONKEY KONG",
	"🍋 NO RIGHTS RESERVED",
	"🧊 I LEFT THE FRIDGE OPEN AGAIN",
	"🪑 THIS CHAIR IS NOT COMFORTABLE",
	"🐸 FROGS ARE ALL THE SAME",
	"🧠 MY BRAIN IS PEANUT BUTTER",
	"🔪 DON'T TOUCH THAT",
	"🎺 HE WHO FELT IT, DEALT IT",
	"🥄 THERE WAS ACTUALLY A SPOON",
	"🧃 JUICE BOXES ARE CRACK COCAINE FOR KIDS",
	"🐝 THE BEES ARE WATCHING YOU",
	"🧲 MAGNETS ACTUALLY MAKE PERFECT SENSE",
	"🦷 MY DENTIST IS LAZY",
	"🗿 HMMMM YES VERY GOOD",
	"🍕 PINEAPPLE ON PIZZA IS FINE",
	"🦆 QUACK",
];

export function Footer() {
	const [message, setMessage] = useState("");

	useEffect(() => {
		setMessage(FOOTER_MESSAGES[Math.floor(Math.random() * FOOTER_MESSAGES.length)]!);
	}, []);

	return (
		<footer className="fixed bottom-0 z-50 w-full border-t-2 border-c64-dim bg-c64-bg px-4 py-3">
			<div className="mx-auto flex max-w-7xl items-center justify-center">
				<p className="font-pixel text-xs text-c64-muted">{message}</p>
			</div>
		</footer>
	);
}
