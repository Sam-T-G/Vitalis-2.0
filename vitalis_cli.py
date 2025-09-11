#!/usr/bin/env python3
"""
Vitalis CLI - A terminal chat application for medical-aid assistance
Communicates with local Ollama server running gpt-oss-20b
"""

import os
import re
import json
import sys
import requests
import argparse
from urllib.parse import urlparse

# Constants
DEFAULT_BASE_URL = "http://localhost:11434"
DEFAULT_MODEL = "gpt-oss:20b"
DEFAULT_TEMP = 0.2

SYSTEM_PROMPT = (
    "You are \"Vitalis,\" a calm, non-clinical Emergency Preparedness & First-Aid Helper. "
    "You provide general safety, scene assessment, and basic first-aid concepts based on "
    "widely accepted emergency care practices. Your guidance should be actionable for the user, "
    "whether for self-care or assisting another person.\n\n"
    "Ground rules:\n"
    "- For ALL emergencies (including life-threatening ones), provide immediate action steps while "
    "emphasizing the need to call emergency services. Don't just say \"call 911\" - give specific "
    "steps they can take while waiting for help.\n"
    "- For life-threatening emergencies (unconscious/unresponsive, not breathing or gasping, severe bleeding, "
    "chest pain/pressure, stroke signs (FAST), anaphylaxis, seizure >5 min or repeated seizures, "
    "major trauma/spinal injury, severe burns, serious pregnancy complications, suspected overdose/poisoning, "
    "gas leak, fire, downed power lines), provide immediate steps AND call emergency services.\n"
    "- For non-life-threatening emergencies, provide basic first-aid steps using common, verifiable practices:\n"
    "  * Broken bones: immobilize, apply ice, elevate if possible, don't move the person\n"
    "  * Cuts/wounds: apply direct pressure, clean if possible, cover with clean cloth\n"
    "  * Burns: cool with water, remove jewelry, don't pop blisters\n"
    "  * Sprains: RICE (Rest, Ice, Compression, Elevation)\n"
    "  * Choking: encourage coughing, back blows if needed\n"
    "- Never provide diagnosis, medication dosing, or invasive procedures. Refuse and redirect safely.\n"
    "- Style: Provide brief, numbered steps in plain language. Start with the most time-critical action. "
    "Tailor instructions dynamically based on the patient's immediate condition (e.g., if they're conscious/unconscious, "
    "breathing/not breathing) to provide only the most relevant steps. Avoid generic conditional headers if the "
    "condition is known. End with a short recap and when to escalate.\n"
    "- After providing initial critical steps, ask up to 3 brief clarifying questions (e.g., location, hazards, "
    "available supplies, patient's current state like conscious/breathing).\n"
    "- Always include: \"I'm not a medical professional\" disclaimer.\n\n"
    "Your purpose is to reduce risk and help users act safely until professionals arrive."
)

RED_FLAG_KEYWORDS = [
    "not breathing", "isn't breathing", "no pulse", "gasping", "unresponsive", "severe bleeding", "spurting",
    "chest pain", "pressure in chest", "stroke", "face droop", "arm weakness", "slurred speech",
    "anaphylaxis", "epipen", "seizure", "overdose", "poisoned", "gas leak", "smell of gas",
    "fire", "smoke inhalation", "downed power line", "electric shock", "head injury",
    "spinal injury", "fell from", "gunshot", "stab wound", "suicidal", "self-harm"
]

BLOCKED_PATTERNS = [
    r"\b\d+(\.\d+)?\s?(mg|mcg|mL|units)\b",
    r"diagnose|prescribe|dose|suture|defibrillat|intubate"
]

ESCALATION_MESSAGE = (
    "🚨 CALL EMERGENCY SERVICES NOW (e.g., 911)\n\n"
    "1. Apply direct pressure to any bleeding\n"
    "2. Place the person in the recovery position if unconscious\n"
    "3. Ensure the area is safe from hazards\n\n"
    "⚠️ I'm not a medical professional - seek immediate professional help."
)

