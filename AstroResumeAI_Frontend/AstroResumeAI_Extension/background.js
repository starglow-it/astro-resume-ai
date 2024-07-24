let autoBidUrls = [];
const BACKEND_BASE_URL = "http://localhost:8000";

chrome.runtime.onInstalled.addListener(() => {
  console.log('Dynamic Job Scraper installed.');
});

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.log('Side Panel Error:', error));

// Function to fetch URLs from the backend
async function fetchUrls() {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/auto-bid/get-urls/`);
    const { urls } = await response.json();
    if (urls && urls.length > 0) {
      autoBidUrls = urls;

      return true;
    }

    return false;
  } catch (error) {
    console.log('Error fetching URLs:', error);
    return false;
  }
}

// Function to open a URL and perform tasks
function openNextUrl() {
  if (autoBidUrls.length === 0) return;

  const url = autoBidUrls.shift();
  chrome.tabs.create({ url });
}

// Message listener for handling different actions
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  switch (message.action) {
    case 'autoBidUrlLoad':
      await fetchUrls();
      break;

    case 'autoBidStart':
    case 'autoBidSkipped':
      openNextUrl();
      break;

    case 'autoBidCompleted':
      if (sender.tab) {
        chrome.tabs.remove(sender.tab.id, () => openNextUrl());
      }
      break;

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

    default:
      break;
  }

  return true;
});