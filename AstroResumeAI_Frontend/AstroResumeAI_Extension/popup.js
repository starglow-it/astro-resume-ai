import { validateEmail, validatePassword } from './customJs/custom.js';

//Global variable
var selectedResumeId = '';
var jobTitle = '';
var jobDescription = '';
var renderedResumeUrl = '';
var errorForSupport = '';
const titleSelector = document.getElementById('titleSelector');
const descriptionSelector = document.getElementById('descriptionSelector');

document.addEventListener('DOMContentLoaded', function () {

  chrome.storage.sync.get('isAuthenticated', function (data) {
    const isAuthenticated = data.isAuthenticated;

    if (isAuthenticated) {
      handleLogInSuccess();
    }
  });
});

function updateInputValue(element, newValue) {
  element.value = newValue;
  const event = new Event('valueChange', { bubbles: true });
  element.dispatchEvent(event);
}

// Event listener to detect input changes
titleSelector.addEventListener('valueChange', function (event) {
  jobTitle = event.target.value;
  console.log('Input value changed:', event.target.value);
});

descriptionSelector.addEventListener('valueChange', function (event) {
  jobDescription = event.target.value;
  console.log('Input value changed:', event.target.value);
});

//Auth Actions
const handleLogInSuccess = () => {
  document.getElementById("main-board").style.display = "block";
  document.getElementById("login-board").style.display = "none";
};

document.getElementById("login-btn").addEventListener('click', async function () {
  document.getElementById("sign-up-instead").disabled = true;

  let isValidated = true;

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  if (!validatePassword(password)) {
    document.getElementById('login-error-msg').innerText = 'Invalid Password';
    isValidated = false;
  }

  if (!validateEmail(email)) {
    document.getElementById('login-error-msg').innerText = 'Invalid email';
    isValidated = false;
  }

  if (isValidated) {
    document.getElementById('login-error-msg').innerText = '';
    this.innerHTML = `
    <div class="preloader-wrapper small active">
      <div class="spinner-layer spinner-green-only spinner-white">
        <div class="circle-clipper left">
          <div class="circle"></div>
        </div>
        <div class="gap-patch">
          <div class="circle"></div>
        </div>
        <div class="circle-clipper right">
          <div class="circle"></div>
        </div>
      </div>
    </div>
  `;

    try {
      // const response = await fetch('http://localhost:8000/login', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ email, password })
      // });

      // if (response.ok || true) {
      if (true) {
        const isChecked = document.getElementById("remember-me").checked;

        if (isChecked) {
          chrome.storage.sync.set({ isAuthenticated: true });
        }
        // Change button content to success icon
        this.innerHTML = `<i class="material-icons">done</i>`;
        setTimeout(handleLogInSuccess, 1500);
      } else {
        throw new Error('Something went wrong');
      }
    } catch (error) {
      document.getElementById('login-error-msg').innerText = 'Something went wrong. Please try again.';
      this.innerText = "LOGIN";
    }
  }
});

document.getElementById("login-email").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById("login-password").focus();
  }
});

document.getElementById("login-password").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById("login-btn").click();
  }
});

document.getElementById("sign-up-instead").addEventListener("click", function () {
  chrome.tabs.create({ url: 'https://example.com' });
});


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
// document.getElementById('save').addEventListener('click', () => {
//   const titleSelector = document.getElementById('titleSelector').value;
//   const descriptionSelector = document.getElementById('descriptionSelector').value;

//   chrome.tabs.query({
//     active: true,
//     currentWindow: true
//   }, (tabs) => {
//     const url = new URL(tabs[0].url);
//     const hostname = url.hostname;

//     // Save the selectors for the current site
//     chrome.storage.local.set({
//       [hostname]: {
//         titleSelector,
//         descriptionSelector
//       }
//     }, () => {
//       console.log('Selectors saved for ' + hostname);
//       M.toast({
//         html: 'Selectors saved!'
//       }); // Assuming MaterializeCSS is properly loaded
//     });
//   });
// });

