import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { ChatMessage, ChatState } from "@/types/chat";
import { apiClient } from "@/lib/api";

interface ChatActions {
	addMessage: (message: ChatMessage) => void;
	updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
	clearMessages: () => void;
	setEmergency: (isEmergency: boolean) => void;
	setLoading: (isLoading: boolean) => void;
	setCurrentSession: (sessionId: string | null) => void;
	setConnectionStatus: (
		status: "connected" | "disconnected" | "connecting"
	) => void;
	getMessageCount: () => number;
	getLastMessage: () => ChatMessage | null;
	loadConversationHistory: () => Promise<void>;
	syncConversationToServer: () => Promise<void>;
}

export const useChatStore = create<ChatState & ChatActions>()(
	devtools(
		persist(
			(set, get) => ({
				// State
				messages: [],
				isEmergency: false,
				isLoading: false,
				currentSession: null,
				connectionStatus: "disconnected",

				// Actions
				addMessage: (message) =>
					set((state) => ({
						messages: [...state.messages, message],
					})),

				updateMessage: (id, updates) =>
					set((state) => ({
						messages: state.messages.map((msg) =>
							msg.id === id ? { ...msg, ...updates } : msg
						),
					})),

				clearMessages: () =>
					set(() => ({
						messages: [],
						isEmergency: false,
					})),

				setEmergency: (isEmergency) => set(() => ({ isEmergency })),

				setLoading: (isLoading) => set(() => ({ isLoading })),

				setCurrentSession: (currentSession) => set(() => ({ currentSession })),

				setConnectionStatus: (connectionStatus) =>
					set(() => ({ connectionStatus })),

				getMessageCount: () => get().messages.length,

				getLastMessage: () => {
					const messages = get().messages;
					return messages.length > 0 ? messages[messages.length - 1] : null;
				},

				loadConversationHistory: async () => {
					try {
						const conversationData = await apiClient.getConversation();
						// Convert server conversation format to local message format
						const serverMessages = conversationData.conversation
							.filter((msg) => msg.role !== "system") // Exclude system prompt
							.map((msg, index) => ({
								id: `server-${index}`,
								role: msg.role as "user" | "assistant",
								content: msg.content,
								timestamp: new Date(),
							}));

						set(() => ({
							messages: serverMessages,
						}));
					} catch (error) {
						console.error("Failed to load conversation history:", error);
					}
				},

				syncConversationToServer: async () => {
					try {
						const messages = get().messages;
						// Convert local messages to server format
						const conversationHistory = messages.map((msg) => ({
							role: msg.role,
							content: msg.content,
						}));

						// Sync each message to server
						for (const msg of messages) {
							await apiClient.addToConversation(msg.content, msg.role);
						}
					} catch (error) {
						console.error("Failed to sync conversation to server:", error);
					}
				},
			}),
			{
				name: "vitalis-chat-storage",
				partialize: (state) => ({
					messages: state.messages,
					currentSession: state.currentSession,
				}),
			}
		),
		{
			name: "vitalis-chat-store",
		}
	)
);
