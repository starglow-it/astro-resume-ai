let isSidePanelOpen = false;
let autoBidUrls = [];

(function () {
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

  const div = document.createElement('div');
  div.className = "astro-bid-auto-bid-ctrl-panel";

  const buttonWrapperDiv = document.createElement('div');
  buttonWrapperDiv.className = "astro-bid-auto-bid-ctrl-panel-buttonWrapper";

  // Create two buttons
  const autoBidStartButton = document.createElement('button');
  const autoBidButtonForOne = document.createElement('button');
  const urlLoadButton = document.createElement('button');

  // Set button text content
  autoBidStartButton.textContent = 'Start';
  autoBidStartButton.className = "astro-bid-auto-bid-btn";
  autoBidButtonForOne.textContent = 'Start One';
  autoBidButtonForOne.className = "astro-bid-auto-bid-btn";
  urlLoadButton.textContent = 'Load URLs';
  urlLoadButton.className = "astro-bid-auto-bid-btn";

  // Disable the second button initially
  autoBidStartButton.disabled = true;

  // Create a <p> element
  const pElement = document.createElement('p');
  pElement.className = "astro-bid-auto-bid-notification-text";

  // Set initial text content for <p> element
  pElement.textContent = 'Need to load urls.';

  // Append buttons and <p> element to the <div>
  buttonWrapperDiv.appendChild(autoBidButtonForOne);
  buttonWrapperDiv.appendChild(autoBidStartButton);
    buttonWrapperDiv.appendChild(urlLoadButton);
  div.appendChild(buttonWrapperDiv);
  div.appendChild(pElement);

  // Append the <div> to body
  document.body.appendChild(div);

  // Function to check the condition and update elements
  function checkConditionAndUpdate() {
    if (autoBidUrls.length > 0) {
      // Enable the second button
      autoBidStartButton.disabled = false;

      // Update the <p> element text content
      pElement.textContent = 'Urls were loaded.';
    }
  }

  checkConditionAndUpdate();

  autoBidStartButton.addEventListener("click", () => {
    if (autoBidUrls[0]) {
      chrome.runtime.sendMessage({ action: 'openTab', url: autoBidUrls[0] });
      autoBidUrls.shift();
    }
  });

  autoBidButtonForOne.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: 'autoBidOne' });
  });

  urlLoadButton.addEventListener("click", () => {
    autoBidUrls = [];

    if (autoBidUrls.length > 0) {
      autoBidStartButton.disabled = false;
      pElement.textContent = 'Urls were loaded.';
    }
  });
})();

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

    case "openNewTabReceived":
      console.log('received new tab creation ++++');
      console.log(autoBidUrls[0]);
      if (autoBidUrls[0]) {
        chrome.runtime.sendMessage({ action: 'openTab', url: autoBidUrls[0] });
        autoBidUrls.shift();
      }
      break;

    default:
      break;
  }
});

let currentUrl = window.location.href;

const observer = new MutationObserver(async (mutationsList, observer) => {
  if (currentUrl !== window.location.href) {
    try {
      currentUrl = window.location.href;
      const { jobQueries } = await chrome.storage.local.get(['jobQueries']);
      const jobTitle = document.querySelector(jobQueries.title)?.textContent;
      const jobDescription = document.querySelector(jobQueries.description)?.textContent;

      await chrome.runtime.sendMessage({ action: "jobContentChanged", title: jobTitle, description: jobDescription });
    } catch (error) {
      console.error(error);
    }
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
});

