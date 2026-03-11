# lemonsaur.us 🍋🦕

Personal website of LEMONSAURUS — software engineer, music producer, dinosaur. Based in Oslo, Norway.

A retro-futuristic personal site inspired by the Commodore 64, featuring an interactive terminal homepage, an MDX-powered blog, and a custom emoji system called **lemoji**.

> `87K RAM SYSTEM. SOUND / CODE / STATIC.`

## Features

**Interactive Terminal** — A CLI-style homepage with a boot sequence animation, rainbow ASCII art logo, and working commands (`HELP`, `ABOUT`, `LINKS`, `BLOG`, `MUSIC`, `LEMON`, `CLEAR`). Commands support navigation and link opening.

**MDX Blog** — Statically generated blog with syntax-highlighted code blocks (Shiki), custom prose styling, reading time estimates, and tag support. Posts live in `src/content/blog/` as `.mdx` files.

**Lemoji** — A custom lemon-themed emoji system with 44+ characters mapped to shortcodes (`:smile:`, `:D`, `xD`, etc.). Integrated into blog content via a remark plugin and scattered decoratively throughout the site.

**CRT Aesthetic** — Full Commodore 64 color palette (`#223a22` dark green, `#b8d850` lemon green, `#e8e040` yellow), scanline overlay, vignette effect, pixel font headers (Commodore Server), and JetBrains Mono for code.

## Stack

- **Framework**: [Next.js](https://nextjs.org) 16 (App Router) + React 19 + TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com) 4
- **Blog**: [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) + rehype-pretty-code + gray-matter
- **Linting**: [Biome](https://biomejs.dev)
- **Testing**: [Vitest](https://vitest.dev) + Testing Library
- **Runtime**: [Bun](https://bun.sh)

## Getting Started

```bash
# Install dependencies
bun install

# Start dev server
bun dev

# Run tests
bun test

# Lint & format
bun run check
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home (interactive terminal)
│   └── blog/               # Blog listing + [slug] pages
├── components/
│   ├── terminal/           # Terminal UI + command definitions
│   ├── blog/               # Post cards, MDX renderers
│   └── layout/             # Navbar + footer
├── content/blog/           # MDX blog posts
├── lib/                    # Utilities, blog helpers, lemoji system
└── fonts/                  # Commodore Server TTF
```

## Writing Blog Posts

Create a new `.mdx` file in `src/content/blog/`:

```mdx
---
title: "Post Title"
description: "A short description."
date: "2026-03-11"
tags: ["tag1", "tag2"]
---

Your content here. Use lemoji like :smile: and they'll render automatically.
```

## Links

- [SoundCloud](https://soundcloud.com/lemonsaurusrex)
- [GitHub](https://github.com/lemonsaurus)
- [LinkedIn](https://linkedin.com/in/lemonsaurus)
- [YouTube](https://youtube.com/channel/UCs9yhbwxkAGzPC4Tw7aMqwA)