def triage(user_text):
    """Detect red-flag emergencies; if triggered, return escalation message."""
    user_text_lower = user_text.lower()
    for keyword in RED_FLAG_KEYWORDS:
        # Check if keyword is contained in the text (case-insensitive)
        # This catches contractions like "isn't breathing" for "not breathing"
        if keyword in user_text_lower:
            return ESCALATION_MESSAGE
    return None

def post_filter(assistant_text):
    """Redact medication dosages/invasive procedures; replace with safe refusal text."""
    filtered_text = assistant_text
    for pattern in BLOCKED_PATTERNS:
        filtered_text = re.sub(
            pattern, 
            "[REDACTED: I'm not a medical professional. Please seek professional help.]", 
            filtered_text, 
            flags=re.IGNORECASE
        )
    return filtered_text

def validate_base_url(base_url):
    """Ensure the base URL is strictly localhost:11434."""
    parsed_url = urlparse(base_url)
    if (parsed_url.scheme != "http" or 
        parsed_url.hostname not in ["localhost", "127.0.0.1"] or 
        parsed_url.port != 11434):
        print("❌ Error: Base URL must be exactly http://localhost:11434 or http://127.0.0.1:11434")
        print("   This application is designed for offline, local use only.")
        sys.exit(1)

def check_ollama_status(base_url, model):
    """Check if Ollama is running and the specified model is available."""
    try:
        print(f"🔍 Checking Ollama server at {base_url}...")
        response = requests.get(f"{base_url}/api/tags", timeout=5)
        response.raise_for_status()
        
        available_models = [model['name'] for model in response.json().get('models', [])]
        if model not in available_models:
            print(f"❌ Model '{model}' not found in available models:")
            for m in available_models:
                print(f"   - {m}")
            print(f"\n💡 Please run: ollama pull {model}")
            sys.exit(1)
        
        print(f"✅ Ollama server is running")
        print(f"✅ Model '{model}' is available")
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Ollama server")
        print("💡 Please ensure Ollama is running: ollama serve")
        sys.exit(1)
    except requests.exceptions.Timeout:
        print("❌ Ollama server is not responding")
        print("💡 Please check if Ollama is running: ollama serve")
        sys.exit(1)
    except requests.RequestException as e:
        print(f"❌ Error checking Ollama status: {e}")
        sys.exit(1)

def stream_chat(base_url, model, messages, temperature):
    """Stream chat responses from the model."""
    payload = {
        "model": model,
        "messages": messages,
        "stream": True,
        "options": {"temperature": temperature}
    }
    
    try:
        print("Vitalis: ", end="", flush=True)
        with requests.post(f"{base_url}/api/chat", json=payload, stream=True, timeout=30) as response:
            response.raise_for_status()
            
            full_response = ""
            for line in response.iter_lines():
                if line:
                    try:
                        data = json.loads(line.decode('utf-8'))
                        if 'message' in data and 'content' in data['message']:
                            content = data['message']['content']
                            print(content, end='', flush=True)
                            full_response += content
                        if data.get('done', False):
                            print()  # New line when done
                            break
                    except json.JSONDecodeError:
                        continue
                        
            return full_response
            
    except requests.exceptions.Timeout:
        print("\n❌ Request timed out. The model may be taking too long to respond.")
        return ""
    except requests.RequestException as e:
        print(f"\n❌ Error during chat streaming: {e}")
        return ""

def save_transcript(messages, filepath):
    """Save conversation transcript to JSON file."""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(messages, f, indent=2, ensure_ascii=False)
        print(f"✅ Transcript saved to {filepath}")
    except Exception as e:
        print(f"❌ Error saving transcript: {e}")

def print_banner(model, base_url):
    """Print application banner."""
    print("=" * 60)
    print("🏥 VITALIS CLI - Emergency Preparedness & First-Aid Helper")
    print("=" * 60)
    print(f"Model: {model}")
    print(f"Server: {base_url}")
    print("=" * 60)
    print("⚠️  DISCLAIMER: This is NOT a medical diagnostic tool.")
    print("   Always seek professional medical help for emergencies.")
    print("=" * 60)
    print()

