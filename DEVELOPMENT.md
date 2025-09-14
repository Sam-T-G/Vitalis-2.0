# Vitalis Development Guide

This guide explains how to run the Vitalis application in development mode with both the frontend and backend servers.

## Prerequisites

Before running the development servers, ensure you have:

1. **Node.js 20.10+** and **npm 10.0+** installed
2. **Python 3.9+** installed
3. **Ollama** installed and running with the `gpt-oss:20b` model
4. Virtual environment set up (see setup instructions)

## Quick Start

### Option 1: Cross-Platform npm Script (Recommended)

```bash
# Install all dependencies
npm run install:all

# Start both servers
npm run dev
```

This will start:

- Backend API server on http://localhost:8000
- Frontend development server on http://localhost:3000

### Option 2: Shell Script (macOS/Linux)

```bash
# Make script executable (first time only)
chmod +x start-dev.sh

# Start both servers
./start-dev.sh
```

### Option 3: Batch Script (Windows)

```batch
# Double-click or run from command prompt
start-dev.bat
```

## Manual Setup

If you prefer to run the servers manually:

### Backend Server

```bash
# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (if not already installed)
pip install fastapi uvicorn python-multipart

# Start the API server
python api_server.py
```

The backend will be available at:

- API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/api/health

### Frontend Server

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start the development server
npm run dev
```

The frontend will be available at:

- Application: http://localhost:3000

## API Endpoints

The backend provides the following REST API endpoints:

### `GET /api/health`

Health check endpoint that verifies the connection to Ollama.

**Response:**

```json
{
	"status": "healthy",
	"model": "gpt-oss:20b",
	"ollama_url": "http://localhost:11434"
}
```

### `POST /api/chat`

Main chat endpoint for sending messages to the AI assistant.

**Request:**

```json
{
	"message": "I have a severe headache and feel dizzy"
}
```

**Response:**

```json
{
	"message": "I understand you're experiencing a severe headache and dizziness. This could be serious...",
	"isEmergency": true,
	"disclaimer": "⚠️ EMERGENCY ALERT: This appears to be a medical emergency...",
	"metadata": {
		"model": "gpt-oss:20b",
		"processingTime": 1250,
		"tokens": 45
	}
}
```

### `POST /api/clear`

Clear the conversation history.

### `GET /api/conversation`

Get the current conversation history.

## Environment Variables

You can customize the backend behavior using these environment variables:

```bash
# Ollama server configuration
export OLLAMA_BASE_URL="http://localhost:11434"
export OLLAMA_MODEL="gpt-oss:20b"
export OLLAMA_TEMP="0.2"
```

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Kill processes on specific ports
lsof -ti :8000 | xargs kill -9  # Backend port
lsof -ti :3000 | xargs kill -9  # Frontend port
```

### Ollama Connection Issues

1. Ensure Ollama is running: `ollama serve`
2. Check if the model is available: `ollama list`
3. Pull the model if needed: `ollama pull gpt-oss:20b`

### Python Dependencies

If you get import errors:

```bash
# Activate virtual environment
source venv/bin/activate

# Install required packages
pip install fastapi uvicorn python-multipart requests
```

### Node.js Dependencies

If frontend fails to start:

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Development Workflow

1. **Start both servers** using one of the methods above
2. **Open your browser** to http://localhost:3000
3. **Make changes** to the frontend code (hot reload enabled)
4. **Make changes** to the backend code (auto-reload enabled)
5. **Test the API** at http://localhost:8000/docs

## Stopping the Servers

- **npm script**: Press `Ctrl+C` in the terminal
- **Shell script**: Press `Ctrl+C` in the terminal
- **Batch script**: Close the command prompt windows
- **Manual**: Press `Ctrl+C` in each terminal window

## Production Deployment

For production deployment, see the main README.md file for instructions on building and deploying the application.

## Support

If you encounter any issues:

1. Check the console output for error messages
2. Verify all prerequisites are installed
3. Ensure Ollama is running and accessible
4. Check that all required ports (3000, 8000) are available
