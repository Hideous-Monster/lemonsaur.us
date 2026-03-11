import { SOCIAL_LINKS } from "@/lib/constants";

export function Footer() {
	return (
		<footer className="fixed bottom-0 z-50 w-full border-t-2 border-c64-dim bg-c64-bg px-4 py-3">
			<div className="mx-auto flex max-w-7xl flex-col items-center gap-3">
				<div className="flex gap-4">
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
				<p className="font-pixel text-xs text-c64-muted">MADE WITH 🍋 AND ☕. NO RIGHTS RESERVED.</p>
			</div>
		</footer>
	);
}
