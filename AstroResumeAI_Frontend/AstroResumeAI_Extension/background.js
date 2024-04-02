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


