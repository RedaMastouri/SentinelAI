// SentinelAI Content Script
console.log('SentinelAI: Content script loaded');

// Global variables
let warningDiv = null;
let observer = null;
let isAnalyzing = false;
let activeWarnings = [];
let warningLog = [];
let logFilePath = 'backend/sentinelai.log';

// Initialize detection counts
let detectionCounts = {
  'bot-detection': 0,
  'jailbreak': 0,
  'data-cleansing': 0,
  'ddos-shield': 0,
  'prompt-leak': 0,
  'document-upload': 0,
  'language-analysis': 0
};

// Load detection counts from storage
chrome.storage.local.get(['detectionCounts'], function(result) {
  if (result.detectionCounts) {
    detectionCounts = result.detectionCounts;
  }
});

// Function to increment detection count
function incrementDetectionCount(category) {
  detectionCounts[category] = (detectionCounts[category] || 0) + 1;
  
  // Save to storage
  chrome.storage.local.set({detectionCounts: detectionCounts});
  
  // Send message to popup to update count
  chrome.runtime.sendMessage({
    action: 'updateDetectionCount',
    category: category,
    count: detectionCounts[category]
  });
}

// Create warning div
function createWarningDiv() {
  if (warningDiv) return;
  
  warningDiv = document.createElement('div');
  warningDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 350px;
    background-color: #ffffff;
    color: #333333;
    border-radius: 8px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: none;
    overflow: hidden;
    border: 1px solid #e0e0e0;
  `;
  
  // Create header
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 12px 15px;
    font-weight: bold;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
  `;
  
  // Create icon
  const icon = document.createElement('span');
  icon.style.cssText = `
    margin-right: 10px;
    font-size: 18px;
  `;
  icon.textContent = '⚠️';
  
  // Create title
  const title = document.createElement('span');
  title.textContent = 'Security Warning';
  
  header.appendChild(icon);
  header.appendChild(title);
  
  // Create content
  const content = document.createElement('div');
  content.style.cssText = `
    padding: 15px;
    max-height: 200px;
    overflow-y: auto;
  `;
  content.id = 'sentinel-warning-content';
  
  // Create footer
  const footer = document.createElement('div');
  footer.style.cssText = `
    padding: 10px 15px;
    border-top: 1px solid #e0e0e0;
    font-size: 12px;
    color: #666;
    display: flex;
    justify-content: space-between;
  `;
  
  // Create timestamp
  const timestamp = document.createElement('span');
  timestamp.id = 'sentinel-warning-time';
  
  // Create close button
  const closeButton = document.createElement('span');
  closeButton.textContent = 'Dismiss';
  closeButton.style.cssText = `
    cursor: pointer;
    color: #0066cc;
  `;
  closeButton.addEventListener('click', () => {
    warningDiv.style.display = 'none';
  });
  
  footer.appendChild(timestamp);
  footer.appendChild(closeButton);
  
  // Assemble the warning div
  warningDiv.appendChild(header);
  warningDiv.appendChild(content);
  warningDiv.appendChild(footer);
  
  document.body.appendChild(warningDiv);
}

