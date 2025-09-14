# Unified API Architecture - Vitalis Frontend

## Overview

This document describes the unified API architecture that integrates the existing Vitalis CLI backend with a modern Next.js frontend. The architecture eliminates conflicting API pipelines and ensures seamless communication between the frontend and backend.

## Architecture Changes

### ✅ What Was Removed

- **FastAPI server** (`api_server.py`) - Eliminated conflicting API endpoints
- **Chat processor** (`chat_processor.py`) - Removed redundant processing layer
- **Dual API architecture** - Unified to single Next.js API routes
- **Extraneous startup scripts** - Simplified deployment

### ✅ What Was Added

- **Unified Next.js API routes** - Single source of truth for API endpoints
- **Direct CLI integration** - Frontend directly uses CLI backend functions
- **Conversation management** - Server-side conversation state management
- **Health monitoring** - Real-time backend health checks

## API Endpoints

### 1. Chat API (`/api/chat`)

**Purpose**: Main chat interface for sending messages to Vitalis

**Methods**:

- `POST` - Send a message and receive AI response
- `GET` - Health check for chat functionality

**Request Body**:

```json
{
	"message": "string",
	"conversationHistory": [
		{ "role": "user", "content": "..." },
		{ "role": "assistant", "content": "..." }
	]
}
```

**Response**:

```json
{
  "message": "string",
  "isEmergency": boolean,
  "disclaimer": "string (optional)",
  "metadata": {
    "model": "string",
    "processingTime": number,
    "tokens": number
  }
}
```

### 2. Health API (`/api/health`)

**Purpose**: Monitor backend health and Ollama server status

**Methods**:

- `GET` - Check system health

**Response**:

```json
{
	"status": "healthy|unhealthy|error",
	"message": "string",
	"ollama_url": "string",
	"model": "string",
	"timestamp": "string"
}
```

### 3. Conversation API (`/api/conversation`)

**Purpose**: Manage conversation history and state

**Methods**:

- `GET` - Retrieve current conversation
- `POST` - Manage conversation (add messages, clear)

**Request Body (POST)**:

```json
{
	"action": "add|add_assistant|clear",
	"message": "string (for add actions)"
}
```

**Response**:

```json
{
  "conversation": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ],
  "messageCount": number,
  "timestamp": "string"
}
```

## Integration Details

### Backend Integration

The frontend directly integrates with the CLI backend by:

1. **Importing CLI Functions**: Core functions from `vitalis_cli.py` are imported into Next.js API routes
2. **Maintaining Safety Features**: All safety features (triage, filtering, emergency detection) are preserved
3. **Streaming Support**: Real-time streaming from Ollama is maintained
4. **Offline Operation**: Strict localhost-only validation is preserved

### Frontend Integration

The frontend uses the unified API through:

1. **ApiClient Class**: Centralized API communication
2. **Zustand Store**: State management with server synchronization
3. **Real-time Updates**: Health monitoring and connection status
4. **Conversation Persistence**: Server-side conversation management

## Safety Features Preserved

### Emergency Detection

- **Red-flag keyword detection** for life-threatening emergencies
- **Automatic escalation** to emergency services
- **Visual emergency indicators** in the UI

### Content Filtering

- **Medication dosage blocking** using regex patterns
- **Invasive procedure filtering** for safety
- **Post-processing content review** before display

### Medical Disclaimers

- **System-wide disclaimers** about non-medical nature
- **Emergency-specific warnings** for critical situations
- **Professional medical advice reminders**

## Development Workflow

### Starting the Application

1. **Start Ollama Server**:

   ```bash
   ollama serve
   ```

2. **Start Next.js Development Server**:

   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**:
   - Frontend: http://localhost:3000
   - API Health: http://localhost:3000/api/health

### Testing the API

Use the provided test script:

```bash
node test-unified-api.js
```

## Configuration

### Environment Variables

- `OLLAMA_BASE_URL` - Ollama server URL (default: http://localhost:11434)
- `OLLAMA_MODEL` - Model to use (default: gpt-oss:20b)
- `OLLAMA_TEMP` - Temperature setting (default: 0.2)

### API Configuration

All configuration is centralized in the API routes:

- **DEFAULT_BASE_URL**: Ollama server endpoint
- **DEFAULT_MODEL**: AI model configuration
- **SYSTEM_PROMPT**: Medical assistant instructions
- **RED_FLAG_KEYWORDS**: Emergency detection patterns
- **BLOCKED_PATTERNS**: Content filtering rules

## Error Handling

### API Error Responses

All API endpoints return consistent error responses:

```json
{
	"error": "Error description",
	"message": "User-friendly error message",
	"isEmergency": false
}
```

### Frontend Error Handling

- **Connection status monitoring** with visual indicators
- **Graceful degradation** when backend is unavailable
- **User-friendly error messages** for all failure scenarios

## Performance Optimizations

### Streaming Implementation

- **Real-time response streaming** from Ollama
- **Progressive message display** for better UX
- **Connection timeout handling** for reliability

### Caching Strategy

- **In-memory conversation storage** for session persistence
- **Health check caching** to reduce API calls
- **Client-side state management** with Zustand

## Security Considerations

### Data Privacy

- **Local-only processing** - no external API calls
- **Localhost validation** - strict endpoint restrictions
- **No data persistence** beyond session storage

### Input Validation

- **Message sanitization** before processing
- **Content filtering** for medical safety
- **Rate limiting** considerations for production

## Migration Benefits

### Simplified Architecture

- **Single API pipeline** eliminates conflicts
- **Reduced complexity** in deployment and maintenance
- **Unified error handling** across all endpoints

### Improved Performance

- **Direct backend integration** reduces latency
- **Streaming support** maintains CLI responsiveness
- **Optimized data flow** between frontend and backend

### Enhanced Maintainability

- **Centralized configuration** in API routes
- **Consistent error handling** across all endpoints
- **Simplified testing** with unified test suite

## Troubleshooting

### Common Issues

1. **Ollama not responding**: Check if `ollama serve` is running
2. **Model not found**: Verify model is downloaded with `ollama pull gpt-oss:20b`
3. **API errors**: Check Next.js console for detailed error messages
4. **Connection issues**: Verify localhost:11434 is accessible

### Debug Mode

Enable debug logging by setting environment variable:

```bash
DEBUG=vitalis:* npm run dev
```

## Future Enhancements

### Planned Improvements

- **Database integration** for conversation persistence
- **User authentication** for multi-user support
- **Advanced caching** with Redis
- **Metrics collection** for usage analytics

### Scalability Considerations

- **Horizontal scaling** with load balancers
- **Database migration** for production deployment
- **CDN integration** for static assets
- **Monitoring and alerting** for production health

---

_This unified architecture ensures that the frontend maintains all the safety, reliability, and functionality of the original CLI while providing a modern web interface for users._
