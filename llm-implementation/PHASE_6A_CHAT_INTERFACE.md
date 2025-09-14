# Phase 6A: Chat Interface

## 🎯 Objective

Create a comprehensive, animated chat interface with real-time messaging, emergency detection, and smooth user interactions using Framer Motion and modern React patterns.

## 📋 Prerequisites

- All previous phases completed successfully
- Framer Motion animations working
- shadcn/ui components available
- TypeScript configuration working
- API types defined

## 🚀 Implementation Steps

### Step 1: Create Chat Types

Create `src/types/chat.ts`:

```typescript
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
```

### Step 2: Create Chat Store

Create `src/store/chatStore.ts`:

```typescript
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { ChatMessage, ChatState } from "@/types/chat";

interface ChatActions {
	addMessage: (message: ChatMessage) => void;
	clearMessages: () => void;
	setEmergency: (isEmergency: boolean) => void;
	setLoading: (isLoading: boolean) => void;
	setCurrentSession: (sessionId: string | null) => void;
	setConnectionStatus: (
		status: "connected" | "disconnected" | "connecting"
	) => void;
	getMessageCount: () => number;
	getLastMessage: () => ChatMessage | null;
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
```

### Step 3: Create API Client

Create `src/lib/api.ts`:

```typescript
import { ChatMessage } from "@/types/chat";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ApiResponse {
	message: string;
	isEmergency: boolean;
	disclaimer?: string;
	metadata?: {
		model: string;
		processingTime: number;
		tokens: number;
	};
}

export class ApiClient {
	private baseUrl: string;

	constructor(baseUrl: string = API_BASE_URL) {
		this.baseUrl = baseUrl;
	}

	async sendMessage(message: string): Promise<ApiResponse> {
		try {
			const response = await fetch(`${this.baseUrl}/api/chat`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ message }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to send message");
			}

			return await response.json();
		} catch (error) {
			console.error("API Error:", error);
			throw error;
		}
	}

	async getHealth(): Promise<{ status: string; model: string }> {
		try {
			const response = await fetch(`${this.baseUrl}/api/health`);
			if (!response.ok) {
				throw new Error("Health check failed");
			}
			return await response.json();
		} catch (error) {
			console.error("Health check error:", error);
			throw error;
		}
	}
}

export const apiClient = new ApiClient();
```

### Step 4: Create Message Component

Create `src/components/chat/MessageBubble.tsx`:

```typescript
"use client";

import { motion } from "framer-motion";
import { Bot, User, Clock, AlertTriangle } from "lucide-react";
import { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";
import { messageVariants } from "@/lib/animations";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MessageBubbleProps {
	message: ChatMessage;
	className?: string;
}

export default function MessageBubble({
	message,
	className,
}: MessageBubbleProps) {
	const isUser = message.role === "user";
	const isEmergency = message.isEmergency;

	return (
		<motion.div
			variants={messageVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
			layout
			className={cn(
				"flex gap-3",
				isUser ? "justify-end" : "justify-start",
				className
			)}>
			<Card
				className={cn(
					"max-w-[80%] p-4 transition-all duration-300",
					isUser
						? "bg-primary text-primary-foreground"
						: isEmergency
						? "bg-emergency-50 border-emergency-200 shadow-lg"
						: "bg-card border-border shadow-sm"
				)}>
				<div className="flex items-start gap-3">
					<motion.div
						whileHover={{ scale: 1.1 }}
						className={cn(
							"p-2 rounded-full",
							isUser ? "bg-primary-foreground/20" : "bg-medical-100"
						)}>
						{isUser ? (
							<User className="h-4 w-4 text-primary-foreground" />
						) : (
							<Bot className="h-4 w-4 text-medical-600" />
						)}
					</motion.div>
					<div className="flex-1">
						{isEmergency && (
							<motion.div
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								className="mb-2">
								<Badge variant="destructive" className="animate-pulse">
									<AlertTriangle className="h-3 w-3 mr-1" />
									Emergency Alert
								</Badge>
							</motion.div>
						)}
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.1 }}
							className="text-sm whitespace-pre-wrap leading-relaxed">
							{message.content}
						</motion.p>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.2 }}
							className="flex items-center gap-1 mt-3 text-xs opacity-70">
							<Clock className="h-3 w-3" />
							{message.timestamp.toLocaleTimeString()}
							{message.metadata?.processingTime && (
								<span className="ml-2">
									({message.metadata.processingTime}ms)
								</span>
							)}
						</motion.div>
					</div>
				</div>
			</Card>
		</motion.div>
	);
}
```

