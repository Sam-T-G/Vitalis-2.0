"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, AlertTriangle, Shield, Bot } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { apiClient, ApiResponse, StreamingApiResponse } from "@/lib/api";
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
		updateMessage,
		setEmergency,
		setLoading,
		setConnectionStatus,
		loadConversationHistory,
		syncConversationToServer,
	} = useChatStore();

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// Check connection status and load conversation history on mount
	useEffect(() => {
		const initializeChat = async () => {
			setConnectionStatus("connecting");
			try {
				// Check API health
				const healthResponse = await apiClient.getHealth();
				if (healthResponse.status === "healthy") {
					setConnectionStatus("connected");
					// Load conversation history
					await loadConversationHistory();
				} else {
					setConnectionStatus("disconnected");
				}
			} catch (error) {
				console.error("Failed to initialize chat:", error);
				setConnectionStatus("disconnected");
			}
		};

		initializeChat();
	}, [setConnectionStatus, loadConversationHistory]);

	const handleSendMessage = async () => {
		if (!inputMessage.trim() || isLoading) return;

		const userMessage: ChatMessage = {
			id: Date.now().toString(),
			role: "user",
			content: inputMessage,
			timestamp: new Date(),
		};

		addMessage(userMessage);

		// Add user message to server conversation
		await apiClient.addToConversation(inputMessage, "user");

		const messageToSend = inputMessage;
		setInputMessage("");
		setLoading(true);

		// Create initial assistant message for streaming
		const assistantMessageId = (Date.now() + 1).toString();
		const assistantMessage: ChatMessage = {
			id: assistantMessageId,
			role: "assistant",
			content: "",
			timestamp: new Date(),
			isEmergency: false,
		};

		// Add empty assistant message to start streaming
		addMessage(assistantMessage);

		try {
			// Get conversation history for context
			const conversationHistory = messages.map((msg) => ({
				role: msg.role,
				content: msg.content,
			}));

			// Use streaming API
			const stream = apiClient.sendStreamingMessage(
				messageToSend,
				conversationHistory
			);
			let fullResponse = "";
			let isEmergency = false;
			let disclaimer: string | undefined;
			let metadata: any;

			for await (const chunk of stream) {
				switch (chunk.type) {
					case "metadata":
						isEmergency = chunk.isEmergency || false;
						disclaimer = chunk.disclaimer;
						setEmergency(isEmergency);
						break;
					case "content":
						if (chunk.content) {
							fullResponse += chunk.content;
							// Update the message content in real-time
							updateMessage(assistantMessageId, {
								content: fullResponse,
								isEmergency,
								disclaimer,
							});
						}
						break;
					case "complete":
						metadata = chunk.metadata;
						// Final update with metadata
						updateMessage(assistantMessageId, {
							content: fullResponse,
							isEmergency,
							disclaimer,
							metadata,
						});
						// Add final message to server conversation
						await apiClient.addToConversation(fullResponse, "assistant");
						break;
					case "error":
						console.error("Streaming error:", chunk.error);
						updateMessage(assistantMessageId, {
							content:
								chunk.message ||
								"Sorry, I encountered an error. Please try again or check your connection.",
						});
						break;
				}
			}
		} catch (error) {
			console.error("Error sending message:", error);
			updateMessage(assistantMessageId, {
				content:
					"Sorry, I encountered an error. Please try again or check your connection.",
			});
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
					This is not a medical diagnostic tool. Always seek professional
					medical help for emergencies.
				</motion.p>
			</motion.div>
		</motion.div>
	);
}
