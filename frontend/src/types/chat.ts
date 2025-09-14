export interface ChatMessage {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	timestamp: Date;
	isEmergency?: boolean;
	metadata?: {
		model?: string;
		processingTime?: number;
		tokens?: number;
	};
}

export interface ChatSession {
	id: string;
	messages: ChatMessage[];
	createdAt: Date;
	updatedAt: Date;
	title?: string;
}

export interface ChatState {
	messages: ChatMessage[];
	isEmergency: boolean;
	isLoading: boolean;
	currentSession: string | null;
	connectionStatus: "connected" | "disconnected" | "connecting";
}
