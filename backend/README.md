# SentinelAI Backend Server

This is a simple Python-based backend server for the SentinelAI browser extension that handles logging of security warnings and detections.

## Features

- Logs security warnings and detections to a file
- Provides API endpoints for logging and retrieving logs
- Supports batch logging for offline scenarios
- Simple and lightweight

## Setup

### Windows

1. Make sure you have Python installed (Python 3.6 or higher recommended)
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Start the server using the batch file:
   ```
   run_server.bat
   ```
   This will start the server in the background and create a log file at `backend/sentinelai.log`.

4. To stop the server, run:
   ```
   stop_server.bat
   ```

### Manual Start

If the batch files don't work, you can start the server manually:

```
python server.py
```

The server will start on port 5000 and create a log file at `backend/sentinelai.log`.

## API Endpoints

### POST /api/log

Log a single entry to the log file.

Request body:
```json
{
  "logText": "[2023-06-15T12:34:56.789Z] HIGH: Potential security threat detected | URL: https://example.com | Detected Text: suspicious text",
  "filePath": "backend/sentinelai.log"
}
```

Response:
```json
{
  "success": true,
  "message": "Log entry added successfully"
}
```

### POST /api/log-batch

Log multiple entries to the log file (useful for syncing offline logs).

Request body:
```json
{
  "logs": "[2023-06-15T12:34:56.789Z] HIGH: Potential security threat detected | URL: https://example.com | Detected Text: suspicious text\n[2023-06-15T12:35:00.123Z] MEDIUM: Another warning | URL: https://example.com | Detected Text: another text",
  "filePath": "backend/sentinelai.log"
}
```

Response:
```json
{
  "success": true,
  "message": "Log entries added successfully"
}
```

### GET /api/log

Retrieve the contents of the log file.

Response:
```json
{
  "success": true,
  "logs": "[2023-06-15T12:34:56.789Z] HIGH: Potential security threat detected | URL: https://example.com | Detected Text: suspicious text\n[2023-06-15T12:35:00.123Z] MEDIUM: Another warning | URL: https://example.com | Detected Text: another text"
}
```

## Troubleshooting

- If the server fails to start, make sure Python is installed and in your PATH
- If logs are not being written, check file permissions in the backend directory
- For CORS issues, ensure the extension is making requests to the correct URL
- If you're running the server in the background and want to stop it, use the `stop_server.bat` script
- If you see a KeyboardInterrupt error, it means you manually stopped the server with Ctrl+C, which is normal 