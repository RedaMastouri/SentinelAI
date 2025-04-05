# SentinelAI

<div align="center">

<svg width="120" height="120" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2196F3;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1976D2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <path d="M48 8L88 24V40C88 65.2 71.2 87.2 48 92C24.8 87.2 8 65.2 8 40V24L48 8Z" 
        fill="url(#shieldGradient)" stroke="#1565C0" stroke-width="2"/>
  <path d="M32 36L44 48L64 28" 
        stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="32" cy="36" r="4" fill="white"/>
  <circle cx="44" cy="48" r="4" fill="white"/>
  <circle cx="64" cy="28" r="4" fill="white"/>
  <path d="M48 24V32M48 52V60" 
        stroke="white" stroke-width="2" stroke-dasharray="3 3" stroke-opacity="0.7"/>
</svg>

<h3>Advanced AI Data Guardian</h3>
<p>Intelligent data distillation, cleansing, and security for GenAI interactions</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Firefox Add-on](https://img.shields.io/badge/Firefox-Add--on-orange.svg)](https://addons.mozilla.org/)
[![GitHub stars](https://img.shields.io/github/stars/RedaMastouri/SentinelAI.svg?style=social)](https://github.com/RedaMastouri/SentinelAI/stargazers)

</div>

## Overview

SentinelAI is a powerful Firefox extension that safeguards your interactions with ChatGPT and other GenAI tools. It provides comprehensive protection against various security threats while ensuring data privacy and integrity.

## Features

### Security Protections
- **Advanced Bot Detection**: Identifies and blocks automated attacks
- **Jailbreak Prevention**: Detects and prevents attempts to bypass AI safety measures
- **Data Cleansing**: Sanitizes inputs to prevent data poisoning
- **DDoS Shield**: Protects against denial of service attacks
- **Prompt Leak Detection**: Monitors for attempts to extract system prompts

### Data Protection
- **Document Upload Warnings**: Alerts users before uploading potentially sensitive documents
- **Language Analysis**: Monitors input for inappropriate or harmful content
- **Data Distillation**: Processes and cleanses data before it reaches AI models

## Installation

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on"
4. Navigate to the extension directory and select the `manifest.json` file

## Usage

The extension automatically:
- Monitors and protects against potential security threats
- Shows warnings for document uploads
- Displays alerts for inappropriate language
- Blocks suspicious requests
- Shows notifications for security events

## Development

### Project Structure
```
SentinelAI/
├── manifest.json        # Extension configuration
├── background.js        # Background processes and security monitoring
├── content.js           # Content script for page interaction
├── popup.html           # Extension popup interface
└── README.md            # Documentation
```

### Building from Source
1. Clone the repository
2. Make your modifications
3. Load the extension in Firefox using the installation instructions above

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

**Reda Mastouri**
- GitHub: [@RedaMastouri](https://github.com/RedaMastouri)
- Website: [redamastouri.com](https://redamastouri.com)
- Twitter: [@redamastouri](https://twitter.com/redamastouri)

## Acknowledgments

- Inspired by the need for better security in AI interactions
- Built with modern web technologies
- Designed for user privacy and data protection 