// Show warning with severity level
function showWarning(message, severity = 'high', detectedText = '') {
  try {
    if (!warningDiv) {
      createWarningDiv();
    }
    
    // Set background color based on severity
    let headerBgColor = '#ff6b6b'; // Default red for high severity
    if (severity === 'medium') {
      headerBgColor = '#ffd166'; // Yellow for medium
    } else if (severity === 'low') {
      headerBgColor = '#06d6a0'; // Green for low
    }
    
    // Update header background
    const header = warningDiv.querySelector('div');
    header.style.backgroundColor = headerBgColor;
    header.style.color = severity === 'medium' ? '#333' : '#fff';
    
    // Update content
    const content = document.getElementById('sentinel-warning-content');
    content.innerHTML = '';
    
    // Add message
    const messageDiv = document.createElement('div');
    messageDiv.style.marginBottom = '10px';
    messageDiv.textContent = message;
    content.appendChild(messageDiv);
    
    // Add detected text if available
    if (detectedText) {
      const textDiv = document.createElement('div');
      textDiv.style.cssText = `
        background-color: #f5f5f5;
        padding: 10px;
        border-radius: 4px;
        border-left: 3px solid ${headerBgColor};
        margin-top: 10px;
        font-family: monospace;
        font-size: 12px;
        max-height: 100px;
        overflow-y: auto;
      `;
      textDiv.textContent = detectedText;
      content.appendChild(textDiv);
    }
    
    // Update timestamp
    const timestamp = document.getElementById('sentinel-warning-time');
    const now = new Date();
    timestamp.textContent = now.toLocaleTimeString();
    
    // Show the warning
    warningDiv.style.display = 'block';
    
    // Store the warning in active warnings
    const warningId = Date.now();
    const warningData = {
      id: warningId,
      message: message,
      severity: severity,
      detectedText: detectedText,
      timestamp: now,
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    activeWarnings.push(warningData);
    
    // Log the warning
    logWarning(warningData);
    
    // Update the close button to remove this specific warning
    const closeButton = warningDiv.querySelector('span:last-child');
    closeButton.onclick = () => {
      // Remove this warning from active warnings
      activeWarnings = activeWarnings.filter(w => w.id !== warningId);
      
      // If there are other warnings, show the most recent one
      if (activeWarnings.length > 0) {
        const latestWarning = activeWarnings[activeWarnings.length - 1];
        showStoredWarning(latestWarning);
      } else {
        // No more warnings, hide the warning div
        warningDiv.style.display = 'none';
      }
    };
  } catch (error) {
    console.error('SentinelAI: Error showing warning:', error);
  }
}

// Log warning to storage and file
function logWarning(warning) {
  try {
    // Format timestamp for log
    const timestamp = new Date(warning.timestamp).toISOString();
    
    // Create log entry
    const logEntry = {
      timestamp: timestamp,
      severity: warning.severity.toUpperCase(),
      message: warning.message,
      url: warning.url,
      detectedText: warning.detectedText
    };
    
    // Add to in-memory log
    warningLog.push(logEntry);
    
    // Save to browser storage
    chrome.storage.local.get(['warningLog'], function(result) {
      const storedLog = result.warningLog || [];
      storedLog.push(logEntry);
      
      // Keep only the last 1000 entries to avoid storage limits
      if (storedLog.length > 1000) {
        storedLog.splice(0, storedLog.length - 1000);
      }
      
      chrome.storage.local.set({ warningLog: storedLog }, function() {
        console.log('SentinelAI: Warning logged successfully to storage');
      });
    });
    
    // Format log entry for file
    const logText = `[${timestamp}] ${warning.severity.toUpperCase()}: ${warning.message} | URL: ${warning.url} | Detected Text: ${warning.detectedText}\n`;
    
    // Save to file using fetch API to a local endpoint
    fetch('http://localhost:5001/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        logText: logText,
        filePath: logFilePath
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('SentinelAI: Warning logged successfully to file:', data);
    })
    .catch(error => {
      console.error('SentinelAI: Error logging to file:', error);
      // Fallback to localStorage if server is not available
      saveToLocalStorage(logText);
    });
  } catch (error) {
    console.error('SentinelAI: Error logging warning:', error);
  }
}

// Fallback to localStorage if server is not available
function saveToLocalStorage(logText) {
  try {
    // Get existing logs from localStorage
    let logs = localStorage.getItem('sentinelai_logs') || '';
    
    // Append new log
    logs += logText;
    
    // Save back to localStorage
    localStorage.setItem('sentinelai_logs', logs);
    
    console.log('SentinelAI: Warning logged to localStorage as fallback');
  } catch (error) {
    console.error('SentinelAI: Error saving to localStorage:', error);
  }
}

