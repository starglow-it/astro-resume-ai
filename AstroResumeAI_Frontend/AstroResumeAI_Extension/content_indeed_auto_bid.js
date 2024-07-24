/**
 * Auto bid content.js code for indeed.com.
 *
 * TODO:
 * 1. Retrieving saved answers for given questions in the form from database.
 * 2. Saving user answers for given questions
 * 3. Auto-flow page with auto filling form with the answers
 */

const BACKEND_BASE_URL = "http://localhost:8000";

let autoBidContinue = true;
let isAutoBidOne = false;
let profileId = null;

const selectors = {
  form: "main",
  question: "main:first input, main:first textarea, main:first select, main:first button",
  continueButton: 'main:first button:has(span:contains("Continue"))',
  continueButton2: 'div.ia-BasePage-footer button',
  checkBox: 'input[type=checkbox]:checked + span',
  radio: 'input[type=radio]:checked + span',
  applyButton: '.jobsearch-IndeedApplyButton-newDesign',
  resume: '[data-testid="FileResumeCard-label"]'
};

const urlSelectors = {
  viewJob: 'www.indeed.com/viewjob',
  resume: 'smartapply.indeed.com/beta/indeedapply/form/resume',
  workExp: 'smartapply.indeed.com/beta/indeedapply/form/work-experience',
  questions: 'smartapply.indeed.com/beta/indeedapply/form/questions',
  qualificationQuestions: 'smartapply.indeed.com/beta/indeedapply/form/qualification-questions',
  review: 'smartapply.indeed.com/beta/indeedapply/form/review',
  postApply: 'smartapply.indeed.com/beta/indeedapply/form/post-apply'
};

// Function to retrieve element after it's fully loaded
async function waitForElement(selector) {
  let element = document.querySelector(selector);
  while (!element) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    element = document.querySelector(selector);
  }
  return element;
}

// Function to dispatch click event on an element
function simulateClick(element) {
  element.dispatchEvent(new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    view: window
  }));
}

