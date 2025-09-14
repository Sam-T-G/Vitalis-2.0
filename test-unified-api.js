#!/usr/bin/env node
/**
 * Test script for unified Next.js API
 * This script tests the API endpoints to ensure they work correctly
 */

const API_BASE = "http://localhost:3000";

async function testHealthEndpoint() {
	console.log("🔍 Testing health endpoint...");
	try {
		const response = await fetch(`${API_BASE}/api/health`);
		const data = await response.json();

		if (data.status === "healthy") {
			console.log("✅ Health check passed");
			console.log(`   Model: ${data.model}`);
			console.log(`   Ollama URL: ${data.ollama_url}`);
		} else {
			console.log("❌ Health check failed:", data.message);
		}
	} catch (error) {
		console.log("❌ Health check error:", error.message);
	}
}

async function testChatEndpoint() {
	console.log("🔍 Testing chat endpoint...");
	try {
		const response = await fetch(`${API_BASE}/api/chat`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				message: "Hello, can you help me with basic first aid for a minor cut?",
			}),
		});

		const data = await response.json();

		if (data.message) {
			console.log("✅ Chat endpoint working");
			console.log(`   Response: ${data.message.substring(0, 100)}...`);
			console.log(`   Emergency: ${data.isEmergency}`);
			console.log(`   Processing time: ${data.metadata?.processingTime}ms`);
		} else {
			console.log("❌ Chat endpoint failed:", data.error);
		}
	} catch (error) {
		console.log("❌ Chat endpoint error:", error.message);
	}
}

async function testConversationEndpoint() {
	console.log("🔍 Testing conversation endpoint...");
	try {
		// Test getting conversation
		const getResponse = await fetch(`${API_BASE}/api/conversation`);
		const getData = await getResponse.json();

		if (getData.conversation) {
			console.log("✅ Get conversation working");
			console.log(`   Message count: ${getData.messageCount}`);
		} else {
			console.log("❌ Get conversation failed:", getData.error);
		}

		// Test clearing conversation
		const clearResponse = await fetch(`${API_BASE}/api/conversation`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ action: "clear" }),
		});

		const clearData = await clearResponse.json();

		if (clearData.message === "Conversation cleared successfully") {
			console.log("✅ Clear conversation working");
		} else {
			console.log("❌ Clear conversation failed:", clearData.error);
		}
	} catch (error) {
		console.log("❌ Conversation endpoint error:", error.message);
	}
}

async function runTests() {
	console.log("🚀 Starting unified API tests...\n");

	await testHealthEndpoint();
	console.log("");

	await testChatEndpoint();
	console.log("");

	await testConversationEndpoint();
	console.log("");

	console.log("✨ Tests completed!");
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === "undefined") {
	console.log("❌ This script requires Node.js 18+ or a fetch polyfill");
	process.exit(1);
}

runTests().catch(console.error);
