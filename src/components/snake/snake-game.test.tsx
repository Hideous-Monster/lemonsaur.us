import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SnakeGame } from "./snake-game";

const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] ?? null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		clear: () => {
			store = {};
		},
	};
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
	fillStyle: "",
	strokeStyle: "",
	lineWidth: 0,
	font: "",
	textAlign: "",
	textBaseline: "",
	fillRect: vi.fn(),
	strokeRect: vi.fn(),
	beginPath: vi.fn(),
	moveTo: vi.fn(),
	lineTo: vi.fn(),
	stroke: vi.fn(),
	arc: vi.fn(),
	fill: vi.fn(),
	fillText: vi.fn(),
	drawImage: vi.fn(),
})) as unknown as typeof HTMLCanvasElement.prototype.getContext;

describe("SnakeGame", () => {
	const onExit = vi.fn();

	afterEach(() => {
		onExit.mockClear();
		localStorageMock.clear();
	});

	it("renders the start screen", () => {
		render(<SnakeGame onExit={onExit} />);
		expect(screen.getByText("LEMON SNAKE")).toBeDefined();
		expect(screen.getByText("PRESS ANY KEY TO START")).toBeDefined();
	});

	it("renders score display", () => {
		render(<SnakeGame onExit={onExit} />);
		expect(screen.getByText("SCORE:")).toBeDefined();
		expect(screen.getByText("HI:")).toBeDefined();
	});

	it("renders the canvas at correct size", () => {
		render(<SnakeGame onExit={onExit} />);
		const canvas = document.querySelector("canvas");
		expect(canvas).toBeTruthy();
		expect(canvas?.width).toBe(720);
		expect(canvas?.height).toBe(432);
	});

	it("renders control instructions", () => {
		render(<SnakeGame onExit={onExit} />);
		expect(screen.getByText("ARROWS / WASD TO MOVE")).toBeDefined();
		expect(screen.getByText("SWIPE ON MOBILE")).toBeDefined();
		expect(screen.getByText("ESC TO QUIT")).toBeDefined();
	});

	it("loads high score from localStorage", () => {
		localStorageMock.setItem("snake-highscore", "100");
		render(<SnakeGame onExit={onExit} />);
		expect(screen.getByText("100")).toBeDefined();
	});

	it("calls onExit when Escape is pressed", () => {
		render(<SnakeGame onExit={onExit} />);
		fireEvent.keyDown(window, { key: "Escape" });
		expect(onExit).toHaveBeenCalledTimes(1);
	});
});
