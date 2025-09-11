# Vitalis CLI - Project Summary

## Inspiration

The inspiration for Vitalis CLI came from the need for a reliable, offline-first emergency preparedness and first-aid assistant that could provide immediate guidance during critical situations. In emergency scenarios, internet connectivity may be unreliable, and people need access to basic medical guidance without depending on external services. The project was designed to bridge the gap between having no medical knowledge and waiting for professional help to arrive, providing safe, verifiable first-aid instructions that could potentially save lives.

## What it does

Vitalis CLI is a terminal-based chat application that communicates with a local Ollama server running the `gpt-oss-20b` model. It provides:

- **Real-time streaming responses** for immediate guidance during emergencies
- **Intelligent safety filtering** that blocks dangerous medical procedures while allowing safe first-aid instructions
- **Emergency detection** that prioritizes life-threatening situations
- **Offline operation** ensuring reliability when internet access is unavailable
- **Dynamic response tailoring** based on patient condition (conscious/unconscious, breathing/not breathing)
- **Session management** with conversation history, model switching, and transcript saving
- **Comprehensive first-aid guidance** for common emergencies like broken bones, burns, cuts, and more

The application serves as a non-diagnostic medical assistant that helps users take appropriate action while waiting for professional medical help.

## How we built it

Vitalis CLI was built using a modern Python architecture with the following key components:

**Core Technologies:**

- **Python 3.10+** with standard library and `requests` for HTTP communication
- **Ollama API** for local LLM inference with `gpt-oss-20b` model
- **Real-time streaming** using HTTP chunked responses for token-by-token output
- **JSON-based conversation management** for session persistence

**Safety Architecture:**

- **Triage system** with 30+ red-flag keyword detection for life-threatening emergencies
- **Content filtering** using regex patterns to block medication dosages and invasive procedures
- **Offline validation** ensuring connections only to localhost:11434
- **Model availability checking** with graceful error handling

**User Experience:**

- **Command-line interface** with intuitive commands (`/new`, `/save`, `/model`, `/help`, `/quit`)
- **Emoji-enhanced output** for better visual communication
- **Comprehensive error handling** with helpful troubleshooting messages
- **Virtual environment setup** for dependency isolation

## Challenges we ran into

**1. API Response Format Changes**

- The Ollama API response format changed from `tags` to `models` array, requiring code updates
- **Solution:** Implemented robust error handling and API response validation

**2. Safety vs. Helpfulness Balance**

- Initially, the system was too restrictive, blocking all emergency guidance
- **Solution:** Redesigned the system prompt to provide specific guidance while maintaining safety boundaries

**3. Dynamic Response Tailoring**

- The AI was using generic conditional headers like "if you're conscious and breathing" even when the condition was known
- **Solution:** Updated the system prompt to encourage dynamic, context-aware responses

**4. Emergency Scenario Handling**

- The triage system was intercepting all emergency scenarios with generic messages
- **Solution:** Modified the approach to let the AI handle emergencies with specific, actionable guidance

**5. Contraction Detection**

- Keywords like "isn't breathing" weren't being detected due to apostrophe handling
- **Solution:** Added specific variations to the keyword list and improved pattern matching

## Accomplishments that we're proud of

**1. Complete Offline Operation**

- Successfully created a fully functional medical assistant that works without internet connectivity
- Implemented strict localhost-only validation for security

**2. Intelligent Safety Layer**

- Developed a sophisticated filtering system that blocks dangerous content while allowing helpful guidance
- Created a comprehensive red-flag detection system for life-threatening emergencies

**3. Real-time Streaming Experience**

- Achieved smooth, modern AI chat experience with token-by-token streaming
- Implemented proper error handling for connection issues and timeouts

**4. Comprehensive First-Aid Guidance**

- Successfully trained the AI to provide specific, actionable steps for various emergency scenarios
- Achieved the right balance between safety and helpfulness

**5. Professional Code Quality**

- Created a single-file application with clean, readable code
- Implemented comprehensive error handling and user feedback
- Added proper command-line argument parsing and environment variable support

**6. Dynamic Response System**

- Developed a system that tailors responses based on patient condition
- Moved follow-up questions to the end of responses for better user experience

## What we learned

**1. Safety-First Design is Critical**

- Medical applications require careful balance between helpfulness and safety
- Content filtering and red-flag detection are essential for preventing harm

**2. User Experience Matters in Emergencies**

- Clear, numbered steps are more effective than paragraphs of text
- Real-time streaming provides better user engagement and perceived responsiveness

**3. Offline Capability is Valuable**

- Local LLM inference provides reliability when internet access is unavailable
- Ollama's API design makes it straightforward to implement streaming chat applications

**4. System Prompt Engineering is Powerful**

- Well-crafted system prompts can significantly improve AI behavior
- Dynamic instructions based on context produce more relevant responses

**5. Error Handling is Essential**

- Comprehensive error handling improves user experience and application reliability
- Graceful degradation when services are unavailable maintains user trust

## What's next for Vitalis

**Short-term Improvements:**

- **Enhanced model support** - Add compatibility with more Ollama models
- **Improved safety filtering** - Expand the blocked patterns and red-flag detection
- **Better error messages** - Provide more specific troubleshooting guidance
- **Performance optimization** - Reduce response latency and improve streaming efficiency

**Medium-term Features:**

- **Multi-language support** - Add support for Spanish, French, and other languages
- **Voice interface** - Integrate speech-to-text and text-to-speech capabilities
- **Mobile companion app** - Create a mobile interface for easier access
- **Integration with emergency services** - Add direct calling capabilities to emergency numbers

**Long-term Vision:**

- **Medical professional validation** - Partner with medical professionals to validate and improve guidance
- **Community contributions** - Open-source the project for community improvements
- **Advanced AI models** - Integrate specialized medical AI models as they become available
- **Emergency response integration** - Connect with local emergency services for automatic dispatch

**Research Opportunities:**

- **Effectiveness studies** - Research the impact of AI-assisted first-aid guidance
- **Accessibility improvements** - Make the system more accessible for users with disabilities
- **International adaptation** - Adapt guidance for different countries' emergency protocols
- **Training integration** - Develop training modules for first-aid certification programs

The future of Vitalis lies in becoming a comprehensive emergency preparedness platform that combines AI assistance with verified medical guidance, ultimately helping save lives through better emergency response.
