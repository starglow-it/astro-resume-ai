// This function retrieves stored selectors for the current website and updates the popup fields
function loadSelectors() {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, async (tabs) => {
    const url = new URL(tabs[0].url);
    const hostname = url.hostname;

    // Use hostname to retrieve the corresponding selectors from storage
    chrome.storage.local.get([hostname], (result) => {
      if (result[hostname]) {
        const {
          titleSelector,
          descriptionSelector
        } = result[hostname];
        document.getElementById('titleSelector').value = titleSelector || '';
        document.getElementById('descriptionSelector').value = descriptionSelector || '';

        // Re-initialize Materialize input fields to adjust labels for filled values
        M.updateTextFields();
      }
    });
  });
}

// Event listener for the 'Save' button
document.getElementById('save').addEventListener('click', () => {
  const titleSelector = document.getElementById('titleSelector').value;
  const descriptionSelector = document.getElementById('descriptionSelector').value;

  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, (tabs) => {
    const url = new URL(tabs[0].url);
    const hostname = url.hostname;

    // Save the selectors for the current site
    chrome.storage.local.set({
      [hostname]: {
        titleSelector,
        descriptionSelector
      }
    }, () => {
      console.log('Selectors saved for ' + hostname);
      M.toast({
        html: 'Selectors saved!'
      }); // Assuming MaterializeCSS is properly loaded
    });
  });
});


// Event listener for the 'Start Scraping' button
document.getElementById('startScrape').addEventListener('click', () => {
  let resumeId = document.getElementById('resumeSelect').value;

  if (!titleSelector || !descriptionSelector || resumeId === "") {
    // If any field is empty, show an error message and prevent action
    // Otherwise, enable the button
    M.toast({
      html: 'Please fill in all required fields.'
    });
  } else {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "startScraping",
        resumeId
      });
    });
  }
});

// Function to fetch resumes and populate dropdown
async function fetchResumes() {
  const response = await fetch('http://localhost:8000/api/resumes');
  const resumes = await response.json();
  const selectElement = document.getElementById('resumeSelect');

  resumes.forEach(resume => {
    const option = document.createElement('option');
    option.value = resume.id; // Assuming each resume has an 'id' field
    option.textContent = resume.personal_information.name; // Assuming each resume has a 'name' field
    selectElement.appendChild(option);
  });
  var elems = document.querySelectorAll('select');
  var instances = M.FormSelect.init(elems);

  function checkFieldsAndToggleButton() {
    var titleSelector = document.getElementById('titleSelector').value.trim();
    var descriptionSelector = document.getElementById('descriptionSelector').value.trim();
    var resumeSelect = document.getElementById('resumeSelect').value;

    // If any field is empty, keep the button disabled
    if (!titleSelector || !descriptionSelector || resumeSelect === "") {
      document.getElementById('startScrape').disabled = true;
    } else {
      // Otherwise, enable the button
      document.getElementById('startScrape').disabled = false;
    }
  }
  // Add event listeners to input fields and select for any changes
  document.getElementById('titleSelector').addEventListener('input', checkFieldsAndToggleButton);
  document.getElementById('descriptionSelector').addEventListener('input', checkFieldsAndToggleButton);
  document.getElementById('resumeSelect').addEventListener('change', checkFieldsAndToggleButton);
  // Initial check in case values are pre-filled or persisted
  checkFieldsAndToggleButton();

}

// Call loadSelectors when the popup is opened
document.addEventListener('DOMContentLoaded', () => {
  loadSelectors();
  fetchResumes();
  // Other initialization code...
});