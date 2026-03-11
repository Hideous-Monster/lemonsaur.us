"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SOCIAL_LINKS } from "@/lib/constants";
import { ALL_LEMOJIS, lemojiPath } from "@/lib/lemoji";

export function Navbar() {
	const [lemoji, setLemoji] = useState<string | null>(null);

	useEffect(() => {
		setLemoji(ALL_LEMOJIS[Math.floor(Math.random() * ALL_LEMOJIS.length)]!);
	}, []);

	return (
		<nav
			className="fixed top-0 z-50 w-full border-b-2 border-c64-dim bg-c64-bg px-4"
			aria-label="Main navigation"
		>
			<div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4">
				<Link href="/" className="flex items-center gap-2" aria-label="Home">
					{lemoji ? (
						<Image
							src={lemojiPath(lemoji)}
							alt=""
							width={24}
							height={24}
							className="transition-transform hover:scale-110"
						/>
					) : (
						<span className="inline-block h-6 w-6" />
					)}
					<span className="font-pixel text-xs text-c64-yellow">LEMONSAURUS</span>
				</Link>

				<div className="flex items-center gap-5">
					<Link
						href="/blog"
						className="font-pixel text-xs text-c64-text transition-colors hover:text-c64-white"
					>
						BLOG
					</Link>

					<div className="h-4 w-px bg-c64-dim" />

					{SOCIAL_LINKS.map((social) => (
						<a
							key={social.name}
							href={social.url}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={social.name}
							className="text-c64-text transition-colors hover:text-c64-white"
						>
							<social.icon size={16} />
						</a>
					))}
				</div>
			</div>
		</nav>
	);
}
