import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
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
		images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: SITE_NAME,
		description: SITE_DESCRIPTION,
		images: ["/images/og-image.png"],
	},
	icons: {
		icon: "/favicon.ico",
		apple: "/favicons/apple-icon-180x180.png",
	},
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
			<body className="flex min-h-screen flex-col font-sans antialiased">
				<Navbar />
				<main className="flex-1 pt-16">{children}</main>
				<Footer />
			</body>
		</html>
	);
}
