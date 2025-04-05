@echo off
echo SentinelAI Logging Server Setup
echo ==============================

REM Check if Python is installed
python --version > nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in your PATH.
    echo.
    echo Please install Python from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    echo.
    echo After installing Python, run this script again.
    echo.
    pause
    exit /b 1
)

echo Python is installed. Starting SentinelAI server...

REM Create a log file for the server output
set LOG_FILE=server_output.log

REM Start the server in the background
start /min cmd /c "python server.py > %LOG_FILE% 2>&1"

echo Server started in the background.
echo.
echo The server is running on port 443.
echo Log file: backend\sentinelai.log
echo Server output: %LOG_FILE%
echo.
echo To stop the server, run stop_server.bat
echo.
echo Press any key to close this window...
pause > nul 