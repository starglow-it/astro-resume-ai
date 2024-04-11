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
var resumesGlobal = [];
const titleSelector = document.getElementById('titleSelector');
const descriptionSelector = document.getElementById('descriptionSelector');

function setInitialStatus() {
  document.getElementById('login-board').style.display = 'block';
  document.getElementById('scan-job-board').style.display = 'none';
  document.getElementById('navbar').style.display = 'none';
  document.getElementById('score-board').style.display = 'none';
  document.getElementById('support').style.display = 'none';
  document.getElementById('no-item-text').innerText = '';
  document.getElementById('func-btns').style.display = 'none';
  document.querySelectorAll('.custom-collection-item').forEach(function (item) {
    item.remove();
  });
  document.getElementById('login-btn').innerText = 'LOGIN';
  document.getElementById('profile-board').style.display = 'none';
}

async function handleLogout() {
  await chrome.storage.local.remove(['isAuthorized', 'token']);
  setInitialStatus();
}

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
          const selectUl = document.querySelector('.select-wrapper .dropdown-content');
          const liElements = selectUl.getElementsByTagName('li');

          for (var i = 0; i < selectEl.options.length; i++) {
            if (selectEl.options[i].value === selectedResumeId) {
              selectEl.value = liElements[i].innerText;
              selectEl.selectedIndex = i;
              const event = new Event('change', { bubbles: true });

              selectEl.dispatchEvent(event);
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

//display resumes to select element
function displayResumes(resumes) {
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
  } else {
    selectElement.innerHTML = '<option value="" disabled selected>No resumes found</option>';
    defaultResumes = [];
    document.getElementById('score-preloader').style.display = 'none';
    document.getElementById('no-item-text').innerHTML = 'No resumes found. You need to create a resume first on the <a href="http://localhost:3000/add-profile/">main page</a>.';
  }

  var elems = document.querySelectorAll('select');
  M.FormSelect.init(elems);
}

function attachProfile(resume) {
  if (resume) {
    let profileBoard = document.getElementById("profile-board");

    let profileInfo = `
        <h6>Contact info</h6>
        <p class="title">${resume.name}</p>
        <p>${resume.recent_role}</p>
        <p>${resume.email}</p>
        <p>${resume.phone}</p>
        <p>${resume.location}</p>
    `;

    if (resume.linkedin) {
      profileInfo += `<p>${resume.linkedin}</p>`;
    }

    if (resume.website) {
      profileInfo += `<p>${resume.website}</p>`;
    }

    if (resume.github) {
      profileInfo += `<p>${resume.github}</p>`;
    }

    profileInfo += `
      <hr>
      <h6>Summary</h6>
        <p>${resume.summary}</p>
      <hr>
    `;

    profileInfo += "<h6>Education</h6>";

    resume.education.forEach(edu => {
      profileInfo += `
      <p class="title">${edu.education_level} - ${edu.major}</p>
      <p>${edu.university}</p>
      <p>${edu.graduation_year}</p>
  `;
    });

    profileInfo += "<hr><h6>Experience</h6>";

    for (const exp of resume.experience) {
      profileInfo += `
        <p class="title">${exp.job_title}</p>
        <p>${exp.company}</p>
        <p>${exp.location}</p>
        <p>${exp.duration}</p>
    `;

      for (const desc of exp.description) {
        profileInfo += `<p>- ${desc}</p>`;
      }
    }

    profileBoard.innerHTML = profileInfo;

    profileBoard.addEventListener('click', function (event) {
      const target = event.target;

      if ((target.tagName === 'P')) {
        navigator.clipboard.writeText(target.textContent).then(() => {
          console.log('Text copied to clipboard');
        }).catch(err => {
          console.error('Failed to copy text: ', err);
        });
      }
    });


  }
}

//fetch resumes from db
async function fetchResumes(token) {
  try {
    if (token) {
      const response = await fetch(`http://localhost:8000/profile/get-list/`, {
        method: 'GET',
        headers: {
          'authorization': `token ${token}`
        }
      });

      if (response.ok) {
        const resumes = await response.json();
        console.log(resumes);
        attachProfile(resumes[0]);
        displayResumes(resumes);
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

async function toggleScoreBoard(isShow) {
  const scoreBoard = document.getElementById("score-board");
  const scoreNavItem = document.getElementById("score-nav-item");

  const isAuthenticated = await chrome.storage.local.get('isAuthorized');

  if (isAuthenticated) {
    if (isShow) {
      scoreBoard.style.display = "block";
      scoreNavItem.style.backgroundColor = '#9155FD';
      scoreNavItem.style.color = 'white';
      document.getElementById('refresh-btn').style.display = 'block';
    } else {
      scoreBoard.style.display = "none";
      scoreNavItem.style.backgroundColor = 'white';
      scoreNavItem.style.color = 'black';
      document.getElementById('refresh-btn').style.display = 'none';
    }
  }
}

async function toggleScanJobBoard(isShow) {
  const scanJobBoard = document.getElementById("scan-job-board");
  const scanJobNavItem = document.getElementById("scan-job-nav-item");

  const isAuthenticated = await chrome.storage.local.get('isAuthorized');

  if (isAuthenticated) {
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
}

async function toggleProfileBoard(isShow) {
  const profileBoard = document.getElementById("profile-board");
  const profileNavItem = document.getElementById("profile-nav-item");

  const isAuthenticated = await chrome.storage.local.get('isAuthorized');

  if (isAuthenticated) {
    if (isShow) {
      profileBoard.style.display = "block";
      profileNavItem.style.backgroundColor = '#9155FD';
      profileNavItem.style.color = 'white';
      document.getElementById('refresh-btn').style.display = 'block';
    } else {
      profileBoard.style.display = "none";
      profileNavItem.style.backgroundColor = 'white';
      profileNavItem.style.color = 'black';
      document.getElementById('refresh-btn').style.display = 'none';
    }
  }
}

//handle login success
const handleLogInSuccess = async (isRemember = false, tokenParam = '') => {
  let token = tokenParam;

  if (!tokenParam) {
    const data = await chrome.storage.local.get('token');
    token = data.token;
  }

  if (!token) {
    // Handle missing token
    setInitialStatus();
    return;
  }

  await fetchResumes(token);

  document.getElementById("navbar").style.display = "flex";
  document.getElementById("func-btns").style.display = "flex";
  document.getElementById("login-board").style.display = "none";
  toggleScoreBoard(true);

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = new URL(tabs[0].url);
  const hostname = url.hostname;

  const response = await fetch(`http://localhost:8000/api/job_queries/${hostname}`);

  if (!response.ok) {
    // Handle API request failure
    return;
  }

  const jsonResponse = await response.json();
  jobContentQuery.title = jsonResponse.title_query || '';
  jobContentQuery.description = jsonResponse.description_query || '';

  const jobData = await chrome.tabs.sendMessage(tabs[0].id, { action: "select_by_classname", className: jobContentQuery });

  if (!!jobData.jobDescription) {
    updateScores({ isLoading: true, scores: {} });
    const requestData = {
      description: jobData.jobDescription
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
      document.getElementById('no-item-text').display = "none";
      updateScores({ isLoading: false, scores: data.scores });
    } else {
      // Handle API request failure
      updateScores({ isLoading: false, scores: {} });
      return;
    }
  }
  await chrome.storage.local.set({ jobQueries: jobContentQuery });
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
        setTimeout(async () => await handleLogInSuccess({ tokenParam: key }), 1500);
      } else {
        throw new Error('login_fail');
      }
    } catch (error) {
      document.getElementById('login-error-msg').innerText = 'Login failed. Please try again.';
      this.innerText = "LOGIN";
    }
  }
});

document.getElementById("logout-btn").addEventListener('click', handleLogout);

//Navbar actions
document.getElementById("scan-job-nav-item").addEventListener('click', function (event) {
  event.preventDefault();
  toggleScoreBoard(false);
  toggleProfileBoard(false);
  toggleScanJobBoard(true);
});

document.getElementById("score-nav-item").addEventListener('click', async function (event) {
  event.preventDefault();
  toggleScanJobBoard(false);
  toggleProfileBoard(false);
  toggleScoreBoard(true);

  if (isResumeGenerated) {
    document.getElementById("download-resume-btn").innerText = 'DOWNLOAD';
    document.getElementById("download-resume-btn").disabled = true;
    document.getElementById('generate-resume-btn').innerText = 'GENERATE RESUME';
    isResumeGenerated = false;
  }
});

document.getElementById("profile-nav-item").addEventListener('click', function (event) {
  event.preventDefault();
  toggleScanJobBoard(false)
  toggleScoreBoard(false);
  toggleProfileBoard(true);


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
      // Update button to show loading state
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

      // Wrap chrome.tabs.query in a promise and await its resolution for jobUrl
      const jobUrl = await new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "get_job_url" }, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });
      });

      // Proceed with fetching and handling the response
      const response = await fetch("http://localhost:8000/api/resumes/generate-resume/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resume_id: selectedResumeId,
          job_url: jobUrl,
          title: jobTitle,
          job_description: jobDescription
        })
      });

      if (!response.ok) {
        throw new Error('Something went wrong. Please try again.');
      }

      const { url, score } = await response.json();
      // Update UI upon successful resume generation
      this.innerHTML = `<i class="material-icons">done</i>`;
      const downloadBtn = document.getElementById("download-resume-btn");
      downloadBtn.disabled = false;
      downloadBtn.innerText = `DOWNLOAD ( SCORE: ${Math.round(score * 100)} )`;
      document.getElementById("generate-resume-error-msg").innerText = '';
      this.style.pointerEvents = 'auto';

    } else {
      // Update UI to show error message if preconditions are not met
      if (!selectedResumeId) {
        document.getElementById("generate-resume-error-msg").innerText = 'Please select your resume.';
      } else if (!jobTitle || !jobDescription) {
        document.getElementById("generate-resume-error-msg").innerText = 'Please scan job first.';
      }
    }
  } catch (error) {
    // Handle any errors that occur during the process
    console.error(error);
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
  let { isAuthenticated, token } = await chrome.storage.local.get(['isAuthenticated', 'token']);

  switch (message.action) {
    case "pageReloaded":
      if (isAuthenticated) {
        handleLogInSuccess();
      } else {
        setInitialStatus();
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

document.getElementById('refresh-btn').addEventListener('click', async function () {
  chrome.storage.local.get('isAuthenticated', async function (data) {
    const isAuthenticated = data.isAuthenticated;
    if (isAuthenticated) {
      await handleLogInSuccess();
    } else {
      setInitialStatus();
    }
  });
});

document.addEventListener('DOMContentLoaded', async function () {
  chrome.storage.local.get('isAuthenticated', async function (data) {
    const isAuthenticated = data.isAuthenticated;

    // If user is authenticated, handleLogInSuccess() wikebParmtokenParam: keye called.
    if (isAuthenticated) {
      await handleLogInSuccess();
    } else {
      setInitialStatus();
    }
  });

  await chrome.storage.local.set({ isLoaded: true });
});

document.addEventListener('beforeunload', async function () {
  await chrome.storage.local.set({ isLoaded: false });
})