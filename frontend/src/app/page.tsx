import ChatInterface from "@/components/chat/ChatInterface";

export default function Home() {
	return (
		<div className="min-h-screen bg-background">
			<main className="max-w-4xl mx-auto p-4 h-screen">
				<div className="bg-card rounded-lg shadow-sm border border-border h-full">
					<ChatInterface />
				</div>
			</main>
		</div>
	);
}