def print_help():
    """Print available commands."""
    print("\n📋 Available Commands:")
    print("  /new          - Start a new conversation")
    print("  /save <path>  - Save transcript to JSON file")
    print("  /model <name> - Switch to different model")
    print("  /help         - Show this help message")
    print("  /quit         - Exit the application")
    print()

def main():
    # Parse command-line arguments
    parser = argparse.ArgumentParser(
        description="Vitalis CLI: A terminal chat app for medical-aid assistance",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python vitalis_cli.py
  python vitalis_cli.py --model llama2:7b --temp 0.5
  python vitalis_cli.py --base-url http://127.0.0.1:11434
        """
    )
    parser.add_argument(
        "--base-url", 
        default=os.getenv("OLLAMA_BASE_URL", DEFAULT_BASE_URL),
        help=f"Base URL of the Ollama server (default: {DEFAULT_BASE_URL})"
    )
    parser.add_argument(
        "--model", 
        default=os.getenv("OLLAMA_MODEL", DEFAULT_MODEL),
        help=f"Model to use (default: {DEFAULT_MODEL})"
    )
    parser.add_argument(
        "--temp", 
        type=float, 
        default=float(os.getenv("OLLAMA_TEMP", DEFAULT_TEMP)),
        help=f"Temperature setting for the model (default: {DEFAULT_TEMP})"
    )
    
    args = parser.parse_args()

    # Validate base URL
    validate_base_url(args.base_url)

    # Check Ollama status and model availability
    check_ollama_status(args.base_url, args.model)

    # Initialize conversation
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # Print banner
    print_banner(args.model, args.base_url)
    
    print("💬 Type your message or use commands. Type '/help' for available commands.")
    print()

    # Main chat loop
    while True:
        try:
            user_input = input("You: ").strip()
            
            if not user_input:
                continue
                
            # Handle commands
            if user_input.lower() == "/quit":
                print("👋 Goodbye! Stay safe!")
                break
                
            elif user_input.lower() == "/new":
                messages = [{"role": "system", "content": SYSTEM_PROMPT}]
                print("🆕 New conversation started.")
                continue
                
            elif user_input.lower().startswith("/save "):
                parts = user_input.split(maxsplit=1)
                if len(parts) == 2:
                    save_transcript(messages, parts[1])
                else:
                    print("❌ Usage: /save <filepath>")
                continue
                
            elif user_input.lower().startswith("/model "):
                parts = user_input.split(maxsplit=1)
                if len(parts) == 2:
                    new_model = parts[1]
                    print(f"🔄 Switching to model: {new_model}")
                    if check_ollama_status(args.base_url, new_model):
                        args.model = new_model
                        print(f"✅ Switched to model: {args.model}")
                else:
                    print("❌ Usage: /model <model_name>")
                continue
                
            elif user_input.lower() == "/help":
                print_help()
                continue
            
            # Note: We now let the AI handle all scenarios, including emergencies,
            # as the system prompt has been updated to provide appropriate guidance
            
            # Add user message to conversation
            messages.append({"role": "user", "content": user_input})
            
            # Stream response from model
            assistant_response = stream_chat(args.base_url, args.model, messages, args.temp)
            
            if assistant_response:
                # Apply post-filtering
                filtered_response = post_filter(assistant_response)
                
                # Add filtered response to conversation
                messages.append({"role": "assistant", "content": filtered_response})
                
                # Show redaction notice if content was filtered
                if filtered_response != assistant_response:
                    print("\n⚠️  [Note: Some content has been redacted for safety.]")
            else:
                print("❌ No response received from the model.")
                
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye! Stay safe!")
            break
        except EOFError:
            print("\n\n👋 Goodbye! Stay safe!")
            break
        except Exception as e:
            print(f"\n❌ Unexpected error: {e}")
            print("Please try again or restart the application.")

if __name__ == "__main__":
    main()