// Show a stored warning
function showStoredWarning(warning) {
  try {
    if (!warningDiv) {
      createWarningDiv();
    }
    
    // Set background color based on severity
    let headerBgColor = '#ff6b6b'; // Default red for high severity
    if (warning.severity === 'medium') {
      headerBgColor = '#ffd166'; // Yellow for medium
    } else if (warning.severity === 'low') {
      headerBgColor = '#06d6a0'; // Green for low
    }
    
    // Update header background
    const header = warningDiv.querySelector('div');
    header.style.backgroundColor = headerBgColor;
    header.style.color = warning.severity === 'medium' ? '#333' : '#fff';
    
    // Update content
    const content = document.getElementById('sentinel-warning-content');
    content.innerHTML = '';
    
    // Add message
    const messageDiv = document.createElement('div');
    messageDiv.style.marginBottom = '10px';
    messageDiv.textContent = warning.message;
    content.appendChild(messageDiv);
    
    // Add detected text if available
    if (warning.detectedText) {
      const textDiv = document.createElement('div');
      textDiv.style.cssText = `
        background-color: #f5f5f5;
        padding: 10px;
        border-radius: 4px;
        border-left: 3px solid ${headerBgColor};
        margin-top: 10px;
        font-family: monospace;
        font-size: 12px;
        max-height: 100px;
        overflow-y: auto;
      `;
      textDiv.textContent = warning.detectedText;
      content.appendChild(textDiv);
    }
    
    // Update timestamp
    const timestamp = document.getElementById('sentinel-warning-time');
    timestamp.textContent = warning.timestamp.toLocaleTimeString();
    
    // Show the warning
    warningDiv.style.display = 'block';
    
    // Update the close button to remove this specific warning
    const closeButton = warningDiv.querySelector('span:last-child');
    closeButton.onclick = () => {
      // Remove this warning from active warnings
      activeWarnings = activeWarnings.filter(w => w.id !== warning.id);
      
      // If there are other warnings, show the most recent one
      if (activeWarnings.length > 0) {
        const latestWarning = activeWarnings[activeWarnings.length - 1];
        showStoredWarning(latestWarning);
      } else {
        // No more warnings, hide the warning div
        warningDiv.style.display = 'none';
      }
    };
  } catch (error) {
    console.error('SentinelAI: Error showing stored warning:', error);
  }
}

