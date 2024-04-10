let isSidePanelOpen = false;

(function () {
  // const link = document.createElement('link');
  // link.rel = 'stylesheet';
  // link.href = chrome.runtime.getURL('styles/content.css');
  // document.head.appendChild(link);
  

  // Create the button
  const button = document.createElement('button');
  button.textContent = 'Astro';
  button.className = 'astro-button';

  // Function to toggle the side panel
  async function closeSidePanel() {
    isSidePanelOpen = false;
    await chrome.runtime.sendMessage({ action: 'closeSidePanel' });
  }

  async function openSidePanel() {
    await chrome.runtime.sendMessage({ action: 'openSidePanel' });
    isSidePanelOpen = true;
  }

  // Add an event listener to toggle the side panel on click
  button.addEventListener('click', async function () {
    if (isSidePanelOpen) {
      await closeSidePanel();
    } else {
      await openSidePanel();
    }
  });

  // Append the button to the body of the webpage
  document.body.appendChild(button);
})();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'select_by_classname':
      const jobTitle = document.querySelector(message.className.title)?.innerText;
      const jobDescription = document.querySelector(message.className.description)?.innerText;
      sendResponse({ jobTitle, jobDescription });
      break;

    case 'sendPanelBehavior':

    default:
      break;
  }
});

let currentUrl = window.location.href;

const observer = new MutationObserver(async (mutationsList, observer) => {
  if (currentUrl !== window.location.href) {
    currentUrl = window.location.href;
    const { jobQueries } = await chrome.storage.local.get(['jobQueries']);
    const jobTitle = document.querySelector(jobQueries.title)?.textContent;
    const jobDescription = document.querySelector(jobQueries.description)?.textContent;

    await chrome.runtime.sendMessage({ action: "jobContentChanged", title: jobTitle, description: jobDescription });
  }
});

window.addEventListener("load", async () => {
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace === 'local' && 'jobQueries' in changes) {
      observer.observe(document.body, { attributes: true, childList: true, subtree: true });
    }
  });

  const { jobQueries } = await chrome.storage.local.get(['jobQueries']);
  if (jobQueries) {
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });
  }
});

window.addEventListener('beforeunload', async function (event) {
  // chrome.runtime.sendMessage({ action: 'pageReloaded' });
});

