// Request rate limiting
const requestLimits = {
  windowMs: 60000, // 1 minute
  maxRequests: 100
};

const requestCounts = new Map();

// Monitor network requests
browser.webRequest.onBeforeRequest.addListener(
  function(details) {
    const url = new URL(details.url);
    
    // Check for potential DDoS
    const clientIP = details.ip;
    if (!requestCounts.has(clientIP)) {
      requestCounts.set(clientIP, {
        count: 1,
        timestamp: Date.now()
      });
    } else {
      const clientData = requestCounts.get(clientIP);
      if (Date.now() - clientData.timestamp > requestLimits.windowMs) {
        clientData.count = 1;
        clientData.timestamp = Date.now();
      } else {
        clientData.count++;
        if (clientData.count > requestLimits.maxRequests) {
          browser.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Security Alert',
            message: 'Potential DDoS attack detected. Request rate exceeded.'
          });
          return { cancel: true };
        }
      }
    }

    // Check for suspicious patterns in the request
    if (details.method === 'POST') {
      try {
        const decoder = new TextDecoder('utf-8');
        const rawData = details.requestBody.raw[0].bytes;
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
          return { cancel: true };
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
          return { cancel: true };
        }
      } catch (error) {
        console.error('Error processing request:', error);
      }
    }
  },
  { urls: ["*://*.openai.com/*"] },
  ["blocking", "requestBody"]
); 