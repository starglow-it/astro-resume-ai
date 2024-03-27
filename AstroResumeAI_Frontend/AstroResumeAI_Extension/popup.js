import { validateEmail, validatePassword } from './customJs/custom.js';

//Global variable
var selectedResumeId = '';
var jobTitle = '';
var jobDescription = '';
var renderedResumeUrl = '';
var errorForSupport = '';
var jobContentQuery = { title: '', description: '' };
const titleSelector = document.getElementById('titleSelector');
const descriptionSelector = document.getElementById('descriptionSelector');

//Auth Actions
const handleLogInSuccess = async (isRemember = false) => {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, async (tabs) => {
    const url = new URL(tabs[0].url);
    const hostname = url.hostname;
    const response = await fetch(`http://localhost:8000/api/job_queries/${hostname}`);
    if (response.ok) {
      const jsonResponse = await response.json();
      jobContentQuery.title = jsonResponse.title_query || '';
      jobContentQuery.description = jsonResponse.description_query || '';
    }
  });

  if (!isRemember) {
    chrome.storage.sync.get('userId', async function (data) {
      const userId = data.userId;

      if (userId) {
        await fetchResumes(userId);
      }
    });
  }

  document.getElementById("main-board").style.display = "block";
  document.getElementById("login-board").style.display = "none";
};

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

async function fetchResumes(userId) {
  try {
    if (userId) {
      const response = await fetch(`http://localhost:8000/api/resumes/user/${userId}/`);

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
    }
  } catch (error) {
    return;
  }
}

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
      const response = await fetch('http://localhost:8000/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const { id } = await response.json();
        const isChecked = document.getElementById("remember-me").checked;

        if (isChecked) {
          chrome.storage.sync.set({ isAuthenticated: true, userId: id });
        } else {
          await fetchResumes(id);
        }

        // Change button content to success icon
        this.innerHTML = `<i class="material-icons">done</i>`;
        setTimeout(() => handleLogInSuccess(!isChecked), 1500);
      } else {
        throw new Error('login_fail');
      }
    } catch (error) {
      document.getElementById('login-error-msg').innerText = 'Login failed. Please try again.';
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
  chrome.tabs.create({ url: 'http://localhost:3000/pages/register/' });
});

// document.getElementById("support-btn").addEventListener("click", async function () {
//   chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
//     const url = new URL(tabs[0].url);
//     const hostname = url.hostname;
//     const requestData = {
//       url: hostname,
//       content: errorForSupport
//     }

//     const response = await fetch('http://localhost:8000/api/supports/', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(requestData)
//     });

//     if (response.ok) {
//       M.toast({
//         html: 'Thank you for your support. You will get it shortly.'
//       });

//       document.getElementById("support-text").innerText = "Successfully supported."
//       this.disabled = true;
//     }
//   });
// });

document.getElementById("cal-resume-score").addEventListener('click', async function () {
  if (jobDescription) {

    let { userId } = await chrome.storage.sync.get('isAuthenticated');
    console.log(userId);
    userId = 1;

    if (userId) {
      try {
        const requestData = {
          user_id: userId,
          description: jobDescription
        };
        console.log(requestData);

        const response = await fetch('http://localhost:8000/api/resumes/cal_matching_scores/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        });

        if (response.ok) {
          const scores = await response.json();
          console.log(scores);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
});

document.getElementById('show-sidebar-btn').addEventListener('click', async function () {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  });

  const tabId = tab.id;
  await chrome.sidePanel.open({ tabId });
  await chrome.sidePanel.setOptions({
    tabId,
    path: 'sidepanel.html',
    enabled: true
  });
});