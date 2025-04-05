#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import json
import socket
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import uvicorn

# Log file path
LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sentinelai.log')

# Ensure log file exists
if not os.path.exists(LOG_FILE):
    with open(LOG_FILE, 'w') as f:
        f.write('')

app = FastAPI(
    title="SentinelAI Logging Server",
    description="API for logging security warnings and threats detected by SentinelAI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LogEntry(BaseModel):
    logText: str
    filePath: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "logText": "[2024-01-01T12:00:00] HIGH: Security warning detected",
                "filePath": "backend/sentinelai.log"
            }
        }

class LogBatch(BaseModel):
    logs: str
    filePath: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "logs": "[2024-01-01T12:00:00] HIGH: Multiple security warnings\n[2024-01-01T12:01:00] MEDIUM: Another warning",
                "filePath": "backend/sentinelai.log"
            }
        }

@app.get("/api/log", 
    summary="Get all logs",
    description="Retrieves all security warning logs from the log file",
    response_description="Returns all logs in the file",
    tags=["Logs"])
async def get_logs():
    try:
        with open(LOG_FILE, 'r') as f:
            logs = f.read()
        return JSONResponse(content={"success": True, "logs": logs})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/log",
    summary="Add a single log entry",
    description="Adds a single security warning log entry to the log file",
    response_description="Returns success message if log was added",
    tags=["Logs"])
async def add_log(log_entry: LogEntry):
    try:
        if not log_entry.logText:
            raise HTTPException(status_code=400, detail="Log text is required")
        
        # Append to log file
        with open(LOG_FILE, 'a') as f:
            f.write(log_entry.logText)
        
        return JSONResponse(content={"success": True, "message": "Log entry added successfully"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/log-batch",
    summary="Add multiple log entries",
    description="Adds multiple security warning log entries to the log file",
    response_description="Returns success message if logs were added",
    tags=["Logs"])
async def add_log_batch(log_batch: LogBatch):
    try:
        if not log_batch.logs:
            raise HTTPException(status_code=400, detail="Logs are required")
        
        # Append to log file
        with open(LOG_FILE, 'a') as f:
            f.write(log_batch.logs)
        
        return JSONResponse(content={"success": True, "message": "Log entries added successfully"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def find_available_port(start_port=5001, max_port=5010):
    """Find an available port in the given range."""
    for port in range(start_port, max_port + 1):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('', port))
                return port
        except OSError:
            continue
    raise RuntimeError("No available ports found in the specified range")

if __name__ == "__main__":
    try:
        port = find_available_port()
        print(f"SentinelAI logging server running on http://localhost:{port}")
        print(f"Log file: {LOG_FILE}")
        print("Press Ctrl+C to stop the server")
        print("API documentation available at:")
        print(f"  - Swagger UI: http://localhost:{port}/docs")
        print(f"  - ReDoc: http://localhost:{port}/redoc")
        uvicorn.run(app, host="0.0.0.0", port=port)
    except Exception as e:
        print(f"Error starting server: {e}")
        print("Please make sure no other services are using the ports in range 5001-5010")
        print("You can check for processes using these ports with: netstat -ano | findstr :5001") 