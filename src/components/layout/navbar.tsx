"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV_LINKS, SOCIAL_LINKS } from "@/lib/constants";
import { ALL_LEMOJIS, lemojiPath } from "@/lib/lemoji";

export function Navbar() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [navLemoji, setNavLemoji] = useState<string | null>(null);

	useEffect(() => {
		setNavLemoji(ALL_LEMOJIS[Math.floor(Math.random() * ALL_LEMOJIS.length)]!);
	}, []);

	return (
		<nav
			className="fixed top-0 z-50 w-full border-b border-leaf-700/50 bg-leaf-800/90 backdrop-blur-sm"
			aria-label="Main navigation"
		>
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
				{/* Brand */}
				<Link href="/" className="flex items-center gap-2" aria-label="Home">
					{navLemoji ? (
						<Image
							src={lemojiPath(navLemoji)}
							alt="lemonsaur.us"
							width={36}
							height={36}
							className="transition-transform hover:scale-110"
						/>
					) : (
						<span className="inline-block h-9 w-9" />
					)}
					<span className="text-lg font-bold text-lemon-300">lemonsaur.us</span>
				</Link>

				{/* Desktop nav */}
				<div className="hidden items-center gap-6 md:flex">
					{NAV_LINKS.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="text-sm font-medium text-surface-300 transition-colors hover:text-lemon-400"
						>
							{link.label}
						</Link>
					))}

					<div className="h-5 w-px bg-surface-600" />

					{SOCIAL_LINKS.map((social) => (
						<a
							key={social.name}
							href={social.url}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={social.name}
							className="text-surface-400 transition-colors hover:text-lemon-400"
						>
							<social.icon size={20} />
						</a>
					))}
				</div>

				{/* Mobile menu button */}
				<button
					type="button"
					className="text-surface-300 md:hidden"
					onClick={() => setMobileOpen(!mobileOpen)}
					aria-label={mobileOpen ? "Close menu" : "Open menu"}
					aria-expanded={mobileOpen}
				>
					{mobileOpen ? <X size={24} /> : <Menu size={24} />}
				</button>
			</div>

			{/* Mobile menu */}
			{mobileOpen && (
				<div className="border-t border-leaf-700/50 bg-leaf-800 px-4 pb-4 pt-2 md:hidden">
					{NAV_LINKS.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="block py-2 text-sm font-medium text-surface-300 transition-colors hover:text-lemon-400"
							onClick={() => setMobileOpen(false)}
						>
							{link.label}
						</Link>
					))}

					<div className="my-2 h-px bg-surface-600" />

					<div className="flex gap-4 py-2">
						{SOCIAL_LINKS.map((social) => (
							<a
								key={social.name}
								href={social.url}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={social.name}
								className="text-surface-400 transition-colors hover:text-lemon-400"
							>
								<social.icon size={20} />
							</a>
						))}
					</div>
				</div>
			)}
		</nav>
	);
}
