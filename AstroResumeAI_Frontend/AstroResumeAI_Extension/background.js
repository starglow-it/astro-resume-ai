chrome.runtime.onInstalled.addListener(() => {
  console.log('Dynamic Job Scraper installed.');

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getHostname') {
      chrome.tabs.sendMessage(message.tabId, { action: "getHostname" }, (response) => {
        sendResponse(response);
      });
      return true; // Needed to indicate that sendResponse will be called asynchronously
    }
  });
});

