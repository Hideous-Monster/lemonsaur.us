import { Terminal } from "@/components/terminal/terminal";

export default function HomePage() {
	return (
		<div className="flex h-full flex-col bg-c64-dim p-6 sm:p-10 md:p-16">
			<div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-c64-body">
				<Terminal />
			</div>
		</div>
	);
}
