import { validateEmail, validatePassword, generateScoreResumeItem } from './customJs/custom.js';

//Global variable
var selectedResumeId = '';
var jobTitle = '';
var jobDescription = '';
var renderedResumeUrl = '';
var errorForSupport = '';
var jobContentQuery = { title: '', description: '' };
var defaultResumes = [];
var defaultResumeId = '';
var scores_g = {};
var isResumeGenerated = false;
const titleSelector = document.getElementById('titleSelector');
const descriptionSelector = document.getElementById('descriptionSelector');

function updateInputValue(element, newValue) {
  element.value = newValue;
  const event = new Event('valueChange', { bubbles: true });
  element.dispatchEvent(event);
}

function handleScore() {
  if (defaultResumes.length > 0) {
    for (const resume of defaultResumes) {
      let score = scores_g[resume.id] || 0;
      generateScoreResumeItem(resume.id, resume.recent_role, score);

      const customCollectionItems = document.querySelectorAll('#score-collection .custom-collection-item');

      customCollectionItems.forEach(item => {
        item.addEventListener('click', function () {
          selectedResumeId = item.getAttribute('data-id');
          toggleScoreBoard(false);
          toggleScanJobBoard(true);
          const selectEl = document.getElementById("resume-select");
          for (var i = 0; i < selectEl.options.length; i++) {
            if (selectEl.options[i].value === selectedResumeId) {
              selectEl.selectedIndex = i;
              break;
            }
          }
        })
      });
    }
  }
}

function updateScores({ isLoading, scores }) {
  if (isLoading) {
    document.getElementById("score-preloader").style.display = "block";
  } else {
    document.getElementById("score-preloader").style.display = "none";
    const aElements = document.querySelectorAll('#score-collection .custom-collection-item');
    aElements.forEach(a => {
      const id = a.getAttribute('data-id');
      let score = scores[id] || 0;
      score = Math.round(score * 100);
      let circumference = 2 * Math.PI * 30;

      let progress_in_pixels = circumference * (100 - score) / 100;
      let progress = a.querySelector(".progress");
      progress.style.strokeDashoffset = progress_in_pixels + 'px';

      // Create the slider value element
      const sliderValue = a.querySelector(".slidervalue");
      sliderValue.style.color = score < 25 ? 'red' : score >= 75 ? '#7df' : 'gold';

      if (score < 25) {
        progress.style.stroke = 'red';
      }
      else if (score >= 75) {
        progress.style.stroke = '#7df';
      }
      else {
        progress.style.stroke = 'gold';
      }

      sliderValue.innerHTML = score + '%';
    });
  }
}

