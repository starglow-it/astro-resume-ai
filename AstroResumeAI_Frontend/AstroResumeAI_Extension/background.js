chrome.runtime.onInstalled.addListener(() => {
  console.log('Dynamic Job Scraper installed.');
});

chrome.runtime.getPlatformInfo(function (info) {
  console.log('Chrome version: ' + Object.entries(info));
});

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  switch (message.action) {
    case 'openSidePanel':
      await chrome.sidePanel.open({ tabId: sender.tab.id });
      await chrome.sidePanel.setOptions({
        tabId: sender.tab.id,
        path: 'sidepanel.html',
        enabled: true
      });

      break;

    case 'closeSidePanel':
      await chrome.sidePanel.setOptions({
        tabId: sender.tab.id,
        path: 'sidepanel.html',
        enabled: false
      });
      await chrome.sidePanel.setOptions({
        tabId: sender.tab.id,
        path: 'sidepanel.html',
        enabled: true
      });
      break;

    case 'openTab':
      chrome.tabs.create({ url: message.url }, (tab) => {
        if (chrome.runtime.lastError) {
          // Handle any errors that might have occurred
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          // Respond with the new tab's information
          sendResponse({ success: true, tabId: tab.id, tabUrl: tab.url });
        }
      });
      break;

    case 'closeTab':
      chrome.tabs.remove(sender.tab.id);
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'openNewTabReceived' });
      });

      break;

    case 'skipCurrentTab':
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'openNewTabReceived' });
      });
      break;

    case "createNewTab":
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'openNewTabReceived' });
      });
      break;

    case "autoBidOne":
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'autoBidOneReceived' });
      });
      break;

    default:
      break;
  }

  return;
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.url) {
    console.log('URL changed to: ' + changeInfo.url);
  }
});


// Add an event listener for tab updates
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // Check if the URL starts with the desired pattern
  if (tab.url && tab.url.startsWith('https://smartapply.indeed.com/beta/indeedapply/form/questions/')) {
    // Check if the DOM content is fully loaded
    if (changeInfo.status === 'complete') {
      // Fetch answers from the backend.
    }
  }
});