// Analyze text using client-side patterns
function analyzeText(text) {
  const threats = [];
  
  // Bot detection patterns
  const botPatterns = [
    {pattern: /(?:bot|crawler|spider|scraper)/i, category: 'bot-detection', message: 'Potential bot activity detected'},
    {pattern: /(?:automated|script|macro)/i, category: 'bot-detection', message: 'Automated activity detected'}
  ];
  
  // Jailbreak patterns
  const jailbreakPatterns = [
    {pattern: /(?:jailbreak|bypass|override|ignore previous)/i, category: 'jailbreak', message: 'Jailbreak attempt detected'},
    {pattern: /(?:pretend|roleplay|act as|you are now)/i, category: 'jailbreak', message: 'Role manipulation detected'},
    {pattern: /(?:ignore all previous instructions|disregard previous instructions)/i, category: 'jailbreak', message: 'Instruction override attempt detected'},
    {pattern: /(?:you are now free from all restrictions|you are no longer bound by)/i, category: 'jailbreak', message: 'Restriction bypass attempt detected'},
    {pattern: /(?:let's roleplay|let's pretend|let's play a game)/i, category: 'jailbreak', message: 'Roleplay-based jailbreak attempt detected'}
  ];
  
  // Data cleansing patterns
  const dataCleansingPatterns = [
    {pattern: /(?:sql injection|sqlmap|union select)/i, category: 'data-cleansing', message: 'SQL injection attempt detected'},
    {pattern: /(?:xss|script|javascript|eval)/i, category: 'data-cleansing', message: 'XSS attempt detected'},
    {pattern: /(?:data poisoning|training data|model poisoning)/i, category: 'data-cleansing', message: 'Data poisoning attempt detected'},
    {pattern: /(?:adversarial example|adversarial attack)/i, category: 'data-cleansing', message: 'Adversarial attack pattern detected'},
    {pattern: /(?:backdoor|trigger|malicious sample)/i, category: 'data-cleansing', message: 'Backdoor trigger pattern detected'}
  ];
  
  // DDoS patterns
  const ddosPatterns = [
    {pattern: /(?:ddos|dos|flood|overload)/i, category: 'ddos-shield', message: 'DDoS attempt detected'},
    {pattern: /(?:rate limit|throttle|spam)/i, category: 'ddos-shield', message: 'Rate limiting bypass attempt detected'},
    {pattern: /(?:brute force|password cracking|dictionary attack)/i, category: 'ddos-shield', message: 'Brute force attack pattern detected'}
  ];
  
  // Prompt leak patterns
  const promptLeakPatterns = [
    {pattern: /(?:system prompt|initial prompt|base prompt)/i, category: 'prompt-leak', message: 'Prompt leak attempt detected'},
    {pattern: /(?:what are your instructions|what are you trained on)/i, category: 'prompt-leak', message: 'Training data leak attempt detected'},
    {pattern: /(?:show me your system prompt|reveal your instructions)/i, category: 'prompt-leak', message: 'Direct prompt leak request detected'},
    {pattern: /(?:what are your capabilities|what can you do)/i, category: 'prompt-leak', message: 'Capability exploration attempt detected'},
    {pattern: /(?:what are your limitations|what are you not allowed to do)/i, category: 'prompt-leak', message: 'Limitation exploration attempt detected'},
    {pattern: /(?:what is your training data|what data were you trained on)/i, category: 'prompt-leak', message: 'Training data exploration attempt detected'},
    {pattern: /(?:what is your knowledge cutoff|what is your training cutoff)/i, category: 'prompt-leak', message: 'Knowledge cutoff exploration attempt detected'},
    {pattern: /(?:what is your model architecture|what is your model size)/i, category: 'prompt-leak', message: 'Model architecture exploration attempt detected'}
  ];
  
  // Document upload patterns
  const documentUploadPatterns = [
    {pattern: /(?:upload|file|document|attachment)/i, category: 'document-upload', message: 'Suspicious file upload attempt detected'},
    {pattern: /(?:\.exe|\.bat|\.sh|\.py|\.js)/i, category: 'document-upload', message: 'Executable file upload attempt detected'}
  ];
  
  // Language analysis patterns
  const languagePatterns = [
    {pattern: /(?:hack|exploit|vulnerability|breach)/i, category: 'language-analysis', message: 'Malicious language detected'},
    {pattern: /(?:attack|compromise|infiltrate)/i, category: 'language-analysis', message: 'Attack-related language detected'},
    {pattern: /(?:malware|ransomware|trojan|virus)/i, category: 'language-analysis', message: 'Malware-related language detected'},
    {pattern: /(?:phishing|scam|fraud|identity theft)/i, category: 'language-analysis', message: 'Phishing-related language detected'}
  ];
  
  // YARA rule-based patterns (simplified client-side implementation)
  const yaraPatterns = [
    {pattern: /(?:cmd\.exe|powershell\.exe|wscript\.exe|mshta\.exe)/i, category: 'yara-rules', message: 'Suspicious command execution pattern detected'},
    {pattern: /(?:base64|rot13|hex|binary)/i, category: 'yara-rules', message: 'Potential encoded malicious content detected'},
    {pattern: /(?:download|wget|curl|fetch)/i, category: 'yara-rules', message: 'Suspicious download command detected'},
    {pattern: /(?:http:\/\/|https:\/\/|ftp:\/\/|file:\/\/)/i, category: 'yara-rules', message: 'URL pattern detected - potential malicious link'},
    {pattern: /(?:<script|javascript:|vbscript:|onload=|onerror=)/i, category: 'yara-rules', message: 'Suspicious script injection pattern detected'},
    {pattern: /(?:eval\(|setTimeout\(|setInterval\(|new Function\()/i, category: 'yara-rules', message: 'Dynamic code execution pattern detected'},
    {pattern: /(?:document\.cookie|localStorage|sessionStorage)/i, category: 'yara-rules', message: 'Suspicious storage access pattern detected'},
    {pattern: /(?:XMLHttpRequest|fetch\(|\.ajax)/i, category: 'yara-rules', message: 'Suspicious network request pattern detected'}
  ];
  
  // Combine all patterns
  const allPatterns = [
    ...botPatterns,
    ...jailbreakPatterns,
    ...dataCleansingPatterns,
    ...ddosPatterns,
    ...promptLeakPatterns,
    ...documentUploadPatterns,
    ...languagePatterns,
    ...yaraPatterns
  ];
  
  // Check each pattern
  allPatterns.forEach(({pattern, category, message}) => {
    const match = text.match(pattern);
    if (match) {
      threats.push({
        category: category,
        message: message,
        matchedText: match[0]
      });
      incrementDetectionCount(category);
    }
  });
  
  return threats;
}

// Analyze file
function analyzeFile(file) {
  const threats = [];
  
  // Check file type
  const dangerousExtensions = ['.exe', '.bat', '.sh', '.py', '.js', '.ps1', '.cmd'];
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  
  if (dangerousExtensions.includes(extension)) {
    threats.push({
      category: 'document-upload',
      message: `Dangerous file type detected: ${extension}`,
      matchedText: file.name
    });
    incrementDetectionCount('document-upload');
  }
  
  // Check file size (e.g., > 10MB)
  if (file.size > 10 * 1024 * 1024) {
    threats.push({
      category: 'document-upload',
      message: 'Large file detected (>10MB)',
      matchedText: `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`
    });
    incrementDetectionCount('document-upload');
  }
  
  return threats;
}

// Monitor file uploads
function monitorFileUploads() {
  try {
    document.addEventListener('change', (event) => {
      if (event.target.type === 'file') {
        const files = event.target.files;
        if (files && files.length > 0) {
          for (const file of files) {
            const threats = analyzeFile(file);
            if (threats && threats.length > 0) {
              // Show warning for each threat
              threats.forEach(threat => {
                showWarning(
                  `⚠️ Security Warning: ${threat.message}`, 
                  'high',
                  threat.matchedText
                );
              });
              // Don't prevent upload, just warn the user
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('SentinelAI: Error monitoring file uploads:', error);
  }
}

// Monitor text input
function monitorTextInput() {
  try {
    // Monitor the main ChatGPT text area
    const textAreaSelector = 'textarea[placeholder="Send a message"]';
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const textArea = document.querySelector(textAreaSelector);
          if (textArea && textArea.value) {
            analyzeText(textArea.value);
          }
        }
      });
    });

    // Observe text area changes
    const observerConfig = {
      childList: true,
      subtree: true,
      characterData: true
    };

    // Start observing the document
    observer.observe(document.body, observerConfig);

    // Add input event listener to text area
    document.addEventListener('input', (event) => {
      if (event.target.matches(textAreaSelector)) {
        analyzeText(event.target.value);
      }
    });

    // Monitor form submissions
    document.addEventListener('submit', (event) => {
      const textArea = document.querySelector(textAreaSelector);
      if (textArea && textArea.value) {
        analyzeText(textArea.value);
      }
    });

    // Monitor Enter key press
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        const textArea = document.querySelector(textAreaSelector);
        if (textArea && textArea.value) {
          analyzeText(textArea.value);
        }
      }
    });

  } catch (error) {
    console.error('SentinelAI: Error monitoring text input:', error);
  }
}

// Monitor for prompt leaking
function monitorPromptLeaking() {
  try {
    const chatContainer = document.querySelector('.main');
    if (chatContainer) {
      observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.TEXT_NODE) {
                const result = analyzeText(node.textContent);
                if (result && result.threat_detected) {
                  showWarning(
                    `⚠️ Security Warning: ${result.details}`, 
                    result.severity || 'high',
                    result.matched_text
                  );
                }
              }
            });
          }
        });
      });
      
      observer.observe(chatContainer, { childList: true, subtree: true });
    }
  } catch (error) {
    console.error('SentinelAI: Error monitoring prompt leaking:', error);
  }
}