async function fetchResumes(token) {
  try {
    console.log(token);
    if (token) {
      const response = await fetch(`http://localhost:8000/profile/get-list/`, {
        method: 'GET',
        headers: {
          'authorization': `token ${token}`
        }
      });

      if (response) {
        const resumes = await response.json();
        console.log(resumes);
        const selectElement = document.getElementById('resume-select');

        if (Array.isArray(resumes) && resumes.length > 0) {
          defaultResumes = resumes;
          handleScore();

          resumes.forEach(resume => {
            const option = document.createElement('option');
            option.value = resume.id; // Assuming each resume has an 'id' field
            option.textContent = resume.recent_role; // Assuming each resume has a 'name' field
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

// Event listener to detect input changes
titleSelector.addEventListener('valueChange', function (event) {
  jobTitle = event.target.value;
});

descriptionSelector.addEventListener('valueChange', function (event) {
  jobDescription = event.target.value;
});

function toggleScoreBoard(isShow) {
  const scoreBoard = document.getElementById("score-board");
  const scoreNavItem = document.getElementById("score-nav-item");

  if (isShow) {
    scoreBoard.style.display = "block";
    scoreNavItem.style.backgroundColor = '#9155FD';
    scoreNavItem.style.color = 'white';
  } else {
    scoreBoard.style.display = "none";
    scoreNavItem.style.backgroundColor = 'white';
    scoreNavItem.style.color = 'black';
  }
}

function toggleScanJobBoard(isShow) {
  const scanJobBoard = document.getElementById("scan-job-board");
  const scanJobNavItem = document.getElementById("scan-job-nav-item");

  if (isShow) {
    scanJobBoard.style.display = "block";
    scanJobNavItem.style.backgroundColor = '#9155FD';
    scanJobNavItem.style.color = 'white';
  } else {
    scanJobBoard.style.display = "none";
    scanJobNavItem.style.backgroundColor = 'white';
    scanJobNavItem.style.color = 'black';
  }
}

//Auth Actions
const handleLogInSuccess = async (isRemember = false, tokenParam = '') => {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, async (tabs) => {
    const url = new URL(tabs[0].url);
    const hostname = url.hostname;
    const response = await fetch(`http://localhost:8000/api/job_queries/${hostname}`);

    if (response.ok) {
      const jsonResponse = await response.json();
      console.log(jsonResponse);
      jobContentQuery.title = jsonResponse.title_query || '';
      jobContentQuery.description = jsonResponse.description_query || '';

      if (!tokenParam) {
        await chrome.storage.local.get('token', async function (data) {
          console.log(data.token);
          if (data.token) {
            chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
              const jobData = await chrome.tabs.sendMessage(tabs[0].id, { action: "select_by_classname", className: jobContentQuery });

              if (!!jobData.jobDescription) {
                const requestData = {
                  description: jobData.jobDescription
                };

                const response = await fetch('http://localhost:8000/api/resumes/cal_matching_scores/', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'authorization': `token ${data.token}`
                  },
                  body: JSON.stringify(requestData)
                });

                if (response.ok) {
                  const data = await response.json();
                  console.log(data);
                  scores_g = data.scores;
                  updateScores({ isLoading: false, scores: data.scores });
                } else {
                  chrome.storage.local.remove('token', function () {
                    console.log('Token removed');
                  });

                  await chrome.storage.local.set({ isAuthenticated: false });
                  document.getElementById("navbar").style.display = "none";
                  document.getElementById("login-board").style.display = "block";
                  toggleScanJobBoard(false);
                  toggleScoreBoard(false);
                }
              }
            });

            await fetchResumes(data.token);
          }
        })
      }

      updateScores({ isLoading: true, scores: {} });

      await chrome.storage.local.set({ jobQueries: jobContentQuery });
    }
  });

  document.getElementById("navbar").style.display = "flex";
  document.getElementById("login-board").style.display = "none";
  toggleScoreBoard(true);
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
      const response = await fetch('http://localhost:8000/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const { key } = await response.json();

        await chrome.storage.local.set({ isAuthenticated: true, token: key });

        // Change button content to success icon
        this.innerHTML = `<i class="material-icons">done</i>`;
        setTimeout(async () => await handleLogInSuccess(), 1500);
      } else {
        throw new Error('login_fail');
      }
    } catch (error) {
      document.getElementById('login-error-msg').innerText = 'Login failed. Please try again.';
      this.innerText = "LOGIN";
    }
  }
});

//Navbar actions
document.getElementById("scan-job-nav-item").addEventListener('click', function (event) {
  event.preventDefault();
  toggleScanJobBoard(true)
  toggleScoreBoard(false);
});

