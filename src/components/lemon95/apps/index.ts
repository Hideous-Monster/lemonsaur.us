"use client";

import type React from "react";
import { PongGame } from "@/components/pong/pong-game";
import { SnakeGame } from "@/components/snake/snake-game";
import { TetrisGame } from "@/components/tetris/tetris-game";
import { AboutApp } from "./about-app";
import { BlogApp } from "./blog-app";
import { DoomApp } from "./doom-app";
import { FortuneApp } from "./fortune-app";
import { GameWrapper } from "./game-wrapper";
import { HackApp } from "./hack-app";
import { LinksApp } from "./links-app";
import { MatrixApp } from "./matrix-app";
import { MessengerApp } from "./messenger-app";
import { NeofetchApp } from "./neofetch-app";
import { WeatherApp } from "./weather-app";

// Thin wrappers that bind each game to GameWrapper
function SnakeAppInner() {
	return GameWrapper({ component: SnakeGame });
}
function TetrisAppInner() {
	return GameWrapper({ component: TetrisGame });
}
function PongAppInner() {
	return GameWrapper({ component: PongGame });
}

const APP_MAP: Record<string, React.ComponentType> = {
	snake: SnakeAppInner,
	tetris: TetrisAppInner,
	pong: PongAppInner,
	doom: DoomApp,
	matrix: MatrixApp,
	hack: HackApp,
	fortune: FortuneApp,
	weather: WeatherApp,
	about: AboutApp,
	links: LinksApp,
	neofetch: NeofetchApp,
	blog: BlogApp,
	messenger: MessengerApp,
};

/**
 * Returns the app component for a given app ID string.
 * Falls back to null if the app ID is unknown.
 */
export function getAppComponent(appId: string): React.ComponentType | null {
	return APP_MAP[appId] ?? null;
}
