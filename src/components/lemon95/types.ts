export interface WindowState {
	id: string;
	title: string;
	app: string; // which app component to render
	x: number;
	y: number;
	width: number;
	height: number;
	minimized: boolean;
	maximized: boolean;
	zIndex: number;
}

export interface DesktopApp {
	id: string;
	title: string;
	icon: string; // emoji or text icon
	defaultWidth: number;
	defaultHeight: number;
}
