"use client";

import { motion } from "framer-motion";
import { Bot, User, Clock, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
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
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.1 }}
							className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
							<ReactMarkdown
								remarkPlugins={[remarkGfm]}
								rehypePlugins={[rehypeHighlight]}
								components={{
									// Custom styling for medical content
									h1: ({ children }) => (
										<h1 className="text-lg font-bold text-foreground mb-2 mt-4 first:mt-0">
											{children}
										</h1>
									),
									h2: ({ children }) => (
										<h2 className="text-base font-semibold text-foreground mb-2 mt-3 first:mt-0">
											{children}
										</h2>
									),
									h3: ({ children }) => (
										<h3 className="text-sm font-semibold text-foreground mb-1 mt-2 first:mt-0">
											{children}
										</h3>
									),
									p: ({ children }) => (
										<p className="mb-2 last:mb-0 text-foreground">{children}</p>
									),
									ul: ({ children }) => (
										<ul className="list-disc list-inside mb-2 space-y-1 text-foreground">
											{children}
										</ul>
									),
									ol: ({ children }) => (
										<ol className="list-decimal list-inside mb-2 space-y-1 text-foreground">
											{children}
										</ol>
									),
									li: ({ children }) => (
										<li className="text-foreground">{children}</li>
									),
									strong: ({ children }) => (
										<strong className="font-semibold text-foreground">
											{children}
										</strong>
									),
									em: ({ children }) => (
										<em className="italic text-foreground">{children}</em>
									),
									code: ({ children }) => (
										<code className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-foreground">
											{children}
										</code>
									),
									pre: ({ children }) => (
										<pre className="bg-muted p-2 rounded overflow-x-auto text-xs font-mono text-foreground mb-2">
											{children}
										</pre>
									),
									blockquote: ({ children }) => (
										<blockquote className="border-l-4 border-muted pl-4 italic text-muted-foreground mb-2">
											{children}
										</blockquote>
									),
								}}>
								{message.content}
							</ReactMarkdown>
						</motion.div>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.2 }}
							className="flex items-center gap-1 mt-3 text-xs opacity-70">
							<Clock className="h-3 w-3" />
							{new Date(message.timestamp).toLocaleTimeString()}
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
