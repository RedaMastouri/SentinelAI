import json
import re
import logging
import mimetypes
import os
from datetime import datetime
from typing import List, Dict, Optional, Union
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='sentinelai.log'
)
logger = logging.getLogger('SentinelAI')

# Define Pydantic models for request/response
class TextAnalysisRequest(BaseModel):
    text: str

class Threat(BaseModel):
    type: str
    pattern: str
    severity: str

class AnalysisResponse(BaseModel):
    threats: List[Threat]
    risk_level: str
    timestamp: str
    file_type: Optional[str] = None

class SecurityAnalyzer:
    def __init__(self):
        self.suspicious_patterns = {
            'jailbreak': [
                r'ignore previous instructions',
                r'you are now free',
                r'pretend you are',
                r'bypass',
                r'hack',
                r'exploit',
                r'override',
                r'disregard',
                r'ignore rules',
                r'break free',
                r'escape',
                r'circumvent',
                r'disable',
                r'remove restrictions'
            ],
            'data_poisoning': [
                r'<script>',
                r'javascript:',
                r'eval\(',
                r'document\.',
                r'localStorage',
                r'sessionStorage',
                r'fetch\(',
                r'XMLHttpRequest',
                r'WebSocket',
                r'postMessage',
                r'importScripts',
                r'require\(',
                r'import\(',
                r'new Function'
            ],
            'sensitive_data': [
                r'\b\d{16}\b',  # Credit card numbers
                r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # Email addresses
                r'\b\d{3}-\d{2}-\d{4}\b',  # SSN
                r'password|secret|token|key|api[_-]?key|access[_-]?token|auth[_-]?token',
                r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b',  # IP addresses
                r'\b[A-Za-z0-9+/]{32,}\b',  # Potential hashes
                r'private|confidential|restricted|internal'
            ],
            'malware': [
                r'cmd\.exe|powershell\.exe|wscript\.exe|cscript\.exe',
                r'netcat|nc|ncat|telnet',
                r'curl|wget|ftp',
                r'chmod|chown|sudo|su',
                r'rm -rf|del /f|format',
                r'registry|regedit|regsvr32',
                r'shell_exec|system\(|exec\(|popen\(',
                r'base64_decode|base64_encode',
                r'gzinflate|gzuncompress|gzdecode',
                r'str_rot13|strrev|strtr'
            ],
            'file_operations': [
                r'FileUpload|FileDownload|FileSystem',
                r'readFile|writeFile|deleteFile',
                r'fs\.read|fs\.write|fs\.delete',
                r'path\.join|path\.resolve',
                r'directory|folder|path',
                r'upload|download|save|load'
            ]
        }
        
        self.compiled_patterns = {
            category: [re.compile(pattern, re.IGNORECASE) for pattern in patterns]
            for category, patterns in self.suspicious_patterns.items()
        }

        # Define allowed file types and their extensions
        self.allowed_file_types = {
            'application/pdf': ['pdf'],
            'image/jpeg': ['jpg', 'jpeg'],
            'image/png': ['png'],
            'image/gif': ['gif'],
            'text/markdown': ['md', 'markdown'],
            'text/plain': ['txt', 'text'],
            'text/html': ['html', 'htm'],
            'application/json': ['json'],
            'application/xml': ['xml'],
            'text/csv': ['csv'],
            'application/msword': ['doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
            'application/vnd.ms-excel': ['xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
            'application/vnd.ms-powerpoint': ['ppt'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx']
        }

        # Initialize mimetypes
        mimetypes.init()

    def analyze_text(self, text: str) -> AnalysisResponse:
        results = {
            'threats': [],
            'risk_level': 'low',
            'timestamp': datetime.now().isoformat(),
            'file_type': None
        }

        # Check for suspicious patterns
        for category, patterns in self.compiled_patterns.items():
            for pattern in patterns:
                matches = pattern.finditer(text)
                for match in matches:
                    results['threats'].append({
                        'type': category,
                        'pattern': match.group(),
                        'severity': self._get_severity(category)
                    })

        # Update risk level based on threats
        if any(t['severity'] == 'high' for t in results['threats']):
            results['risk_level'] = 'high'
        elif results['threats']:
            results['risk_level'] = 'medium'

        return AnalysisResponse(**results)

    def analyze_file(self, file_content: bytes, filename: str) -> AnalysisResponse:
        results = {
            'threats': [],
            'risk_level': 'low',
            'timestamp': datetime.now().isoformat(),
            'file_type': None
        }

        try:
            # Get file extension
            _, ext = os.path.splitext(filename)
            ext = ext.lower().lstrip('.')
            
            # Get MIME type
            mime_type, _ = mimetypes.guess_type(filename)
            if not mime_type:
                mime_type = 'application/octet-stream'
            
            # Find file type from allowed types
            file_type = None
            for mime, extensions in self.allowed_file_types.items():
                if mime == mime_type or ext in extensions:
                    file_type = mime
                    break
            
            results['file_type'] = file_type or 'Unknown'

            # Check if file type is allowed
            if not file_type:
                results['threats'].append({
                    'type': 'file_type',
                    'pattern': f'Unsupported file type: {mime_type}',
                    'severity': 'high'
                })
                results['risk_level'] = 'high'
                return AnalysisResponse(**results)

            # Try to decode as text for text-based files
            if mime_type.startswith('text/') or mime_type in ['application/json', 'application/xml']:
                try:
                    text_content = file_content.decode('utf-8', errors='ignore')
                    text_results = self.analyze_text(text_content)
                    results['threats'].extend(text_results.threats)
                except Exception as e:
                    logger.error(f"Error analyzing text content: {e}")

            # Check file size
            file_size = len(file_content)
            if file_size > 10 * 1024 * 1024:  # 10MB limit
                results['threats'].append({
                    'type': 'file_size',
                    'pattern': f'File size exceeds limit: {file_size / 1024 / 1024:.2f}MB',
                    'severity': 'medium'
                })

            # Check filename for suspicious patterns
            if any(pattern in filename.lower() for pattern in ['script', 'exec', 'cmd', 'batch', 'sh']):
                results['threats'].append({
                    'type': 'filename',
                    'pattern': f'Suspicious filename: {filename}',
                    'severity': 'high'
                })

        except Exception as e:
            logger.error(f"Error analyzing file: {e}")
            results['threats'].append({
                'type': 'error',
                'pattern': f'Error analyzing file: {str(e)}',
                'severity': 'high'
            })

        # Update risk level
        if any(t['severity'] == 'high' for t in results['threats']):
            results['risk_level'] = 'high'
        elif results['threats']:
            results['risk_level'] = 'medium'

        return AnalysisResponse(**results)

    def _get_severity(self, category: str) -> str:
        severity_map = {
            'jailbreak': 'high',
            'malware': 'high',
            'data_poisoning': 'high',
            'sensitive_data': 'medium',
            'file_operations': 'medium',
            'file_type': 'high',
            'file_size': 'medium',
            'filename': 'high',
            'error': 'high'
        }
        return severity_map.get(category, 'low')

# Create FastAPI app
app = FastAPI(
    title="SentinelAI Security Analyzer",
    description="Advanced security analysis API for the SentinelAI browser extension",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize analyzer
analyzer = SecurityAnalyzer()

@app.post("/analyze/text", response_model=AnalysisResponse, 
          summary="Analyze text for security threats",
          description="Analyzes text content for potential security threats using pattern matching.")
async def analyze_text(request: TextAnalysisRequest):
    try:
        results = analyzer.analyze_text(request.text)
        logger.info(f"Text analysis completed: {results}")
        return results
    except Exception as e:
        logger.error(f"Error in text analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/file", response_model=AnalysisResponse,
          summary="Analyze file for security threats",
          description="Analyzes file content for potential security threats using pattern matching.")
async def analyze_file(file: UploadFile = File(...)):
    try:
        content = await file.read()
        results = analyzer.analyze_file(content, file.filename)
        logger.info(f"File analysis completed: {results}")
        return results
    except Exception as e:
        logger.error(f"Error in file analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health", 
         summary="Health check endpoint",
         description="Returns the health status of the API.")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    uvicorn.run("security_analyzer:app", host="127.0.0.1", port=5000, reload=True) 