### Step 5: Create Chat Interface

Create `src/components/chat/ChatInterface.tsx`:

```typescript
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, AlertTriangle, Shield, Bot } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { apiClient, ApiResponse } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
	containerVariants,
	emergencyVariants,
	typingVariants,
} from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MessageBubble from "./MessageBubble";
import { ChatMessage } from "@/types/chat";

interface ChatInterfaceProps {
	className?: string;
}

export default function ChatInterface({ className }: ChatInterfaceProps) {
	const [inputMessage, setInputMessage] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const {
		messages,
		isEmergency,
		isLoading,
		connectionStatus,
		addMessage,
		setEmergency,
		setLoading,
	} = useChatStore();

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSendMessage = async () => {
		if (!inputMessage.trim() || isLoading) return;

		const userMessage: ChatMessage = {
			id: Date.now().toString(),
			role: "user",
			content: inputMessage,
			timestamp: new Date(),
		};

		addMessage(userMessage);
		const messageToSend = inputMessage;
		setInputMessage("");
		setLoading(true);

		try {
			const response: ApiResponse = await apiClient.sendMessage(messageToSend);

			const assistantMessage: ChatMessage = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content: response.message,
				timestamp: new Date(),
				isEmergency: response.isEmergency,
				metadata: response.metadata,
			};

			addMessage(assistantMessage);
			setEmergency(response.isEmergency);
		} catch (error) {
			console.error("Error sending message:", error);
			const errorMessage: ChatMessage = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content:
					"Sorry, I encountered an error. Please try again or check your connection.",
				timestamp: new Date(),
			};
			addMessage(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className={cn("flex flex-col h-full bg-background", className)}>
			{/* Animated Header */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2 }}
				className={cn(
					"p-4 border-b transition-colors duration-300",
					isEmergency
						? "bg-emergency-50 border-emergency-200"
						: "bg-medical-50 border-medical-200"
				)}>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<motion.div
							whileHover={{ scale: 1.1, rotate: 5 }}
							whileTap={{ scale: 0.95 }}>
							<Shield className="h-6 w-6 text-medical-600" />
						</motion.div>
						<div>
							<h2 className="font-semibold text-foreground flex items-center gap-2">
								Vitalis Assistant
								{isEmergency && (
									<motion.div variants={emergencyVariants} animate="pulse">
										<Badge variant="destructive" className="animate-pulse">
											<AlertTriangle className="h-3 w-3 mr-1" />
											Emergency
										</Badge>
									</motion.div>
								)}
							</h2>
							<p className="text-sm text-muted-foreground">
								Emergency Preparedness & First-Aid Helper
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2 text-sm">
						<div
							className={cn(
								"w-2 h-2 rounded-full",
								connectionStatus === "connected"
									? "bg-green-500"
									: connectionStatus === "connecting"
									? "bg-yellow-500"
									: "bg-red-500"
							)}
						/>
						<span className="text-muted-foreground capitalize">
							{connectionStatus}
						</span>
					</div>
				</div>
			</motion.div>

			{/* Messages Container */}
			<div className="flex-1 overflow-y-auto p-4">
				<AnimatePresence>
					{messages.length === 0 ? (
						<motion.div
							key="welcome"
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.4, duration: 0.5 }}
							className="text-center text-muted-foreground mt-12">
							<motion.div
								animate={{
									y: [0, -10, 0],
									rotate: [0, 5, -5, 0],
								}}
								transition={{
									duration: 2,
									repeat: Infinity,
									ease: "easeInOut",
								}}>
								<Shield className="h-16 w-16 mx-auto mb-6 text-medical-400" />
							</motion.div>
							<motion.h3
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.6 }}
								className="text-xl font-semibold mb-2">
								Welcome to Vitalis
							</motion.h3>
							<motion.p
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.8 }}
								className="text-sm">
								Ask me about emergency preparedness and first-aid guidance
							</motion.p>
						</motion.div>
					) : (
						<motion.div
							variants={containerVariants}
							initial="hidden"
							animate="visible"
							className="space-y-4">
							{messages.map((message) => (
								<MessageBubble key={message.id} message={message} />
							))}
						</motion.div>
					)}
				</AnimatePresence>

				{/* Loading Indicator */}
				<AnimatePresence>
					{isLoading && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							className="flex justify-start mt-4">
							<Card className="bg-card border-border p-4">
								<div className="flex items-center gap-3">
									<motion.div
										variants={typingVariants}
										animate="animate"
										className="p-2 bg-medical-100 rounded-full">
										<Bot className="h-4 w-4 text-medical-600" />
									</motion.div>
									<div className="flex space-x-1">
										{[0, 1, 2].map((i) => (
											<motion.div
												key={i}
												className="w-2 h-2 bg-medical-400 rounded-full"
												animate={{
													y: [0, -10, 0],
													opacity: [0.4, 1, 0.4],
												}}
												transition={{
													duration: 0.6,
													repeat: Infinity,
													delay: i * 0.1,
													ease: "easeInOut",
												}}
											/>
										))}
									</div>
								</div>
							</Card>
						</motion.div>
					)}
				</AnimatePresence>
				<div ref={messagesEndRef} />
			</div>

			{/* Input Section */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
				className="p-4 border-t bg-muted/30">
				<div className="flex gap-3">
					<Input
						value={inputMessage}
						onChange={(e) => setInputMessage(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Ask about emergency preparedness or first-aid..."
						disabled={isLoading}
						className="flex-1"
					/>
					<Button
						onClick={handleSendMessage}
						disabled={!inputMessage.trim() || isLoading}
						size="icon"
						className="shrink-0">
						<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
							<Send className="h-4 w-4" />
						</motion.div>
					</Button>
				</div>
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
					<AlertTriangle className="h-3 w-3" />
					This is not a medical diagnostic tool. Always seek professional medical
					help for emergencies.
				</motion.p>
			</motion.div>
		</motion.div>
	);
}
```

