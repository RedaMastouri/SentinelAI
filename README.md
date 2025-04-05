# <img src="icons/icon48.png" alt="SentinelAI Logo" width="48" height="48" style="vertical-align: middle"> SentinelAI - AI Data Guardian

Advanced AI Data Guardian - Intelligent data distillation, cleansing, and security for GenAI interactions.

## Features

- 🛡️ Real-time prompt monitoring and security analysis
- 🔍 Advanced pattern detection for potential security threats
- 🚫 Jailbreak attempt prevention
- 📝 Content filtering and sanitization
- 🔐 Data leak prevention
- 📊 Request rate limiting
- 🌐 Support for multiple AI platforms
- 🎯 Customizable security rules

## Installation

1. Clone the repository:
```bash
git clone https://github.com/RedaMastouri/SentinelAI.git
cd SentinelAI
```

2. Install browser extension:
   - Open Chrome/Firefox and navigate to extensions
   - Enable Developer Mode
   - Click "Load unpacked" and select the extension directory

## Backend Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Installation Steps

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
# On Windows
python -m venv venv
.\venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the FastAPI server:
```bash
python security_analyzer.py
```

The server will be available at:
- API Documentation: http://localhost:5000/docs
- Alternative Documentation: http://localhost:5000/redoc
- Health Check: http://localhost:5000/health

### Debugging the Backend

1. Enable Debug Logging:
   - Logs are written to `sentinelai.log`
   - Check logs for detailed error messages and request tracking

2. Common Issues and Solutions:
   - Port already in use: Change the port in `security_analyzer.py`
   - File permission errors: Ensure write access to the log directory
   - Memory issues: Adjust file size limits in the configuration

3. Testing API Endpoints:
   - Use Swagger UI at `/docs` for interactive testing
   - Test file uploads with different file types
   - Monitor response times and error rates

4. Development Tips:
   - Use `uvicorn` with `--reload` flag for auto-reloading during development
   - Enable debug mode for more detailed error messages
   - Use logging levels appropriately (DEBUG, INFO, WARNING, ERROR)

## Usage

1. Click the SentinelAI icon in your browser toolbar
2. Configure security settings in the popup
3. Start using AI platforms with enhanced security

The extension will:
- Monitor and analyze prompts in real-time
- Detect potential security threats
- Prevent data leaks and jailbreak attempts
- Provide security alerts when needed

## Security Features

1. Prompt Analysis:
   - Pattern matching for security threats
   - Content sanitization
   - Jailbreak attempt detection

2. File Security:
   - File type validation
   - Content analysis
   - Size restrictions
   - Malware detection

3. Network Security:
   - Request rate limiting
   - Host validation
   - Traffic monitoring

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Author

### Reda Mastouri
- GitHub: [@RedaMastouri](https://github.com/RedaMastouri)
- Website: [redamastouri.com](https://redamastouri.com)
- Twitter: [@redamastouri](https://twitter.com/redamastouri)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 