// Function to fetch resumes and populate dropdown
async function fetchResumes() {
  try {
    const response = await fetch('http://localhost:8000/api/resumes');

    if (response) {
      const resumes = await response.json();
      const selectElement = document.getElementById('resume-select');

      if (Array.isArray(resumes) && resumes.length > 0) {
        resumes.forEach(resume => {
          const option = document.createElement('option');
          option.value = resume.id; // Assuming each resume has an 'id' field
          option.textContent = resume.personal_information.name; // Assuming each resume has a 'name' field
          selectElement.appendChild(option);
        });
        selectedResumeId = resumes[0]['id'];
      }
      var elems = document.querySelectorAll('select');
      M.FormSelect.init(elems);
    }
  } catch (error) {
    return;
  }
}

document.getElementById('titleSelector').addEventListener('change', function (event) {
  console.log(event.target.value)
  jobTitle = event.target.value;
  console.log(jobTitle)
});

document.getElementById('descriptionSelector').addEventListener('change', function () {
  jobDescription = this.value;
});

document.getElementById('resume-select').addEventListener('change', function (event) {
  if (event.target.value) {
    selectedResumeId = event.target.value;
  }
});

document.getElementById('generate-resume-btn').addEventListener('click', async function () {
  try {
    if (selectedResumeId && jobTitle && jobDescription) {
      this.innerHTML = `
    <div class="preloader-wrapper small active">
      <div class="spinner-layer spinner-green-only spinner-white">
        <div class="circle-clipper left">
          <div class="circle"></div>
        </div>
        <div class="gap-patch">
          <div class="circle"></div>
        </div>
        <div class="circle-clipper right">
          <div class="circle"></div>
        </div>
      </div>
    </div>
  `;
      const response = await fetch("http://localhost:8000/api/generate-resume/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resume_id: selectedResumeId,
          job_url: 'value2',
          title: jobTitle,
          job_description: jobDescription
        })
      });

      if (response.ok) {
        const { url } = await response.json();
        renderedResumeUrl = url;
        this.innerHTML = `<i class="material-icons">done</i>`;
        document.getElementById("download-resume-btn").disabled = false;
      } else {
        throw new Error('something went wrong. Please try again.');
      }
    } else {
      if (!selectedResumeId) {
        document.getElementById("generate-resume-error-msg").innerText = 'Please select your resume.';
      }

      if (!jobTitle || !jobDescription) {
        document.getElementById("generate-resume-error-msg").innerText = 'Please scan job.';
      }
    }
  } catch (error) {
    this.innerHTML = "GENERATE RESUME";
    document.getElementById("generate-resume-error-msg").innerText = error.message;
    console.error(error);
    return;
  }
});

document.getElementById("scan-job-content").addEventListener('click', async function () {
  let jobContentQuery = '';
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, async (tabs) => {
    try {
      const url = new URL(tabs[0].url);
      const hostname = url.hostname;
      // const jobContentQuery = await fetch('http://localhost:8000/get/jobcontentquery');

      jobContentQuery = {
        title: '.jobsearch-JobInfoHeader-title',
        description: '#jobDescriptionText'
      };
      console.log(jobContentQuery);

      if (jobContentQuery.title && jobContentQuery.description) {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
          const response = await chrome.tabs.sendMessage(tabs[0].id, { action: "select_by_classname", className: jobContentQuery });

          if (!!response.jobTitle && !!response.jobDescription) {
            updateInputValue(titleSelector, response.jobTitle);
            document.getElementById('titleSelector').value = response.jobTitle;
            updateInputValue(descriptionSelector, response.jobDescription);
            document.getElementById('descriptionSelector').value = response.jobDescription;
          } else {
            errorForSupport = "Could not find job.";
            document.getElementById("support").style.display = 'block';
          }
        });
      } else {
        errorForSupport = 'Did not getting fetched query from server';
        document.getElementById("support").style.display = 'block';
      }
    } catch (error) {
      errorForSupport = error.message;
      document.getElementById("support").style.display = 'block';
    }
  });
});

document.getElementById('download-resume-btn').addEventListener('click', function () {
  console.log(renderedResumeUrl);
  if (renderedResumeUrl) {
    const link = document.createElement('a');
    link.href = renderedResumeUrl;
    link.download = 'filename.ext';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
});

document.getElementById("support-btn").addEventListener("click", async function () {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const url = new URL(tabs[0].url);
    const hostname = url.hostname;

    M.toast({
      html: 'Thank you for your support. You will get it shortly.'
    });
  });
});

// Call loadSelectors when the popup is opened
document.addEventListener('DOMContentLoaded', () => {
  loadSelectors();
  fetchResumes();

  var elems = document.querySelectorAll('select');
  M.FormSelect.init(elems);
});
