/**
 * Remark plugin that replaces emoji shortcodes and text emoticons
 * with lemoji images in markdown content.
 *
 * Transforms `:smile:`, `:)`, `:D`, etc. into inline image nodes
 * pointing to the corresponding lemoji PNG.
 *
 * Uses MDAST `image` nodes (not raw HTML) for MDX compatibility.
 */

import type { Image, Root, Text } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { LEMOJI_MAP, lemojiPath } from "./lemoji";

// Build a regex that matches any shortcode or emoticon.
// Sort by length (longest first) to avoid partial matches.
const PATTERNS = Object.keys(LEMOJI_MAP).sort((a, b) => b.length - a.length);
const ESCAPED_PATTERNS = PATTERNS.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
const LEMOJI_REGEX = new RegExp(`(${ESCAPED_PATTERNS.join("|")})`, "g");

type InlineNode = Text | Image;

const remarkLemoji: Plugin<[], Root> = () => {
	return (tree: Root) => {
		visit(tree, "text", (node: Text, index, parent) => {
			if (!parent || index === undefined) return;

			const value = node.value;
			if (!LEMOJI_REGEX.test(value)) return;

			// Reset regex state
			LEMOJI_REGEX.lastIndex = 0;

			const children: InlineNode[] = [];
			let lastIndex = 0;
			let match: RegExpExecArray | null = LEMOJI_REGEX.exec(value);

			while (match !== null) {
				// Text before the match
				if (match.index > lastIndex) {
					children.push({
						type: "text",
						value: value.slice(lastIndex, match.index),
					});
				}

				const shortcode = match[0]!;
				const lemojiName = LEMOJI_MAP[shortcode]!;
				const src = lemojiPath(lemojiName);
				const alt =
					shortcode.startsWith(":") && shortcode.endsWith(":") ? shortcode.slice(1, -1) : shortcode;

				children.push({
					type: "image",
					url: src,
					alt,
					title: alt,
				});

				lastIndex = match.index + match[0].length;
				match = LEMOJI_REGEX.exec(value);
			}

			// Remaining text after last match
			if (lastIndex < value.length) {
				children.push({
					type: "text",
					value: value.slice(lastIndex),
				});
			}

			if (children.length > 0) {
				parent.children.splice(index, 1, ...children);
			}
		});
	};
};

export default remarkLemoji;
