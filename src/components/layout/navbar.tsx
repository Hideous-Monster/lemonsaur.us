"use client";

import { BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SOCIAL_LINKS } from "@/lib/constants";
import { ALL_LEMOJIS, lemojiPath } from "@/lib/lemoji";

export function Navbar() {
	const [lemoji, setLemoji] = useState<string | null>(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		setLemoji(ALL_LEMOJIS[Math.floor(Math.random() * ALL_LEMOJIS.length)]!);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally re-run on route change
	useEffect(() => {
		setMenuOpen(false);
	}, [pathname]);

	const handleHomeClick = useCallback(
		(e: React.MouseEvent) => {
			if (pathname === "/") {
				e.preventDefault();
				window.location.href = "/";
			}
		},
		[pathname],
	);

	return (
		<nav
			className="fixed top-0 z-50 w-full border-b-2 border-c64-dim bg-c64-bg px-4"
			aria-label="Main navigation"
		>
			<div className="flex h-12 items-center justify-between">
				<Link
					href="/"
					className="flex items-center gap-2"
					aria-label="Home"
					onClick={handleHomeClick}
				>
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

				{/* Desktop nav */}
				<div className="hidden items-center gap-5 sm:flex">
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

				{/* Mobile hamburger */}
				<button
					type="button"
					className="flex w-10 self-stretch items-center justify-center sm:hidden"
					onClick={() => setMenuOpen((prev) => !prev)}
					aria-label={menuOpen ? "Close menu" : "Open menu"}
					aria-expanded={menuOpen}
				>
					<span className="font-pixel text-base text-c64-text">{menuOpen ? "✕" : "≡"}</span>
				</button>
			</div>

			{/* Mobile dropdown */}
			{menuOpen && (
				<div className="flex flex-col gap-4 border-t-2 border-c64-dim py-4 sm:hidden">
					<Link
						href="/blog"
						className="flex items-center gap-2 font-pixel text-xs text-c64-text transition-colors hover:text-c64-white"
					>
						<BookOpen size={14} />
						BLOG
					</Link>
					{SOCIAL_LINKS.map((social) => (
						<a
							key={social.name}
							href={social.url}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 font-pixel text-xs text-c64-text transition-colors hover:text-c64-white"
						>
							<social.icon size={14} />
							{social.name.toUpperCase()}
						</a>
					))}
				</div>
			)}
		</nav>
	);
}
