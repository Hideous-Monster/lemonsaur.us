import { SOCIAL_LINKS } from "@/lib/constants";

export function Footer() {
	return (
		<footer className="border-t border-leaf-700/50 bg-leaf-900/50 px-4 py-8">
			<div className="mx-auto flex max-w-7xl flex-col items-center gap-4">
				<div className="flex gap-4">
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
				<p className="text-sm text-surface-500">lemonsaur.us</p>
			</div>
		</footer>
	);
}
