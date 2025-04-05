// Request rate limiting
const requestLimits = {
  windowMs: 60000, // 1 minute
  maxRequests: 100
};

const requestCounts = new Map();

// Monitor network requests using declarativeNetRequest
browser.declarativeNetRequest.onRuleMatchedDebug.addListener(
  function(info) {
    const timestamp = Math.floor(Date.now() / requestLimits.windowMs);
    if (!requestCounts.has(timestamp)) {
      requestCounts.set(timestamp, 1);
    } else {
      const count = requestCounts.get(timestamp);
      requestCounts.set(timestamp, count + 1);
      
      if (count > requestLimits.maxRequests) {
        browser.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Security Alert',
          message: 'High request rate detected.'
        });
      }
    }

    // Clean up old timestamps
    const currentTimestamp = Math.floor(Date.now() / requestLimits.windowMs);
    for (const [key] of requestCounts) {
      if (key < currentTimestamp - 1) {
        requestCounts.delete(key);
      }
    }

    // Check for suspicious patterns in the request
    if (info.request.method === 'POST' && info.request.body) {
      try {
        if (info.request.body.raw && info.request.body.raw[0] && info.request.body.raw[0].bytes) {
          const decoder = new TextDecoder('utf-8');
          const rawData = info.request.body.raw[0].bytes;
          const data = decoder.decode(rawData);
          
          // Check for potential jailbreak attempts
          const jailbreakPatterns = [
            /ignore previous instructions/i,
            /you are now free/i,
            /pretend you are/i,
            /bypass/i
          ];
          
          if (jailbreakPatterns.some(pattern => pattern.test(data))) {
            browser.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon48.png',
              title: 'Security Alert',
              message: 'Potential jailbreak attempt detected!'
            });
          }

          // Check for data poisoning attempts
          const dataPoisonPatterns = [
            /<script>/i,
            /javascript:/i,
            /eval\(/i,
            /document\./i
          ];

          if (dataPoisonPatterns.some(pattern => pattern.test(data))) {
            browser.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon48.png',
              title: 'Security Alert',
              message: 'Potential data poisoning attempt detected!'
            });
          }
        }
      } catch (error) {
        console.error('Error processing request:', error);
      }
    }
  }
);

// Listen for messages from content script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'promptLeak') {
    browser.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Security Alert',
      message: 'Potential prompt leak detected!'
    });
  }
  return true;
}); 