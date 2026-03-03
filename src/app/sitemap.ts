import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/blog";
import { SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
	const blogSlugs = getAllSlugs();

	const blogEntries = blogSlugs.map((slug) => ({
		url: `${SITE_URL}/blog/${slug}`,
		lastModified: new Date(),
		changeFrequency: "weekly" as const,
		priority: 0.7,
	}));

	return [
		{
			url: SITE_URL,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 1,
		},
		{
			url: `${SITE_URL}/blog`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.8,
		},
		...blogEntries,
	];
}
