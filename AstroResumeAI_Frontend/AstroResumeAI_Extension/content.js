chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startScraping") {
    console.log('startScraping')
    chrome.storage.local.get([window.location.hostname], (result) => {
      const {
        titleSelector,
        descriptionSelector
      } = result[window.location.hostname] || {};
      if (titleSelector && descriptionSelector) {
        const jobTitle = document.querySelector(titleSelector)?.innerText.trim();
        const jobDescription = document.querySelector(descriptionSelector)?.innerText.trim();
        // You might want to send this information back to your popup or elsewhere
        getResume(message.resumeId, jobTitle, jobDescription);
      } else {
        console.log('No selectors saved for this site.');
      }
    });
  }
});

const getResume = async (resumeId, jobTitle, jobDescription) => {
  
  const response = await fetch('http://localhost:8000/api/generate-resume/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      resume_id: resumeId,
      job_url: window.location.href,
      title: jobTitle,
      job_description: jobDescription
    })
  });

  const responseData = await response.json();
  console.log(responseData);
  // Handle response data...
}