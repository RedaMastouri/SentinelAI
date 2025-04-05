# SentinelAI - ChatGPT Security Guardian

SentinelAI is a browser extension designed to enhance security and privacy when interacting with ChatGPT. It provides real-time monitoring, data protection, and security alerts for your ChatGPT interactions.

## Features

- **Real-time Request Monitoring**: Tracks and analyzes requests to ChatGPT to detect potential security issues
- **File Upload Protection**: Warns users before uploading sensitive documents
- **Language Monitoring**: Detects and warns about inappropriate language usage
- **Prompt Leak Detection**: Monitors for potential system prompt leaks
- **Rate Limiting**: Prevents potential DDoS attacks by monitoring request rates
- **Security Alerts**: Provides immediate notifications for security concerns

## Installation

### Firefox
1. Clone this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on"
5. Navigate to the extension directory and select `manifest.json`

## Usage

Once installed, SentinelAI will automatically:
- Monitor your ChatGPT interactions
- Show warnings for potential security risks
- Protect against sensitive data exposure
- Alert you to suspicious activities

### Testing the Extension
- Upload a file to ChatGPT to see the file protection warning
- Type "bazinga" in the chat to test the language monitoring
- The extension will automatically monitor for other security concerns

## Technical Details

The extension uses:
- Manifest V3 for modern browser compatibility
- Declarative Net Request API for request monitoring
- Content Scripts for DOM monitoring
- Background Scripts for request analysis

## Security Features

1. **Request Monitoring**
   - Tracks request rates
   - Detects potential DDoS attacks
   - Monitors for suspicious patterns

2. **Content Protection**
   - File upload warnings
   - Language monitoring
   - Prompt leak detection

3. **Alert System**
   - Real-time notifications
   - Visual warnings
   - Console logging for debugging

## Development

### Project Structure
```
sentinelai/
├── manifest.json
├── background.js
├── content.js
├── rules.json
├── popup.html
└── icons/
    ├── icon48.png
    └── icon96.png
```

### Key Components
- `manifest.json`: Extension configuration
- `background.js`: Request monitoring and analysis
- `content.js`: DOM monitoring and user interaction
- `rules.json`: Declarative Net Request rules

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with modern web extension APIs
- Designed for Firefox compatibility
- Focused on user privacy and security 