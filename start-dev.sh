#!/bin/bash

# Vitalis Development Server Launcher
# This script starts both the frontend (Next.js) and backend (FastAPI) servers

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to kill processes on specific ports
kill_port() {
    if port_in_use $1; then
        print_warning "Port $1 is already in use. Attempting to free it..."
        lsof -ti :$1 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to start backend server
start_backend() {
    print_status "Starting Vitalis API Server (Backend)..."
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        print_error "Virtual environment not found. Please run setup first."
        exit 1
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Check if required packages are installed
    if ! python -c "import fastapi, uvicorn" 2>/dev/null; then
        print_warning "Installing required Python packages..."
        pip install fastapi uvicorn python-multipart
    fi
    
    # Kill any existing process on port 8000
    kill_port 8000
    
    # Start the API server
    print_success "Starting API server on http://localhost:8000"
    python api_server.py &
    BACKEND_PID=$!
    echo $BACKEND_PID > .backend.pid
    
    # Wait a moment for the server to start
    sleep 3
    
    # Check if backend started successfully
    if curl -s http://localhost:8000/api/health >/dev/null 2>&1; then
        print_success "Backend server started successfully!"
    else
        print_error "Backend server failed to start"
        exit 1
    fi
}

# Function to start frontend server
start_frontend() {
    print_status "Starting Vitalis Frontend (Next.js)..."
    
    # Check if frontend directory exists
    if [ ! -d "frontend" ]; then
        print_error "Frontend directory not found. Please run setup first."
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check if npm is installed
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Navigate to frontend directory
    cd frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_warning "Installing frontend dependencies..."
        npm install
    fi
    
    # Kill any existing process on port 3000
    kill_port 3000
    
    # Start the frontend server
    print_success "Starting frontend server on http://localhost:3000"
    npm run dev &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../.frontend.pid
    
    # Go back to root directory
    cd ..
    
    # Wait a moment for the server to start
    sleep 5
    
    # Check if frontend started successfully
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        print_success "Frontend server started successfully!"
    else
        print_warning "Frontend server may still be starting..."
    fi
}

# Function to cleanup on exit
cleanup() {
    print_status "Shutting down servers..."
    
    # Kill backend server
    if [ -f ".backend.pid" ]; then
        BACKEND_PID=$(cat .backend.pid)
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill $BACKEND_PID
            print_success "Backend server stopped"
        fi
        rm -f .backend.pid
    fi
    
    # Kill frontend server
    if [ -f ".frontend.pid" ]; then
        FRONTEND_PID=$(cat .frontend.pid)
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID
            print_success "Frontend server stopped"
        fi
        rm -f .frontend.pid
    fi
    
    # Kill any remaining processes on our ports
    kill_port 8000
    kill_port 3000
    
    print_success "Cleanup complete"
    exit 0
}

# Set up signal handlers for cleanup
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    print_status "🚀 Starting Vitalis Development Environment"
    print_status "=============================================="
    
    # Check if we're in the right directory
    if [ ! -f "vitalis_cli.py" ] || [ ! -d "frontend" ]; then
        print_error "Please run this script from the Vitalis project root directory"
        exit 1
    fi
    
    # Start backend first
    start_backend
    
    # Start frontend
    start_frontend
    
    print_success "🎉 Both servers are running!"
    print_status "=============================================="
    print_status "Frontend: http://localhost:3000"
    print_status "Backend API: http://localhost:8000"
    print_status "API Docs: http://localhost:8000/docs"
    print_status "=============================================="
    print_status "Press Ctrl+C to stop both servers"
    
    # Wait for user to stop
    wait
}

# Run main function
main "$@"
