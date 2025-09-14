import { NextRequest, NextResponse } from "next/server";

// In-memory conversation storage (in production, use a database)
let conversationHistory: Array<{ role: string; content: string }> = [];

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

export async function GET() {
	try {
		const fullConversation = [
			{ role: "system", content: SYSTEM_PROMPT },
			...conversationHistory,
		];

		return NextResponse.json({
			conversation: fullConversation,
			messageCount: conversationHistory.length,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Error getting conversation:", error);
		return NextResponse.json(
			{ error: "Failed to retrieve conversation" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const { action, message } = await request.json();

		if (action === "add") {
			if (!message || typeof message !== "string") {
				return NextResponse.json(
					{ error: "Message is required for add action" },
					{ status: 400 }
				);
			}

			conversationHistory.push({ role: "user", content: message });

			return NextResponse.json({
				message: "Message added successfully",
				conversationLength: conversationHistory.length,
			});
		}

		if (action === "add_assistant") {
			if (!message || typeof message !== "string") {
				return NextResponse.json(
					{ error: "Message is required for add_assistant action" },
					{ status: 400 }
				);
			}

			conversationHistory.push({ role: "assistant", content: message });

			return NextResponse.json({
				message: "Assistant message added successfully",
				conversationLength: conversationHistory.length,
			});
		}

		if (action === "clear") {
			conversationHistory = [];

			return NextResponse.json({
				message: "Conversation cleared successfully",
				conversationLength: 0,
			});
		}

		return NextResponse.json(
			{ error: "Invalid action. Supported actions: add, add_assistant, clear" },
			{ status: 400 }
		);
	} catch (error) {
		console.error("Error managing conversation:", error);
		return NextResponse.json(
			{ error: "Failed to manage conversation" },
			{ status: 500 }
		);
	}
}
