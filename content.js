// Store observer reference for cleanup
let observer = null;

// Function to create and show warning
function showWarning(message) {
  const warningDiv = document.createElement('div');
  warningDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #ff4444;
    color: white;
    padding: 15px;
    border-radius: 5px;
    z-index: 10000;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  `;
  warningDiv.textContent = message;
  document.body.appendChild(warningDiv);
  
  // Remove the warning after 5 seconds
  setTimeout(() => {
    warningDiv.remove();
  }, 5000);
}

// Monitor file uploads
document.addEventListener('change', function(event) {
  if (event.target.type === 'file') {
    const files = event.target.files;
    if (files.length > 0) {
      const confirmUpload = confirm(
        'Warning: Are you sure you want to upload this document? ' +
        'The content might be processed and stored by ChatGPT. ' +
        'Please ensure you are not uploading sensitive or confidential information.'
      );
      
      if (!confirmUpload) {
        event.target.value = '';
      }
    }
  }
});

// Monitor text input for language assessment
function setupTextInputMonitoring() {
  const textInputs = document.querySelectorAll('textarea, input[type="text"]');
  textInputs.forEach(input => {
    input.addEventListener('input', function(event) {
      const text = event.target.value.toLowerCase();
      
      // Check for test keyword "bazinga"
      if (text.includes('bazinga')) {
        showWarning('⚠️ Warning: Inappropriate language detected!');
      }
    });
  });
}

// Monitor for potential prompt leaking
function setupPromptLeakMonitoring() {
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            const text = node.textContent.toLowerCase();
            const promptLeakPatterns = [
              /system prompt/i,
              /initial prompt/i,
              /base prompt/i,
              /core instructions/i
            ];
            
            if (promptLeakPatterns.some(pattern => pattern.test(text))) {
              browser.runtime.sendMessage({
                type: 'promptLeak',
                content: text
              }).catch(error => console.error('Error sending message:', error));
            }
          }
        });
      }
    });
  });

  // Start observing the chat container
  const chatContainer = document.querySelector('main');
  if (chatContainer) {
    observer.observe(chatContainer, {
      childList: true,
      subtree: true
    });
  }

  return observer;
}

// Initialize monitoring
function initialize() {
  setupTextInputMonitoring();
  observer = setupPromptLeakMonitoring();
}

// Cleanup function
function cleanup() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

// Initialize when the page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Cleanup when the page is unloaded
window.addEventListener('unload', cleanup); 