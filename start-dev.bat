@echo off
REM Vitalis Development Server Launcher for Windows
REM This script starts both the frontend (Next.js) and backend (FastAPI) servers

setlocal enabledelayedexpansion

echo [INFO] Starting Vitalis Development Environment
echo ==============================================

REM Check if we're in the right directory
if not exist "vitalis_cli.py" (
    echo [ERROR] Please run this script from the Vitalis project root directory
    pause
    exit /b 1
)

if not exist "frontend" (
    echo [ERROR] Frontend directory not found. Please run setup first.
    pause
    exit /b 1
)

REM Function to check if a port is in use
:check_port
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%1') do (
    if not "%%a"=="" (
        echo [WARNING] Port %1 is already in use. Attempting to free it...
        taskkill /F /PID %%a >nul 2>&1
        timeout /t 2 >nul
    )
)
goto :eof

REM Start backend server
echo [INFO] Starting Vitalis API Server (Backend)...

REM Check if virtual environment exists
if not exist "venv" (
    echo [ERROR] Virtual environment not found. Please run setup first.
    pause
    exit /b 1
)

REM Activate virtual environment and start backend
call venv\Scripts\activate.bat

REM Check if required packages are installed
python -c "import fastapi, uvicorn" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Installing required Python packages...
    pip install fastapi uvicorn python-multipart
)

REM Kill any existing process on port 8000
call :check_port 8000

REM Start the API server in a new window
echo [SUCCESS] Starting API server on http://localhost:8000
start "Vitalis Backend" cmd /k "venv\Scripts\activate.bat && python api_server.py"

REM Wait for backend to start
timeout /t 5 >nul

REM Start frontend server
echo [INFO] Starting Vitalis Frontend (Next.js)...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Navigate to frontend directory
cd frontend

REM Check if node_modules exists
if not exist "node_modules" (
    echo [WARNING] Installing frontend dependencies...
    npm install
)

REM Kill any existing process on port 3000
call :check_port 3000

REM Start the frontend server in a new window
echo [SUCCESS] Starting frontend server on http://localhost:3000
start "Vitalis Frontend" cmd /k "npm run dev"

REM Go back to root directory
cd ..

echo [SUCCESS] Both servers are starting!
echo ==============================================
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo ==============================================
echo Both servers are running in separate windows.
echo Close the windows to stop the servers.
echo.
pause
