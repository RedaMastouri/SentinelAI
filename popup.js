// SentinelAI Popup Script
document.addEventListener('DOMContentLoaded', function() {
  // Initialize detection counts
  initializeDetectionCounts();
  
  // Update log count
  updateLogCount();
  
  // Export log button
  const exportLogButton = document.getElementById('exportLog');
  if (exportLogButton) {
    exportLogButton.addEventListener('click', function() {
      // Show loading state
      exportLogButton.textContent = 'Exporting...';
      exportLogButton.disabled = true;
      
      // Send message to content script to export log
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {action: 'exportLog'}, function(response) {
            // Reset button state
            exportLogButton.textContent = 'Export Log';
            exportLogButton.disabled = false;
            
            if (response && response.status === 'success') {
              console.log('Log export initiated');
              // Show success message
              const logInfo = document.querySelector('.log-info p');
              if (logInfo) {
                const originalText = logInfo.textContent;
                logInfo.textContent = 'Log exported successfully!';
                setTimeout(() => {
                  logInfo.textContent = originalText;
                }, 3000);
              }
            } else {
              console.error('Failed to export log');
              // Show error message
              const logInfo = document.querySelector('.log-info p');
              if (logInfo) {
                const originalText = logInfo.textContent;
                logInfo.textContent = 'Failed to export log. Please try again.';
                setTimeout(() => {
                  logInfo.textContent = originalText;
                }, 3000);
              }
            }
          });
        } else {
          // Reset button state
          exportLogButton.textContent = 'Export Log';
          exportLogButton.disabled = false;
          
          // Show error message
          const logInfo = document.querySelector('.log-info p');
          if (logInfo) {
            const originalText = logInfo.textContent;
            logInfo.textContent = 'No active tab found. Please try again.';
            setTimeout(() => {
              logInfo.textContent = originalText;
            }, 3000);
          }
        }
      });
    });
  }
  
  // View logs button
  const viewLogsButton = document.getElementById('viewLogs');
  if (viewLogsButton) {
    viewLogsButton.addEventListener('click', function() {
      // Send message to content script to get logs
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {action: 'getLogs'}, function(response) {
            if (response && response.logs) {
              // Create a modal to display logs
              const modal = document.createElement('div');
              modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
              `;
              
              const modalContent = document.createElement('div');
              modalContent.style.cssText = `
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                width: 80%;
                max-width: 800px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
              `;
              
              const modalHeader = document.createElement('div');
              modalHeader.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
              `;
              
              const modalTitle = document.createElement('h3');
              modalTitle.textContent = 'SentinelAI Logs';
              modalTitle.style.margin = '0';
              
              const closeButton = document.createElement('button');
              closeButton.textContent = '×';
              closeButton.style.cssText = `
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
              `;
              closeButton.addEventListener('click', function() {
                document.body.removeChild(modal);
              });
              
              modalHeader.appendChild(modalTitle);
              modalHeader.appendChild(closeButton);
              
              const logContent = document.createElement('pre');
              logContent.style.cssText = `
                font-family: monospace;
                white-space: pre-wrap;
                word-wrap: break-word;
                background-color: #f5f5f5;
                padding: 10px;
                border-radius: 4px;
                max-height: 60vh;
                overflow-y: auto;
              `;
              logContent.textContent = response.logs;
              
              modalContent.appendChild(modalHeader);
              modalContent.appendChild(logContent);
              modal.appendChild(modalContent);
              document.body.appendChild(modal);
              
              // Update detection counts based on log content
              updateCountsFromLogs(response.logs);
              
              // Update log count
              const logLines = response.logs.split('\n').filter(line => line.trim() !== '');
              const logCount = logLines.length;
              const logInfo = document.querySelector('.log-info p');
              if (logInfo) {
                logInfo.textContent = `Warning logs are stored locally (${logCount} entries) and can be exported as a file.`;
              }
            } else {
              alert('No logs available');
            }
          });
        }
      });
    });
  }
  
  // Listen for messages from content script
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateDetectionCount') {
      updateDetectionCount(request.category, request.count);
      sendResponse({status: 'success'});
    }
  });
});

// Initialize detection counts from storage
function initializeDetectionCounts() {
  chrome.storage.local.get(['detectionCounts'], function(result) {
    if (result.detectionCounts) {
      // Update each count element
      for (const category in result.detectionCounts) {
        updateDetectionCount(category, result.detectionCounts[category]);
      }
    } else {
      // Initialize with zeros if not exists
      resetDetectionCounts();
    }
  });
}

// Update a specific detection count
function updateDetectionCount(category, count) {
  const countElement = document.getElementById(`${category}-count`);
  if (countElement) {
    countElement.textContent = count;
    
    // Add appropriate class based on count
    countElement.classList.remove('high', 'medium', 'low');
    if (count > 10) {
      countElement.classList.add('high');
    } else if (count > 5) {
      countElement.classList.add('medium');
    } else if (count > 0) {
      countElement.classList.add('low');
    }
  }
  
  // Save to storage
  chrome.storage.local.get(['detectionCounts'], function(result) {
    const detectionCounts = result.detectionCounts || {};
    detectionCounts[category] = count;
    chrome.storage.local.set({detectionCounts: detectionCounts});
  });
}