// Function to dispatch keyboard event on an element to fill the input
function simulateKeyboardInput(element, value) {
  element.value = value;
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

// Function to find the label for an input element
function findLabelForInput(input) {
  const id = $(input).attr("id");
  if (id) {
    const explicitLabel = $(`label[for="${id}"]`);
    if (explicitLabel.length) {
      return explicitLabel.text().trim();
    }
  }

  const parentLabel = $(input).closest("label");
  if (parentLabel.length) {
    return parentLabel.text().trim();
  }

  const prevLabel = $(input).prev("label");
  if (prevLabel.length) {
    return prevLabel.text();
  }

  const nextLabel = $(input).next("label");
  if (nextLabel.length) {
    return nextLabel.text();
  }

  return null;
}

// Function to autofill input elements with given answer
function autoFillAnswer(input, inputType, label, answer) {
  switch (inputType) {
    case "radio":
      if (label.toLowerCase() === answer.toLowerCase()) {
        simulateClick(input);
      }
      break;
    case "checkbox":
      if (label.toLowerCase().includes(answer.toLowerCase())) {
        simulateClick(input);
      }
      break;
    case "select":
      simulateKeyboardInput(input, $(input).find(`option:contains("${answer}")`).val());
      break;
    case "number":
    case "text":
    case "textarea":
      simulateKeyboardInput(input, answer);
      break;
  }
}

// Function to retrieve user-input value from input elements
function retrieveUserInputAnswer(input, inputType) {
  let answer = null;
  if (["number", "text", "textarea"].includes(inputType)) {
    answer = $(input).val() || null;
  } else if (inputType === "radio") {
    answer = $(input).parent().parent().find(selectors.radio).text().trim() || null;
  } else if (inputType === "checkbox") {
    const selectedCheckboxes = $(input).parent().parent().find(selectors.checkBox)
      .map(function () {
        return $(this).text().trim();
      }).toArray();
    answer = selectedCheckboxes.length > 0 ? selectedCheckboxes.join(",") : null;
  } else if (inputType === "select") {
    answer = $(input).find("option:selected").text().trim() || null;
  }
  return answer;
}

// Function to fetch answer for a question from backend API
async function fetchAnswerForQuestion(questionText, label, isOptional, inputType, input) {
  const payload = {
    profile_id: profileId,
    data: {
      question: questionText,
      isOptional: isOptional,
      inputType: inputType,
    },
  };

  try {
    if (payload.data.question) {
      const response = await fetch(`${BACKEND_BASE_URL}/auto-bid/get-answer/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      $(input).attr("data-standard-id", responseData?.answer?.standard_question);
      const answer = responseData?.answer?.answer;

      if (answer) {
        autoFillAnswer(input, inputType, label, answer);
        return true;
      } else {
        autoBidContinue = false;
        return false;
      }
    }
  } catch (error) {
    autoBidContinue = false;
    console.error('Error fetching answer for question:', error);
    return false;
  }
}

// Function to save user answers to the database
async function saveAnswersForQuestions(userAnswers) {
  const payload = {
    profile_id: profileId,
    data: userAnswers,
  };

  try {
    await fetch(`${BACKEND_BASE_URL}/auto-bid/save-answers/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Error saving user answers:', error);
  }
}

// Function to handle form loading and set up event listeners
async function onFormLoaded() {
  setTimeout(() => {
    $(selectors.continueButton).click(async () => {
      await operateAllInputFields("save_answers")();
    });
  }, 300);
}

function handleClickContinueBtn(btnQuery) {
  const buttons = document.querySelectorAll(btnQuery);

  if (buttons.length > 0) {
    const activeBtn = Array.from(buttons).find(button => {
      const computedStyle = window.getComputedStyle(button);
      return computedStyle.display === 'flex' && button.textContent === 'Continue';
    });

    if (activeBtn && autoBidContinue) {
      activeBtn.click();
    }
  }
}

async function handleClickApplyBtn() {
  const maxWaitTime = 10000;
  const intervalTime = 1000;
  let elapsedTime = 0;

  const checkInterval = setInterval(async () => {
    const button = document.querySelector(selectors.applyButton);
    if (button) {
      setTimeout(() => button.click(), 3000);
      clearInterval(checkInterval);
    } else {
      elapsedTime += intervalTime;
      if (elapsedTime > maxWaitTime) {
        clearInterval(checkInterval);
      }
    }
  }, intervalTime);
}

/**
 * Main operation function for input fields. This fills answers or saves answers based on 'command' parameter
 * @param {string} command -  'fill_answer' or 'save_answers'
 */
const operateAllInputFields = (command) => async () => {
  try {
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });

    const currentUrl = window.location.href || '';
    const isPageLoaded = await waitForElement('footer');

    if (currentUrl.includes(urlSelectors.viewJob)) {
      handleClickApplyBtn();
    }

    if (currentUrl.includes(urlSelectors.resume)) {
      const element = document.querySelector(selectors.resume);
      element.dispatchEvent(clickEvent);
      handleClickContinueBtn(selectors.continueButton2);
    }

    if (
      (
        currentUrl.includes(urlSelectors.workExp) ||
        currentUrl.includes(urlSelectors.questions) ||
        currentUrl.includes(urlSelectors.qualificationQuestions)
      ) && isPageLoaded
    ) {
      const userAnswers = [];
      const fetchPromises = [];
      for (const input of $(selectors.question)) {
        const fieldset = input.closest("fieldset");
        const legend = fieldset ? fieldset.querySelector("legend") : null;
        const groupLabel = legend ? legend.textContent.trim() : findLabelForInput(input) ?? '';
        const label = input.type === "radio" || input.type === "checkbox" ? findLabelForInput(input) : groupLabel;
        const inputType = input.tagName.toLowerCase() === "input" ? input.type : input.tagName.toLowerCase();
        const isOptional = groupLabel.includes("(optional)");

        if (command === "fill_answer") {
          fetchPromises.push(fetchAnswerForQuestion(groupLabel, label, isOptional, inputType, input));
        } else if (command === "save_answers") {
          const existingAnswer = userAnswers.find(userAnswer => userAnswer.question === groupLabel);
          if (!existingAnswer) {
            userAnswers.push({
              question: groupLabel,
              isOptional: isOptional,
              inputType: inputType,
              answer: retrieveUserInputAnswer(input, inputType),
              standard_question: input.getAttribute("data-standard-id"),
            });
          }
        }
      }

      if (command === "save_answers") {
        await saveAnswersForQuestions(userAnswers);
      }

      if (command === "fill_answer" && isPageLoaded) {
        await Promise.all(fetchPromises);
        if (autoBidContinue) {
          handleClickContinueBtn(selectors.continueButton2);
        } else {
          console.log('-!- CEASE auto bidding. Complete missing answers and click auto bid button to proceed. -!-');
          chrome.runtime.sendMessage({ action: 'autoBidSkipped' });
        }
      }
    }

    if (currentUrl.includes(urlSelectors.review)) {
      const submitBtn = await waitForElement(selectors.continueButton2);
      submitBtn.click();
    }
  } catch (error) {
    console.error('Error operating input fields:', error);
  }
};

/**
 * Main function to start the observer
 */
(function () {
  const config = { attributes: false, childList: true, subtree: true };
  let debounceTimer;

  const callback = function (mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        const form = $(selectors.form);
        const questions = $(selectors.question);
        if (form.length > 0 && questions.length > 0) {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(async () => {
            await onFormLoaded();
          }, 500);
          break;
        }
      }
    }
  };

  const observer = new MutationObserver(callback);

  const startObserving = () => {
    observer.observe(document.body, config);
    console.log("Observation started/restarted...");

    chrome.storage.local.get(["currentId"], function (result) {
      profileId = result.currentId;
      console.log("Profile ID retrieved: ", profileId);
    });
  };
  startObserving();
  urlChangeHandler();

  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  let intervalId;

  async function urlChangeHandler() {
    if (isAutoBidOne) {
      isAutoBidOne = false;
      handleClickApplyBtn();
    }

    if (
      location.href.includes(urlSelectors.viewJob) ||
      location.href.includes(urlSelectors.resume) ||
      location.href.includes(urlSelectors.workExp) ||
      location.href.includes(urlSelectors.questions) ||
      location.href.includes(urlSelectors.qualificationQuestions) ||
      location.href.includes(urlSelectors.review)
    ) {
      setTimeout(async () => { await operateAllInputFields("fill_answer")(); }, 1000);
    }

    if (location.href.includes(urlSelectors.postApply)) {
      clearInterval(intervalId);
      chrome.runtime.sendMessage({ action: 'autoBidCompleted' });
    }
  }

  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    urlChangeHandler();
  };

  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    urlChangeHandler();
  };

  window.addEventListener('popstate', urlChangeHandler);

  let lastUrl = location.href;
  intervalId = setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      urlChangeHandler();
    }
  }, 2000);
})();