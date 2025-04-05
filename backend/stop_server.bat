@echo off
echo Stopping SentinelAI Logging Server...
echo.

REM Find Python processes running server.py
for /f "tokens=2" %%a in ('tasklist /fi "imagename eq python.exe" /v ^| findstr "server.py"') do (
    echo Stopping process with PID: %%a
    taskkill /F /PID %%a
)

echo.
echo Server stopped.
echo.
echo Press any key to close this window...
pause > nul 