# SentinelAI Backend

This is the Python backend service for the SentinelAI browser extension. It provides advanced security analysis using YARA rules and pattern matching.

## Features

- **FastAPI Backend**: Modern, fast web framework with automatic API documentation
- **Swagger UI**: Interactive API documentation at `/docs`
- **ReDoc**: Alternative API documentation at `/redoc`
- **YARA Rules Integration**: Uses YARA rules for malware detection
- **Pattern Matching**: Detects suspicious patterns in text and files
- **Risk Assessment**: Provides risk levels and detailed threat information
- **Logging**: Comprehensive logging for debugging and monitoring
- **REST API**: Simple REST API for text and file analysis

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Install YARA:
- On Windows: Download and install from https://github.com/VirusTotal/yara/releases
- On Linux: `sudo apt-get install yara`
- On macOS: `brew install yara`

## Usage

1. Start the server:
```bash
python security_analyzer.py
```

2. The server will run on `http://localhost:5000` with the following endpoints:
- POST `/analyze/text`: Analyze text content
- POST `/analyze/file`: Analyze file content
- GET `/health`: Health check endpoint

3. Access the API documentation:
- Swagger UI: `http://localhost:5000/docs`
- ReDoc: `http://localhost:5000/redoc`

## API Documentation

The API is fully documented using OpenAPI (formerly Swagger) specification. You can:

1. View interactive documentation at `/docs`
2. Test API endpoints directly from the Swagger UI
3. View detailed parameter descriptions and response schemas
4. Download the OpenAPI specification

## YARA Rules

The backend uses YARA rules for malware detection. Rules are stored in `rules/malware_rules.yar` and include:
- Suspicious JavaScript detection
- Shell command detection
- File operation monitoring
- Sensitive data exposure detection
- Jailbreak attempt detection

## Logging

Logs are stored in `sentinelai.log` and include:
- Analysis results
- Error messages
- System events

## Security Considerations

- The backend runs locally to ensure data privacy
- All analysis is performed in memory
- No data is stored permanently
- CORS is enabled for local development (restrict in production)

## Development

To add new YARA rules:
1. Edit `rules/malware_rules.yar`
2. Add new patterns to `SecurityAnalyzer` class
3. Restart the server

## License

This project is licensed under the MIT License - see the LICENSE file for details. 