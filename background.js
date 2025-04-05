// SentinelAI Background Script
console.log('SentinelAI: Background script loaded');

// Global variables
let isInitialized = false;

// Initialize the extension
function initialize() {
  try {
    if (isInitialized) return;
    
    // Set up message handling
    browser.runtime.onMessage.addListener(handleMessage);
    
    // Set up declarative net request rules
    setupDeclarativeNetRequest();
    
    isInitialized = true;
    console.log('SentinelAI: Background script initialized');
  } catch (error) {
    console.error('SentinelAI: Error initializing background script:', error);
  }
}

// Handle messages from content script
function handleMessage(message, sender, sendResponse) {
  try {
    if (!message || !message.type) {
      console.error('SentinelAI: Invalid message received');
      return;
    }
    
    switch (message.type) {
      case 'promptLeak':
        handlePromptLeak(message, sender);
        break;
      case 'threatDetected':
        handleThreatDetected(message, sender);
        break;
      default:
        console.log('SentinelAI: Unknown message type:', message.type);
    }
    
    // Always send a response to prevent the port from closing
    sendResponse({ received: true });
  } catch (error) {
    console.error('SentinelAI: Error handling message:', error);
    sendResponse({ error: error.message });
  }
  
  // Return true to indicate we'll send a response asynchronously
  return true;
}

// Handle prompt leak detection
function handlePromptLeak(message, sender) {
  try {
    if (!message.content || !message.threats) {
      console.error('SentinelAI: Invalid prompt leak message');
      return;
    }
    
    // Log the incident
    console.log('SentinelAI: Prompt leak detected', {
      url: sender.tab ? sender.tab.url : 'unknown',
      threats: message.threats,
      riskLevel: message.risk_level
    });
    
    // Show notification
    browser.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'SentinelAI Security Alert',
      message: `Potential prompt leaking detected with ${message.threats.length} threats. Risk level: ${message.risk_level}`
    });
  } catch (error) {
    console.error('SentinelAI: Error handling prompt leak:', error);
  }
}

// Handle threat detection
function handleThreatDetected(message, sender) {
  try {
    if (!message.threats) {
      console.error('SentinelAI: Invalid threat detection message');
      return;
    }
    
    // Log the incident
    console.log('SentinelAI: Threat detected', {
      url: sender.tab ? sender.tab.url : 'unknown',
      threats: message.threats,
      riskLevel: message.risk_level
    });
    
    // Show notification
    browser.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'SentinelAI Security Alert',
      message: `${message.threats.length} potential threats detected. Risk level: ${message.risk_level}`
    });
  } catch (error) {
    console.error('SentinelAI: Error handling threat detection:', error);
  }
}

// Set up declarative net request rules
function setupDeclarativeNetRequest() {
  try {
    // Update rules when extension is installed or updated
    browser.runtime.onInstalled.addListener(() => {
      try {
        // Get the rules from storage or use defaults
        browser.storage.local.get('declarativeNetRequestRules').then(rules => {
          if (rules && rules.declarativeNetRequestRules) {
            // Update the rules
            browser.declarativeNetRequest.updateDynamicRules({
              removeRuleIds: rules.declarativeNetRequestRules.map(rule => rule.id),
              addRules: rules.declarativeNetRequestRules
            }).catch(error => {
              console.error('SentinelAI: Error updating dynamic rules:', error);
            });
          }
        }).catch(error => {
          console.error('SentinelAI: Error getting rules from storage:', error);
        });
      } catch (error) {
        console.error('SentinelAI: Error in onInstalled listener:', error);
      }
    });
  } catch (error) {
    console.error('SentinelAI: Error setting up declarative net request:', error);
  }
}

// Initialize when the extension is loaded
initialize(); 