### Step 6: Update Main Page

Update `src/app/page.tsx`:

```typescript
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
```

## ✅ Validation Criteria

### Must Have:

- [ ] Chat interface renders correctly
- [ ] Messages display with proper styling
- [ ] Emergency detection works with visual alerts
- [ ] Loading states show animated indicators
- [ ] Input handling works correctly
- [ ] Animations are smooth and performant

### Quality Checks:

- [ ] TypeScript compilation successful
- [ ] No console errors or warnings
- [ ] Responsive design works on mobile
- [ ] Accessibility features implemented
- [ ] State management working correctly
- [ ] API integration functional

## 🔧 Common Issues & Solutions

### Issue: "Messages not displaying"

**Solution**: Check state management and ensure messages are properly added to store

### Issue: "Animations not smooth"

**Solution**: Verify Framer Motion setup and check for conflicting CSS

### Issue: "API calls failing"

**Solution**: Ensure backend is running and API endpoints are correct

## 🧪 Testing Commands

```bash
# Test TypeScript compilation
npx tsc --noEmit

# Test build process
npm run build

# Test development server
npm run dev
```

## 🎯 Success Metrics

- Chat interface fully functional
- Smooth animations throughout
- Emergency detection working
- Responsive design implemented
- No performance issues
- Accessibility compliant

## ➡️ Next Phase

Proceed to **Phase 6B: Emergency Detection** only after all validation criteria are met.

---

**⚠️ Critical**: Ensure the chat interface is fully functional and polished before proceeding. Test all features thoroughly.
