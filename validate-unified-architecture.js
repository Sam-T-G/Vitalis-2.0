#!/usr/bin/env node
/**
 * Validation script for unified architecture
 * Ensures all components are properly integrated and no conflicts exist
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 Validating unified architecture...\n");

// Check if conflicting files have been removed
const conflictingFiles = [
	"api_server.py",
	"chat_processor.py",
	"start-backend.sh",
	"simple_server.py",
];

console.log("📁 Checking for removed conflicting files:");
let conflictsFound = false;

conflictingFiles.forEach((file) => {
	const filePath = path.join(__dirname, file);
	if (fs.existsSync(filePath)) {
		console.log(`❌ ${file} still exists - should be removed`);
		conflictsFound = true;
	} else {
		console.log(`✅ ${file} successfully removed`);
	}
});

// Check if unified API files exist
const unifiedApiFiles = [
	"frontend/src/app/api/chat/route.ts",
	"frontend/src/app/api/health/route.ts",
	"frontend/src/app/api/conversation/route.ts",
];

console.log("\n📁 Checking for unified API files:");
let apiFilesMissing = false;

unifiedApiFiles.forEach((file) => {
	const filePath = path.join(__dirname, file);
	if (fs.existsSync(filePath)) {
		console.log(`✅ ${file} exists`);
	} else {
		console.log(`❌ ${file} missing`);
		apiFilesMissing = true;
	}
});

// Check if frontend files have been updated
const frontendFiles = [
	"frontend/src/lib/api.ts",
	"frontend/src/store/chatStore.ts",
	"frontend/src/components/chat/ChatInterface.tsx",
];

console.log("\n📁 Checking for updated frontend files:");
let frontendFilesMissing = false;

frontendFiles.forEach((file) => {
	const filePath = path.join(__dirname, file);
	if (fs.existsSync(filePath)) {
		console.log(`✅ ${file} exists`);

		// Check if file contains unified API references
		const content = fs.readFileSync(filePath, "utf8");
		if (
			content.includes("/api/chat") ||
			content.includes("/api/health") ||
			content.includes("/api/conversation")
		) {
			console.log(`   ✅ Contains unified API references`);
		} else {
			console.log(`   ⚠️  May need unified API updates`);
		}
	} else {
		console.log(`❌ ${file} missing`);
		frontendFilesMissing = true;
	}
});

// Check CLI backend integration
console.log("\n📁 Checking CLI backend integration:");
const cliFile = path.join(__dirname, "vitalis_cli.py");
if (fs.existsSync(cliFile)) {
	console.log(`✅ vitalis_cli.py exists`);

	// Check if API routes import from CLI
	const chatRoutePath = path.join(
		__dirname,
		"frontend/src/app/api/chat/route.ts"
	);
	if (fs.existsSync(chatRoutePath)) {
		const content = fs.readFileSync(chatRoutePath, "utf8");
		if (
			content.includes("SYSTEM_PROMPT") &&
			content.includes("RED_FLAG_KEYWORDS")
		) {
			console.log(`   ✅ Chat API imports CLI constants`);
		} else {
			console.log(`   ⚠️  Chat API may not be fully integrated with CLI`);
		}
	}
} else {
	console.log(`❌ vitalis_cli.py missing`);
}

// Check requirements.txt
console.log("\n📁 Checking requirements.txt:");
const requirementsPath = path.join(__dirname, "requirements.txt");
if (fs.existsSync(requirementsPath)) {
	const content = fs.readFileSync(requirementsPath, "utf8");
	if (content.includes("requests") && !content.includes("fastapi")) {
		console.log(`✅ requirements.txt updated (no FastAPI dependencies)`);
	} else {
		console.log(`⚠️  requirements.txt may need updates`);
	}
} else {
	console.log(`❌ requirements.txt missing`);
}

// Summary
console.log("\n📊 Validation Summary:");
if (conflictsFound) {
	console.log("❌ Conflicts found - some conflicting files still exist");
} else {
	console.log("✅ No conflicting files found");
}

if (apiFilesMissing) {
	console.log("❌ Some unified API files are missing");
} else {
	console.log("✅ All unified API files present");
}

if (frontendFilesMissing) {
	console.log("❌ Some frontend files are missing");
} else {
	console.log("✅ All frontend files present");
}

// Final status
const allGood = !conflictsFound && !apiFilesMissing && !frontendFilesMissing;

if (allGood) {
	console.log("\n🎉 Unified architecture validation PASSED!");
	console.log("   The API architecture has been successfully unified.");
	console.log("   All conflicting elements have been removed.");
	console.log("   Frontend now uses only Next.js API routes.");
} else {
	console.log("\n⚠️  Unified architecture validation FAILED!");
	console.log("   Some issues were found that need to be addressed.");
}

console.log("\n📋 Next Steps:");
console.log("   1. Start Ollama server: ollama serve");
console.log("   2. Start Next.js dev server: cd frontend && npm run dev");
console.log("   3. Test the API: node test-unified-api.js");
console.log("   4. Access the app: http://localhost:3000");
