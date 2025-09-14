import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

// Import the core functions from the CLI backend
const VITALIS_CLI_PATH = path.join(process.cwd(), "..", "vitalis_cli.py");
const PYTHON_PATH = path.join(process.cwd(), "..", "venv", "bin", "python");

// Constants from vitalis_cli.py
const DEFAULT_BASE_URL = "http://localhost:11434";
const DEFAULT_MODEL = "gpt-oss:20b";
const DEFAULT_TEMP = 0.2;

const SYSTEM_PROMPT =
	'You are "Vitalis," a calm, non-clinical Emergency Preparedness & First-Aid Helper. ' +
	"You provide general safety, scene assessment, and basic first-aid concepts based on " +
	"widely accepted emergency care practices. Your guidance should be actionable for the user, " +
	"whether for self-care or assisting another person.\n\n" +
	"Ground rules:\n" +
	"- For ALL emergencies (including life-threatening ones), provide immediate action steps while " +
	'emphasizing the need to call emergency services. Don\'t just say "call 911" - give specific ' +
	"steps they can take while waiting for help.\n" +
	"- For life-threatening emergencies (unconscious/unresponsive, not breathing or gasping, severe bleeding, " +
	"chest pain/pressure, stroke signs (FAST), anaphylaxis, seizure >5 min or repeated seizures, " +
	"major trauma/spinal injury, severe burns, serious pregnancy complications, suspected overdose/poisoning, " +
	"gas leak, fire, downed power lines), provide immediate steps AND call emergency services.\n" +
	"- For non-life-threatening emergencies, provide basic first-aid steps using common, verifiable practices:\n" +
	"  * Broken bones: immobilize, apply ice, elevate if possible, don't move the person\n" +
	"  * Cuts/wounds: apply direct pressure, clean if possible, cover with clean cloth\n" +
	"  * Burns: cool with water, remove jewelry, don't pop blisters\n" +
	"  * Sprains: RICE (Rest, Ice, Compression, Elevation)\n" +
	"  * Choking: encourage coughing, back blows if needed\n" +
	"- Never provide diagnosis, medication dosing, or invasive procedures. Refuse and redirect safely.\n" +
	"- Style: Provide brief, numbered steps in plain language. Start with the most time-critical action. " +
	"Tailor instructions dynamically based on the patient's immediate condition (e.g., if they're conscious/unconscious, " +
	"breathing/not breathing) to provide only the most relevant steps. Avoid generic conditional headers if the " +
	"condition is known. End with a short recap and when to escalate.\n" +
	"- After providing initial critical steps, ask up to 3 brief clarifying questions (e.g., location, hazards, " +
	"available supplies, patient's current state like conscious/breathing).\n" +
	'- Always include: "I\'m not a medical professional" disclaimer.\n\n' +
	"Your purpose is to reduce risk and help users act safely until professionals arrive.";

const RED_FLAG_KEYWORDS = [
	"not breathing",
	"isn't breathing",
	"no pulse",
	"gasping",
	"unresponsive",
	"severe bleeding",
	"spurting",
	"chest pain",
	"pressure in chest",
	"stroke",
	"face droop",
	"arm weakness",
	"slurred speech",
	"anaphylaxis",
	"epipen",
	"seizure",
	"overdose",
	"poisoned",
	"gas leak",
	"smell of gas",
	"fire",
	"smoke inhalation",
	"downed power line",
	"electric shock",
	"head injury",
	"spinal injury",
	"fell from",
	"gunshot",
	"stab wound",
	"suicidal",
	"self-harm",
];

const BLOCKED_PATTERNS = [
	/\\b\\d+(\\.\\d+)?\\s?(mg|mcg|mL|units)\\b/g,
	/diagnose|prescribe|dose|suture|defibrillat|intubate/gi,
];

// Utility functions from CLI backend
function detectEmergency(userText: string): boolean {
	const userTextLower = userText.toLowerCase();
	return RED_FLAG_KEYWORDS.some((keyword) => userTextLower.includes(keyword));
}

function postFilter(assistantText: string): string {
	let filteredText = assistantText;
	for (const pattern of BLOCKED_PATTERNS) {
		filteredText = filteredText.replace(
			pattern,
			"[REDACTED: I'm not a medical professional. Please seek professional help.]"
		);
	}
	return filteredText;
}