document.getElementById("score-nav-item").addEventListener('click', async function (event) {
  event.preventDefault();
  toggleScanJobBoard(false)
  toggleScoreBoard(true);

  if (isResumeGenerated) {
    document.getElementById("download-resume-btn").innerText = 'DOWNLOAD';
    document.getElementById("download-resume-btn").disabled = true;
    document.getElementById('generate-resume-btn').innerText = 'GENERATE RESUME';
    isResumeGenerated = false;
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

// Function to fetch resumes and populate dropdown
document.getElementById('titleSelector').addEventListener('change', function (event) {
  jobTitle = event.target.value;
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
      this.style.pointerEvents = 'none';

      const response = await fetch("http://localhost:8000/api/resumes/generate-resume/", {
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
        const { url, score } = await response.json();
        renderedResumeUrl = url;
        this.innerHTML = `<i class="material-icons">done</i>`;
        const downloadBtn = document.getElementById("download-resume-btn");
        downloadBtn.disabled = false;
        downloadBtn.innerText = `DOWNLOAD ( SCORE: ${Math.round(score * 100)} )`;
        document.getElementById("generate-resume-error-msg").innerText = '';
        isResumeGenerated = true;
        this.style.pointerEvents = 'auto';
      } else {
        this.style.pointerEvents = 'auto';
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
    this.style.pointerEvents = 'auto';
    this.innerHTML = "GENERATE RESUME";
    document.getElementById("generate-resume-error-msg").innerText = error.message;
  }
});

document.getElementById("scan-job-content").addEventListener('click', async function () {
  if (isResumeGenerated) {
    document.getElementById("download-resume-btn").innerText = 'DOWNLOAD';
    document.getElementById("download-resume-btn").disabled = true;
    document.getElementById('generate-resume-btn').innerText = 'GENERATE RESUME';
    isResumeGenerated = false;
  }

  document.getElementById("support").style.display = 'none';

  try {
    if (jobContentQuery.title && jobContentQuery.description) {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const response = await chrome.tabs.sendMessage(tabs[0].id, { action: "select_by_classname", className: jobContentQuery });

        if (!!response.jobTitle && !!response.jobDescription) {
          updateInputValue(titleSelector, response.jobTitle);
          document.getElementById('titleSelector').value = response.jobTitle;
          updateInputValue(descriptionSelector, response.jobDescription);
          document.getElementById('descriptionSelector').value = response.jobDescription;
        } else {
          errorForSupport = "not-exist-query-on-db";
          document.getElementById("support").style.display = 'block';
        }
      });
    } else {
      errorForSupport = 'not-get-query-from-server';
      document.getElementById("support").style.display = 'block';
    }
  } catch (error) {
    errorForSupport = error.message;
    document.getElementById("support").style.display = 'block';
  }
});

document.getElementById('download-resume-btn').addEventListener('click', function () {
  if (renderedResumeUrl) {
    const link = document.createElement('a');
    link.href = renderedResumeUrl;
    link.download = 'filename.ext';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.innerText = 'DOWNLOAD';
    this.disabled = true;
    document.getElementById('generate-resume-btn').innerText = 'GENERATE RESUME';
    isResumeGenerated = false;
  }
});

document.getElementById("support-btn").addEventListener("click", async function () {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const url = new URL(tabs[0].url);
    const hostname = url.hostname;
    const requestData = {
      url: hostname,
      content: errorForSupport
    }

    const response = await fetch('http://localhost:8000/api/supports/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (response.ok) {
      M.toast({
        html: 'Thank you for your support. You will get it shortly.'
      });

      document.getElementById("support-text").innerText = "Successfully supported."
      this.disabled = true;
    }
  });
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  let { isAuthenticated, token } = await chrome.storage.local.get('isAuthenticated');

  switch (message.action) {
    case "pageReloaded":
      if (isAuthenticated) {
        handleLogInSuccess();
      } else {
        document.getElementById('login-board').style.display = 'block';
        document.getElementById('navbar').style.display = 'none';
        document.getElementById('scan-job-board').style.display = 'none';
        document.getElementById('score-board').style.display = 'none';
      }

    case 'jobContentChanged':


      if (isAuthenticated && token && message.description) {
        try {
          updateScores({ isLoading: true, scores: {} });
          const requestData = {
            description: message.description
          };

          const response = await fetch('http://localhost:8000/api/resumes/cal_matching_scores/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'authorization': `token ${token}`
            },
            body: JSON.stringify(requestData)
          });

          if (response.ok) {
            const data = await response.json();
            scores_g = data.scores;
            updateScores({ isLoading: false, scores: data.scores });
          }
        } catch (error) {
          console.log(error);
        }
      }
      break;

    default:
      break;
  }
});

document.addEventListener('DOMContentLoaded', async function () {
  chrome.storage.local.get(['isAuthenticated', 'token'], async function (data) {
    const isAuthenticated = data.isAuthenticated;

    if (isAuthenticated) {
      await handleLogInSuccess();
      loadSelectors();
    }
  });

  await chrome.storage.local.set({ isLoaded: true });
});

document.addEventListener('beforeunload', async function () {
  await chrome.storage.local.set({ isLoaded: false });
})