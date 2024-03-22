chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'select_by_classname':
      const jobTitle = document.querySelector(message.className.title)?.innerText;
      const jobDescription = document.querySelector(message.className.description)?.innerText;
      sendResponse({ jobTitle, jobDescription });
      break;

    case 'getHostname':
      const hostname = window.location.hostname;
      sendResponse({ hostname });
      break;

    default:
      break;
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