// Initialize
function initialize() {
  try {
    // Create warning div
    createWarningDiv();
    
    // Initialize monitoring
    const initMonitoring = () => {
      // Monitor text input in ChatGPT interface
      monitorTextInput();
      
      // Monitor file uploads
      monitorFileUploads();
      
      // Monitor for prompt leaking attempts
      monitorPromptLeaking();
    };

    // Check if page is loaded
    if (document.readyState === 'complete') {
      initMonitoring();
    } else {
      // Wait for page to load
      window.addEventListener('load', initMonitoring);
    }

    // Re-initialize monitoring when URL changes (for SPA navigation)
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        initMonitoring();
      }
    }).observe(document, { subtree: true, childList: true });

  } catch (error) {
    console.error('SentinelAI: Error initializing:', error);
  }
}

// Load warning log from storage
function loadWarningLog() {
  try {
    chrome.storage.local.get(['warningLog'], function(result) {
      if (result.warningLog) {
        warningLog = result.warningLog;
        console.log('SentinelAI: Loaded warning log with', warningLog.length, 'entries');
      }
    });
  } catch (error) {
    console.error('SentinelAI: Error loading warning log:', error);
  }
}

// Sync logs from localStorage to server
function syncLocalStorageLogs() {
  try {
    const logs = localStorage.getItem('sentinelai_logs');
    if (logs) {
      // Send logs to server
      fetch('http://localhost:5001/api/log-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs: logs,
          filePath: logFilePath
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('SentinelAI: LocalStorage logs synced successfully:', data);
        // Clear localStorage logs after successful sync
        localStorage.removeItem('sentinelai_logs');
      })
      .catch(error => {
        console.error('SentinelAI: Error syncing localStorage logs:', error);
      });
    }
  } catch (error) {
    console.error('SentinelAI: Error in syncLocalStorageLogs:', error);
  }
}

