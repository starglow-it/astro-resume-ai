let isSidePanelOpen = false;
let applyButtonQuery = '.jobsearch-IndeedApplyButton-newDesign';
const jobUrlRowSelector = 'div.MuiDataGrid-row[aria-selected="true"]';
const jobUrlCellSelector = 'div.MuiDataGrid-cell';
const jobUrlLinkSelector = 'a';

async function waitForElement(selector) {
  let element = document.querySelector(selector);
  while (!element) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    element = document.querySelector(selector);
  }
  return element;
}

// IIFE to encapsulate the code
(function () {
  // Create the Astro button
  const button = document.createElement('button');
  button.textContent = 'Astro';
  button.className = 'astro-button';

  // Functions to toggle the side panel
  async function closeSidePanel() {
    isSidePanelOpen = false;
    await chrome.runtime.sendMessage({ action: 'closeSidePanel' });
  }

  async function openSidePanel() {
    await chrome.runtime.sendMessage({ action: 'openSidePanel' });
    isSidePanelOpen = true;
  }

  // Toggle the side panel on button click
  button.addEventListener('click', async () => {
    isSidePanelOpen ? await closeSidePanel() : await openSidePanel();
  });

  // Append the Astro button to the body of the webpage
  document.body.appendChild(button);

  // Create the control panel div
  const div = document.createElement('div');
  div.className = "astro-bid-auto-bid-ctrl-panel";

  const buttonWrapperDiv = document.createElement('div');
  buttonWrapperDiv.className = "astro-bid-auto-bid-ctrl-panel-buttonWrapper";

  const autoBidStartButton = document.createElement('button');
  autoBidStartButton.textContent = 'Start';
  autoBidStartButton.className = "astro-bid-auto-bid-btn";

  const autoBidStopButton = document.createElement('button');
  autoBidStopButton.textContent = 'Just Stop';
  autoBidStopButton.className = "astro-bid-auto-bid-btn";

  const urlLoadButton = document.createElement('button');
  urlLoadButton.textContent = 'Load URLs';
  urlLoadButton.className = "astro-bid-auto-bid-btn";

  // Create notification text element
  const pElement = document.createElement('p');
  pElement.className = "astro-bid-auto-bid-notification-text";
  pElement.textContent = 'Need to load URLs.';

  // Append buttons and text to the control panel
  buttonWrapperDiv.appendChild(autoBidStartButton);
  buttonWrapperDiv.appendChild(autoBidStopButton);
  buttonWrapperDiv.appendChild(urlLoadButton);
  div.appendChild(buttonWrapperDiv);
  div.appendChild(pElement);

  // Append the control panel to the body
  document.body.appendChild(div);

  // Event listeners for control buttons
  autoBidStartButton.addEventListener("click", () => {
    try {
      chrome.runtime.sendMessage({ action: 'autoBidStart' });
    } catch (error) {
      console.error('Error sending autoBidStart message:', error);
    }
  });

  autoBidStopButton.addEventListener("click", () => {
    try {
      chrome.runtime.sendMessage({ action: 'autoBidStop' });
    } catch (error) {
      console.error('Error sending autoBidStop message:', error);
    }
  });

  urlLoadButton.addEventListener("click", async () => {
    try {
      const autoBidUrls = window.getSelectedRowHrefs(jobUrlRowSelector, jobUrlCellSelector, jobUrlLinkSelector);
      
      if (autoBidUrls && autoBidUrls.length > 0) {
        const filteredUrls = autoBidUrls.filter(url => url.includes('www.indeed.com'));
        chrome.runtime.sendMessage({ action: 'autoBidUrlLoad', autoBidUrls: filteredUrls });
      }
    } catch (error) {
      console.error('Error sending autoBidUrlLoad message:', error);
    }
  });

})();

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'select_by_classname':
      const jobTitle = document.querySelector(message.className.title)?.innerText;
      const jobDescription = document.querySelector(message.className.description)?.innerText;
      sendResponse({ jobTitle, jobDescription });
      break;

    case 'get_job_url':
      sendResponse(window.location.href);
      break;

    default:
      break;
  }
});

let currentUrl = window.location.href;

// Mutation observer to detect URL changes
const observer = new MutationObserver(async (mutationsList, observer) => {
  if (currentUrl !== window.location.href) {
    currentUrl = window.location.href;
    try {
      // Ensure the extension context is still valid
      if (chrome.storage && chrome.storage.local) {
        const { jobQueries } = await chrome.storage.local.get(['jobQueries']);
        const jobTitle = document.querySelector(jobQueries.title)?.textContent;
        const jobDescription = document.querySelector(jobQueries.description)?.textContent;

        if (chrome.runtime && chrome.runtime.sendMessage) {
          await chrome.runtime.sendMessage({ action: "jobContentChanged", title: jobTitle, description: jobDescription });
        } else {
          console.error('Chrome runtime context is invalid.');
        }
      } else {
        console.error('Chrome storage context is invalid.');
      }
    } catch (error) {
      console.error('Error fetching job content:', error);
    }
  }
});

// Add event listeners for storage changes and page load
window.addEventListener("load", async () => {
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && 'jobQueries' in changes) {
      observer.observe(document.body, { attributes: true, childList: true, subtree: true });
    }
  });

  const { jobQueries } = await chrome.storage.local.get(['jobQueries']);
  if (jobQueries) {
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });
  }
});