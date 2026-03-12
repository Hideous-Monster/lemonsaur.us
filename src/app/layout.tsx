import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import "./globals.css";

const commodore = localFont({
	src: "../fonts/CommodoreServer.ttf",
	variable: "--font-press-start",
	display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	display: "swap",
});

export const metadata: Metadata = {
	title: {
		default: SITE_NAME,
		template: `%s | ${SITE_NAME}`,
	},
	description: SITE_DESCRIPTION,
	metadataBase: new URL(SITE_URL),
	openGraph: {
		title: SITE_NAME,
		description: SITE_DESCRIPTION,
		url: SITE_URL,
		siteName: SITE_NAME,
		images: [{ url: "/images/lemon_87.png", width: 1200, height: 630 }],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: SITE_NAME,
		description: SITE_DESCRIPTION,
		images: ["/images/lemon_87.png"],
	},
	icons: {
		icon: "/favicon.ico",
		apple: "/favicons/apple-icon-180x180.png",
	},
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className={`${commodore.variable} ${jetbrainsMono.variable}`}>
			<body className="crt flex h-screen flex-col overflow-hidden bg-c64-body font-pixel text-c64-text antialiased">
				<Navbar />
				<main className="min-h-0 flex-1 overflow-auto pt-12 pb-14">{children}</main>
				<Footer />
			</body>
		</html>
	);
}