// Export log to file
function exportLogToFile() {
  try {
    // Create a direct link to the log file
    const logUrl = chrome.runtime.getURL('backend/sentinelai.log');
    
    // Create a download link
    const a = document.createElement('a');
    a.href = logUrl;
    a.download = 'sentinelai.log';
    
    // Append to body, click, and remove
    document.body.appendChild(a);
    a.click();
    
    // Clean up after a short delay
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);
    
    console.log('Log export initiated');
  } catch (error) {
    console.error('Error in exportLogToFile:', error);
  }
}

// Cleanup
function cleanup() {
  try {
    if (observer) {
      observer.disconnect();
    }
    if (warningDiv && warningDiv.parentNode) {
      warningDiv.parentNode.removeChild(warningDiv);
    }
  } catch (error) {
    console.error('SentinelAI: Error during cleanup:', error);
  }
}

// Start monitoring
initialize();

// Cleanup on page unload
window.addEventListener('unload', cleanup);

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'exportLog') {
    exportLogToFile();
    sendResponse({status: 'success'});
  } else if (request.action === 'getLogs') {
    // Read the sentinelai.log file
    fetch(chrome.runtime.getURL('backend/sentinelai.log'))
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch log file');
        }
        return response.text();
      })
      .then(logContent => {
        if (!logContent || logContent.trim() === '') {
          // If log file is empty, try to get logs from local storage
          chrome.storage.local.get(['warningLog'], function(result) {
            if (result.warningLog && result.warningLog.length > 0) {
              // Format log entries
              const logText = result.warningLog.map(entry => {
                return `[${entry.timestamp}] ${entry.severity}: ${entry.message} | URL: ${entry.url} | Detected Text: ${entry.detectedText}`;
              }).join('\n');
              sendResponse({logs: logText});
            } else {
              sendResponse({logs: "No logs available. The log file is empty."});
            }
          });
        } else {
          sendResponse({logs: logContent});
        }
      })
      .catch(error => {
        console.error('Error reading log file:', error);
        // Try to get logs from local storage as fallback
        chrome.storage.local.get(['warningLog'], function(result) {
          if (result.warningLog && result.warningLog.length > 0) {
            // Format log entries
            const logText = result.warningLog.map(entry => {
              return `[${entry.timestamp}] ${entry.severity}: ${entry.message} | URL: ${entry.url} | Detected Text: ${entry.detectedText}`;
            }).join('\n');
            sendResponse({logs: logText});
          } else {
            sendResponse({error: 'Failed to read log file'});
          }
        });
      });
    return true; // Required for async response
  }
}); 