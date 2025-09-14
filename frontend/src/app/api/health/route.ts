import { NextResponse } from "next/server";

const DEFAULT_BASE_URL = "http://localhost:11434";
const DEFAULT_MODEL = "gpt-oss:20b";

async function checkOllamaStatus(
	baseUrl: string,
	model: string
): Promise<boolean> {
	try {
		const response = await fetch(`${baseUrl}/api/tags`, {
			method: "GET",
			signal: AbortSignal.timeout(5000), // 5 second timeout
		});

		if (!response.ok) {
			return false;
		}

		const data = await response.json();
		const availableModels = data.models?.map((m: any) => m.name) || [];

		return availableModels.includes(model);
	} catch (error) {
		console.error("Ollama health check failed:", error);
		return false;
	}
}

export async function GET() {
	try {
		const isHealthy = await checkOllamaStatus(DEFAULT_BASE_URL, DEFAULT_MODEL);

		if (!isHealthy) {
			return NextResponse.json(
				{
					status: "unhealthy",
					message: "Ollama server is not responding or model is not available",
					ollama_url: DEFAULT_BASE_URL,
					model: DEFAULT_MODEL,
					timestamp: new Date().toISOString(),
				},
				{ status: 503 }
			);
		}

		return NextResponse.json({
			status: "healthy",
			message: "Vitalis API and Ollama server are running",
			ollama_url: DEFAULT_BASE_URL,
			model: DEFAULT_MODEL,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Health check error:", error);
		return NextResponse.json(
			{
				status: "error",
				message: "Health check failed",
				error: error instanceof Error ? error.message : "Unknown error",
				timestamp: new Date().toISOString(),
			},
			{ status: 500 }
		);
	}
}