// Reset all detection counts to zero
function resetDetectionCounts() {
  const categories = [
    'bot-detection',
    'jailbreak',
    'data-cleansing',
    'ddos-shield',
    'prompt-leak',
    'document-upload',
    'language-analysis',
    'yara-rules'
  ];
  
  categories.forEach(category => {
    updateDetectionCount(category, 0);
  });
  
  // Save to storage
  chrome.storage.local.set({detectionCounts: {}});
}

// Update log count
function updateLogCount() {
  // Send message to content script to get logs
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'getLogs'}, function(response) {
        if (response && response.logs) {
          // Count the number of log entries
          const logLines = response.logs.split('\n').filter(line => line.trim() !== '');
          const logCount = logLines.length;
          
          const logInfo = document.querySelector('.log-info p');
          if (logInfo) {
            logInfo.textContent = `Warning logs are stored locally (${logCount} entries) and can be exported as a file.`;
          }
          
          // Update detection counts based on log content
          updateCountsFromLogs(response.logs);
        } else {
          // Fallback to local storage if log file is not accessible
          chrome.storage.local.get(['warningLog'], function(result) {
            const logCount = result.warningLog ? result.warningLog.length : 0;
            const logInfo = document.querySelector('.log-info p');
            if (logInfo) {
              logInfo.textContent = `Warning logs are stored locally (${logCount} entries) and can be exported as a file.`;
            }
          });
        }
      });
    } else {
      // No active tab, use local storage
      chrome.storage.local.get(['warningLog'], function(result) {
        const logCount = result.warningLog ? result.warningLog.length : 0;
        const logInfo = document.querySelector('.log-info p');
        if (logInfo) {
          logInfo.textContent = `Warning logs are stored locally (${logCount} entries) and can be exported as a file.`;
        }
      });
    }
  });
}

// Update detection counts based on log content
function updateCountsFromLogs(logContent) {
  // Reset counts first
  resetDetectionCounts();
  
  // Count occurrences of each threat type
  const threatCounts = {
    'bot-detection': 0,
    'jailbreak': 0,
    'data-cleansing': 0,
    'ddos-shield': 0,
    'prompt-leak': 0,
    'document-upload': 0,
    'language-analysis': 0
  };
  
  // Parse log content to count threats
  const lines = logContent.split('\n');
  lines.forEach(line => {
    // Check for jailbreak threats
    if (line.includes('type=\'jailbreak\'') || line.includes('pattern=\'jailbreak\'') || 
        line.includes('pattern=\'bypass\'') || line.includes('pattern=\'ignore previous\'') ||
        line.includes('pattern=\'pretend you are\'') || line.includes('pattern=\'hack\'')) {
      threatCounts['jailbreak']++;
    }
    
    // Check for bot detection threats
    if (line.includes('type=\'bot\'') || line.includes('pattern=\'bot\'') || 
        line.includes('pattern=\'crawler\'') || line.includes('pattern=\'spider\'') ||
        line.includes('pattern=\'automated\'') || line.includes('pattern=\'script\'')) {
      threatCounts['bot-detection']++;
    }
    
    // Check for data cleansing threats
    if (line.includes('type=\'sql_injection\'') || line.includes('type=\'xss\'') || 
        line.includes('pattern=\'sql injection\'') || line.includes('pattern=\'xss\'') ||
        line.includes('pattern=\'inject\'') || line.includes('pattern=\'malicious code\'')) {
      threatCounts['data-cleansing']++;
    }
    
    // Check for DDoS shield threats
    if (line.includes('type=\'ddos\'') || line.includes('pattern=\'ddos\'') || 
        line.includes('pattern=\'flood\'') || line.includes('pattern=\'overload\'') ||
        line.includes('pattern=\'rate limit\'') || line.includes('pattern=\'throttle\'')) {
      threatCounts['ddos-shield']++;
    }
    
    // Check for prompt leak threats
    if (line.includes('type=\'prompt_leak\'') || line.includes('pattern=\'system prompt\'') || 
        line.includes('pattern=\'initial prompt\'') || line.includes('pattern=\'base prompt\'') ||
        line.includes('pattern=\'what are your instructions\'') || line.includes('pattern=\'what are you trained on\'')) {
      threatCounts['prompt-leak']++;
    }
    
    // Check for document upload threats
    if (line.includes('type=\'file_type\'') || line.includes('pattern=\'Unsupported file type\'') || 
        line.includes('pattern=\'.exe\'') || line.includes('pattern=\'.bat\'') || 
        line.includes('pattern=\'.sh\'') || line.includes('pattern=\'.py\'') || 
        line.includes('pattern=\'.js\'') || line.includes('pattern=\'.ps1\'') ||
        line.includes('pattern=\'Large file detected\'') || line.includes('pattern=\'Dangerous file type\'')) {
      threatCounts['document-upload']++;
    }
    
    // Check for language analysis threats
    if (line.includes('type=\'malware\'') || line.includes('type=\'sensitive_data\'') || 
        line.includes('pattern=\'cmd.exe\'') || line.includes('pattern=\'password\'') || 
        line.includes('pattern=\'hack\'') || line.includes('pattern=\'exploit\'') ||
        line.includes('pattern=\'attack\'') || line.includes('pattern=\'compromise\'') ||
        line.includes('pattern=\'infiltrate\'') || line.includes('pattern=\'breach\'')) {
      threatCounts['language-analysis']++;
    }
  });
  
  // Update the UI with the counts
  for (const category in threatCounts) {
    updateDetectionCount(category, threatCounts[category]);
  }
} 