#!/usr/bin/env node

const testStreaming = async () => {
	console.log("🚀 Testing streaming chat functionality...\n");

	try {
		const response = await fetch("http://localhost:3000/api/chat", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				message: "Help me with first aid for a cut on my finger",
				conversationHistory: [],
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		if (!response.body) {
			throw new Error("No response body");
		}

		const reader = response.body.getReader();
		const decoder = new TextDecoder();

		console.log("📡 Starting to receive streamed response...\n");

		let receivedChunks = 0;
		let totalContent = "";
		let isEmergency = false;
		let metadata = null;

		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split("\n");

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						const data = line.slice(6); // Remove "data: " prefix
						if (data.trim()) {
							try {
								const parsed = JSON.parse(data);
								receivedChunks++;

								switch (parsed.type) {
									case "metadata":
										isEmergency = parsed.isEmergency;
										console.log("📋 Metadata received:");
										console.log(`   Emergency: ${isEmergency}`);
										console.log(`   Model: ${parsed.model}`);
										if (parsed.disclaimer) {
											console.log(`   Disclaimer: ${parsed.disclaimer}`);
										}
										console.log("");
										break;

									case "content":
										if (parsed.content) {
											totalContent += parsed.content;
											process.stdout.write(parsed.content);
										}
										break;

									case "complete":
										metadata = parsed.metadata;
										console.log("\n\n✅ Stream completed!");
										console.log(`📊 Final stats:`);
										console.log(`   Total chunks received: ${receivedChunks}`);
										console.log(
											`   Processing time: ${metadata?.processingTime}ms`
										);
										console.log(`   Token count: ${metadata?.tokens}`);
										console.log(
											`   Total content length: ${totalContent.length} characters`
										);
										break;

									case "error":
										console.log("\n❌ Error received:", parsed.error);
										break;
								}
							} catch (parseError) {
								console.error("Failed to parse streaming data:", parseError);
							}
						}
					}
				}
			}
		} finally {
			reader.releaseLock();
		}

		console.log("\n🎉 Streaming test completed successfully!");
		return true;
	} catch (error) {
		console.error("❌ Streaming test failed:", error);
		return false;
	}
};

// Run the test
testStreaming().then((success) => {
	process.exit(success ? 0 : 1);
});
