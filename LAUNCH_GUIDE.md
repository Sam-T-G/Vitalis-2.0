# 🚀 Vitalis Launch Guide

This guide provides multiple ways to launch both the frontend and AI backend simultaneously for development.

## 🎯 Quick Start

### Option 1: Cross-Platform npm Script (Recommended)

```bash
npm run dev
```

### Option 2: Shell Script (macOS/Linux)

```bash
./start-dev.sh
```

### Option 3: Windows Batch Script

```batch
start-dev.bat
```

## 📋 What Gets Started

When you run any of the above commands, you'll get:

- **Frontend**: Next.js development server at http://localhost:3000
- **Backend**: FastAPI server at http://localhost:8000
- **API Docs**: Interactive API documentation at http://localhost:8000/docs

## 🔧 Prerequisites

Before launching, ensure you have:

1. **Ollama installed and running** with the `gpt-oss:20b` model
2. **Node.js 20.10+** and **npm 10.0+**
3. **Python 3.9+** with virtual environment set up
4. **All dependencies installed** (run `npm run install:all` if needed)

## 🧪 Test Your Setup

Run the test script to verify everything is working:

```bash
python test-setup.py
```

This will check:

- ✅ All Python dependencies are installed
- ✅ Ollama connection is working
- ✅ Frontend dependencies are installed
- ✅ API server can be imported

## 📁 Project Structure

```
Vitalis-2.0/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── lib/            # Utilities and animations
│   │   ├── store/          # Zustand state management
│   │   └── types/          # TypeScript types
│   └── package.json
├── api_server.py            # FastAPI backend server
├── vitalis_cli.py          # Original CLI application
├── start-dev.sh            # Shell script launcher
├── start-dev.bat           # Windows batch launcher
├── test-setup.py           # Setup verification script
├── package.json            # Root package.json with scripts
└── DEVELOPMENT.md          # Detailed development guide
```

## 🔄 Development Workflow

1. **Start both servers**: `npm run dev`
2. **Open browser**: Navigate to http://localhost:3000
3. **Make changes**: Both frontend and backend support hot reload
4. **Test API**: Use http://localhost:8000/docs for API testing
5. **Stop servers**: Press `Ctrl+C` in the terminal

## 🛠️ Available Scripts

### Root Level Scripts

- `npm run dev` - Start both frontend and backend
- `npm run dev:backend` - Start only the backend API server
- `npm run dev:frontend` - Start only the frontend development server
- `npm run install:all` - Install all dependencies (root + frontend)
- `npm run build` - Build the frontend for production

### Frontend Scripts (in frontend/ directory)

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 API Endpoints

The backend provides these REST API endpoints:

- `GET /api/health` - Health check
- `POST /api/chat` - Send message to AI assistant
- `POST /api/clear` - Clear conversation history
- `GET /api/conversation` - Get conversation history

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill processes on ports 3000 and 8000
lsof -ti :3000 | xargs kill -9
lsof -ti :8000 | xargs kill -9
```

### Ollama Not Running

```bash
# Start Ollama server
ollama serve

# Check if model is available
ollama list

# Pull model if needed
ollama pull gpt-oss:20b
```

### Dependencies Missing

```bash
# Install Python dependencies
source venv/bin/activate
pip install fastapi uvicorn python-multipart

# Install Node.js dependencies
npm run install:all
```

## 🎨 Features

The application includes:

- **Modern Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **Smooth Animations**: Framer Motion with physics-based animations
- **UI Components**: shadcn/ui with Radix primitives
- **State Management**: Zustand with persistence
- **Real-time Chat**: WebSocket-ready architecture
- **Emergency Detection**: AI-powered emergency keyword detection
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliance

## 📚 Additional Resources

- [DEVELOPMENT.md](./DEVELOPMENT.md) - Detailed development guide
- [Frontend Implementation Guide](./FRONTEND_IMPLEMENTATION_GUIDE.md) - Frontend architecture
- [Project Summary](./PROJECT_SUMMARY.md) - Project overview

## 🆘 Support

If you encounter issues:

1. Run `python test-setup.py` to diagnose problems
2. Check the console output for error messages
3. Verify all prerequisites are installed
4. Ensure Ollama is running and accessible
5. Check that ports 3000 and 8000 are available

---

**Happy coding! 🎉**
