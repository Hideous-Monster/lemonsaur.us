import { Github, Linkedin, type LucideIcon, Music2, Youtube } from "lucide-react";

export const SITE_NAME = "lemonsaur.us";
export const SITE_DESCRIPTION = "LEMON/OS - 87K RAM SYSTEM";
export const SITE_URL = "https://lemonsaur.us";

export interface SocialLink {
	name: string;
	url: string;
	icon: LucideIcon;
}

export const SOCIAL_LINKS: SocialLink[] = [
	{
		name: "SoundCloud",
		url: "https://soundcloud.com/lemonsaurusrex",
		icon: Music2,
	},
	{
		name: "GitHub",
		url: "https://github.com/lemonsaurus",
		icon: Github,
	},
	{
		name: "LinkedIn",
		url: "https://linkedin.com/in/lemonsaurus",
		icon: Linkedin,
	},
	{
		name: "YouTube",
		url: "https://www.youtube.com/channel/UCs9yhbwxkAGzPC4Tw7aMqwA",
		icon: Youtube,
	},
];

export const BRAND_IMAGES = ["/images/brand/nice_lemon.png", "/images/brand/lemon_stegosaurus.png"];

export const NAV_LINKS = [{ label: "Blog", href: "/blog" }] as const;