async function streamChat(
	baseUrl: string,
	model: string,
	messages: any[],
	temperature: number
): Promise<string> {
	const payload = {
		model,
		messages,
		stream: true,
		options: { temperature },
	};

	try {
		const response = await fetch(`${baseUrl}/api/chat`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const reader = response.body?.getReader();
		if (!reader) {
			throw new Error("No response body");
		}

		let fullResponse = "";
		const decoder = new TextDecoder();

		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split("\n");

				for (const line of lines) {
					if (line.trim()) {
						try {
							const data = JSON.parse(line);
							if (data.message?.content) {
								fullResponse += data.message.content;
							}
							if (data.done) {
								return fullResponse;
							}
						} catch (parseError) {
							// Skip malformed JSON lines
							continue;
						}
					}
				}
			}
		} finally {
			reader.releaseLock();
		}

		return fullResponse;
	} catch (error) {
		console.error("Error in streamChat:", error);
		throw error;
	}
}

export async function POST(request: NextRequest) {
	try {
		const { message, conversationHistory = [] } = await request.json();

		if (!message || typeof message !== "string") {
			return NextResponse.json(
				{ error: "Message is required and must be a string" },
				{ status: 400 }
			);
		}

		// Detect if this is an emergency
		const isEmergency = detectEmergency(message);

		// Build conversation with system prompt
		const messages = [
			{ role: "system", content: SYSTEM_PROMPT },
			...conversationHistory,
			{ role: "user", content: message },
		];

		// Create a streaming response
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			async start(controller) {
				try {
					const startTime = Date.now();
					let fullResponse = "";
					let filteredResponse = "";

					// Send initial metadata
					const initialData = {
						type: "metadata",
						isEmergency,
						disclaimer: isEmergency
							? "⚠️ EMERGENCY ALERT: This appears to be a medical emergency. Please call emergency services (911) immediately while following the guidance provided. This AI assistant is not a substitute for professional medical care."
							: undefined,
						model: DEFAULT_MODEL,
					};
					controller.enqueue(
						encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`)
					);

					// Stream from Ollama
					const payload = {
						model: DEFAULT_MODEL,
						messages,
						stream: true,
						options: { temperature: DEFAULT_TEMP },
					};

					const response = await fetch(`${DEFAULT_BASE_URL}/api/chat`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(payload),
					});

					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}

					const reader = response.body?.getReader();
					if (!reader) {
						throw new Error("No response body");
					}

					const decoder = new TextDecoder();

					try {
						while (true) {
							const { done, value } = await reader.read();
							if (done) break;

							const chunk = decoder.decode(value);
							const lines = chunk.split("\n");

							for (const line of lines) {
								if (line.trim()) {
									try {
										const data = JSON.parse(line);
										if (data.message?.content) {
											const content = data.message.content;
											fullResponse += content;

											// Apply post-filtering to the new content
											const newFilteredContent = postFilter(content);
											filteredResponse += newFilteredContent;

											// Send the filtered content to client
											const streamData = {
												type: "content",
												content: newFilteredContent,
											};
											controller.enqueue(
												encoder.encode(
													`data: ${JSON.stringify(streamData)}\n\n`
												)
											);
										}
										if (data.done) {
											// Send final metadata
											const processingTime = Date.now() - startTime;
											const finalData = {
												type: "complete",
												metadata: {
													model: DEFAULT_MODEL,
													processingTime,
													tokens: filteredResponse.split(" ").length,
												},
											};
											controller.enqueue(
												encoder.encode(`data: ${JSON.stringify(finalData)}\n\n`)
											);
											controller.close();
											return;
										}
									} catch (parseError) {
										// Skip malformed JSON lines
										continue;
									}
								}
							}
						}
					} finally {
						reader.releaseLock();
					}
				} catch (error) {
					console.error("Streaming error:", error);
					const errorData = {
						type: "error",
						error: "Failed to stream response",
						message:
							"I'm sorry, I'm having trouble processing your request right now. Please try again.",
					};
					controller.enqueue(
						encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`)
					);
					controller.close();
				}
			},
		});

		return new Response(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	} catch (error) {
		console.error("API route error:", error);
		return NextResponse.json(
			{
				error: "Internal server error",
				message:
					"I'm sorry, I'm having trouble processing your request right now. Please try again.",
				isEmergency: false,
			},
			{ status: 500 }
		);
	}
}

export async function GET() {
	return NextResponse.json({
		status: "healthy",
		message: "Vitalis Chat API is running",
		timestamp: new Date().toISOString(),
	});
}
