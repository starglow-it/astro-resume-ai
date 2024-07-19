let isSidePanelOpen = false;
let autoBidUrls = [];
let autoBidUrlIndex = 0;

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
    if (autoBidUrls[autoBidUrlIndex]) {
      chrome.runtime.sendMessage({ action: 'openTab', url: autoBidUrls[autoBidUrlIndex] });
      autoBidUrls.splice(autoBidUrlIndex, 1);
      urlLoadButton.disabled = true;
    }
  });

  autoBidButtonForOne.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: 'autoBidOne' });
  });

  urlLoadButton.addEventListener("click", () => {
    autoBidUrls = [
      'https://www.indeed.com/viewjob?cmp=LDIntelligence%2C-LLC&t=Full+Stack+Developer&jk=ee982b480e17489b&xpse=SoDy67I3-jrvygX3aZ0LbzkdCdPP&xfps=f8c3c1d5-6ca9-4e19-8345-a6cdc5cac3d5&xkcb=SoCz67M3-jrWnl3Rih0KbzkdCdPP&vjs=3',
      'https://www.indeed.com/viewjob?jk=19b0a7ec42691b14&q=full+stack+developer&l=United+States&tk=1i31jb3bagspc86s&from=web&advn=6475025982533837&adid=429855787&ad=-6NYlbfkN0CXgJ4cmw-9k5cRnN775kDXYUer3cJYbqIJLFHy9v_PRxWUa6hE-3wmcZwfhY79Ye1PqwVCzGC8T4De9hoLze0FXq73dqPnSuowy9id8-DGNIXllsaqMragUy_ApV4LjOIX8yALXaDhAJd6lh6MJwNm1BcZPj8AThP2fWXqtamISppxiQkrYWJHrogODvFLSkIpkNdXKEIt4doI4M26OW6BdZ1-Ljaf64xmF4zGgA5l83Ch3RVKCyichjLQE-AWShUe7vxALzboBQiNph6PnTTwl5pkLFl1ZhiqVzC9K9q8tTV7NCOckC9HAGl_7iX_OWEbE6fDIV0MVJnYlghdohkPfS__MxQrEp0vmpPIsaUJBvENQawa5dYKnJQ-sqpM-msWYYyVP5lnBqLvCI91ypKdr6JIm5eMb2ulPyryzJatzYg2_Qk7mO2uhnqZlbsbvUmU7axGwSyfCTlJtxDehDKVMKNQvTCu1dA0DMcrfi9FQG6ObDhsFJtDMdz4LI3LyPGT9AVv4L8-wwBiNtsMbD4c&pub=4a1b367933fd867b19b072952f68dceb&camk=4HOcmqOLYrCqXfA7eJNarQ%3D%3D&xkcb=SoDR6_M3-hujqU2Rwx0ObzkdCdPP&xpse=SoA36_I3-jNv_Gx8W50IbzkdCdPP&xfps=4860f0a6-d443-4c22-a3c9-6e5f0984531f&vjs=3'
    ];

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
      autoBidUrlIndex++;

      if (autoBidUrls[autoBidUrlIndex]) {
        chrome.runtime.sendMessage({ action: 'openTab', url: autoBidUrls[autoBidUrlIndex] });
      } else {
        autoBidUrlIndex = -1;
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
  // chrome.runtime.sendMessage({ action: 'pageReloaded' });
});

