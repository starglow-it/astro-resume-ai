/**
 * Auto bid content.js code for indeed.com.
 *
 * TODO:
 * 1. Retrieving saved answers for given questions in the form from database.
 * 2. Saving  user answers for given questions
 * 3. Auto-flow page with auto filling form with the answers
 */

// Selectors for form, questions and continueButton
var formSelector = "main";
const questionSelector =
  "main:first input, main:first textarea, main:first select, main:first button";
const continueButtonSelector =
  'main:first button:has(span:contains("Continue"))';
var profileId = null;

// Backend API Base Url
const BACKEND_BASE_URL = "http://localhost:8000";
let autoBidContinue = true;
let isAutoBidOne = false;

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  switch (message.action) {
    case 'autoBidOneReceived':
      isAutoBidOne = true;
      await operateAllInputFields();
      break;

    default:
      break;
  }
});

// Function that retrieve element after the element is fully loaded
async function waitForElement(selector) {
  let element = document.querySelector(selector);
  while (!element) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    element = document.querySelector(selector);
  }
  return element;
}

// Function that dispatch click event on given element
async function simulateClick(element) {
  element.dispatchEvent(
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    })
  );
}

// Function that dispatch keyboard event on given element to fill the input element
async function simulateKeyboardInput(element, value) {
  element.value = value;

  await element.dispatchEvent(
    new Event("input", {
      bubbles: true,
    })
  );
  await element.dispatchEvent(
    new Event("change", {
      bubbles: true,
    })
  );
}

// Function that finds label element for given input element
const findLabelForInput = (input) => {
  // Case 1: Explicit association via 'for' attribute
  var id = $(input).attr("id");
  if (id) {
    var explicitLabel = $('label[for="' + id + '"]');
    if (explicitLabel.length) {
      return explicitLabel.text().trim();
    }
  }

  // Case 2: Implicit association by nesting
  var parentLabel = $(input).closest("label");
  if (parentLabel.length) {
    return parentLabel.text().trim();
  }

  // Case 3: Adjacent elements
  // Previous element
  var prevLabel = $(input).prev("label");
  if (prevLabel.length) {
    return prevLabel.text();
  }
  // Next element
  var nextLabel = $(input).next("label");
  if (nextLabel.length) {
    return nextLabel.text();
  }

  return null;
};

// Function that autofill input element of various input type with given answer
function autoFillAnswer(input, inputType, label, answer) {
  switch (inputType) {
    case "radio":
      if (label.toLowerCase() == answer.toLowerCase()) {
        simulateClick(input);
      }
      break;

    case "checkbox":
      if (label.toLowerCase().includes(answer.toLowerCase())) {
        simulateClick(input);
      }
      break;

    case "select":
      simulateKeyboardInput(
        input,
        $(input).find(`option:contains("${answer}")`).val()
      );
      break;

    case "number":
      simulateKeyboardInput(input, answer);
      break;

    case "text":
      simulateKeyboardInput(input, answer);
      break;

    case "textarea":
      simulateKeyboardInput(input, answer);
      break;

    default:
      break;
  }
}

// Function that retrieves the user-input value of the given input element of various input type
function retrieveUserInputAnswer(input, inputType) {
  // Handle different types of inputs to extract the answer(if any)
  if (
    inputType === "number" ||
    inputType === "text" ||
    inputType === "textarea"
  ) {
    var numberInputValue = $(input).val();
    answer = numberInputValue ? numberInputValue : null;
  }

  if (inputType === "radio") {
    var selectedRadio = $(input)
      .parent()
      .parent()
      .find("input[type=radio]:checked + span")
      .text()
      .trim();
    answer = selectedRadio ? selectedRadio : null;
  }

  if (inputType === "checkbox") {
    var selectedCheckboxes = $(input)
      .parent()
      .parent()
      .find("input[type=checkbox]:checked + span")
      .map(function () {
        return $(this).text().trim();
      })
      .toArray();
    answer =
      selectedCheckboxes.length > 0 ? selectedCheckboxes.join(",") : null;
  }

  if (inputType === "select") {
    var selectedSelect = $(input)
      .find("option")
      .each((index, option) => option.value == $(input).val())
      .text()
      .trim();
    answer = selectedSelect ? selectedSelect : null;
  }

  return answer;
}

// Function that fetch answer for given question from backend API and return answer
const fetchAnswerForQuestion = async (
  questionText,
  label,
  isOptional,
  inputType,
  input
) => {
  const payload = {
    profile_id: profileId,
    data: {
      question: questionText,
      isOptional: isOptional,
      inputType: inputType,
    },
  };

  try {
    if (payload.question !== null) {
      const response = await fetch(`${BACKEND_BASE_URL}/auto-bid/get-answer/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });


      const response_data = await response.json();
      $(input).attr("data-standard-id", response_data.answer.standard_question);
      const answer = response_data.answer.answer;

      console.log('answer ++++++');
      console.log(answer);
      if (answer) {
        autoFillAnswer(input, inputType, label, answer);
        autoBidContinue = true;
      } else {
        autoBidContinue = false;
        chrome.runtime.sendMessage({ action: 'skipCurrentTab' });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// Function that save user's answers to the database
const saveAnswersForQuestions = async (userAnswers) => {
  const payload = {
    profile_id: profileId,
    data: userAnswers,
  };

  try {
    const response = await fetch(`${BACKEND_BASE_URL}/auto-bid/save-answers/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const response_data = await response.json();

  } catch (error) {
    console.log(error);
  }
};

// Function that is called when the form is detected.
// This is used to give click event listener to continue button
const onFormLoaded = async () => {
  setTimeout(() => {
    $(continueButtonSelector).click(async () => {
      // Code to execute when button is clicked
      await operateAllInputFields("save_answers")();
    });
  }, 300);
};

const handleClickContinueBtn = (btnQuery) => {
  const buttons = document.querySelectorAll(btnQuery);

  if (buttons.length > 0) {
    const buttonsArray = Array.from(buttons);  // Convert NodeList to Array
    const activeBtnIndex = buttonsArray.findIndex(button => {
      // Do something with each button, such as logging its text content
      const computedStyle = window.getComputedStyle(button);

      // Check if the display property is 'flex' and the text content is 'Continue'
      if (computedStyle.display === 'flex' && button.textContent === 'Continue') {
        return true;
      } else {
        return false;
      }
    });

    if (activeBtnIndex !== -1) {
      console.log('click continue button +++++++');
      buttons[activeBtnIndex].click();

      setTimeout(async () => { await operateAllInputFields("fill_answer")(); }, 3000);
    }
  }
};

const handleClickApplyBtn = () => {
  const maxWaitTime = 10000;
  const intervalTime = 1000;
  let elapsedTime = 0;

  const checkInterval = setInterval(() => {
    const button = document.querySelector('#indeedApplyButton');
    console.log(button);
    if (button) {
      button.click();
      clearInterval(checkInterval);
      setTimeout(async () => {
        await operateAllInputFields("fill_answer")();
      }, 3000);
    } else {
      elapsedTime += intervalTime;
      if (elapsedTime > maxWaitTime) {
        clearInterval(checkInterval);
      }
    }
  }, intervalTime);
};

/**
 * Main operation function for input fields. This fills answers or save answers based on 'command' parameter
 * @param {string} command -  'fill_answer' or 'save_answers'
 * @return {void}
 *  */
const operateAllInputFields = (command) => async () => {
  try {
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });

    const currentUrl = window.location.href || '';

    if (location.href.includes('www.indeed.com/viewjob' )) {
      handleClickApplyBtn();
    }

    if (currentUrl.includes('smartapply.indeed.com/beta/indeedapply/form/resume')) {
      const element = document.querySelector('[data-testid="FileResumeCard-label"]');

      element.dispatchEvent(clickEvent);
      handleClickContinueBtn('div.ia-BasePage-footer button');
    }

    if (
      currentUrl.includes('smartapply.indeed.com/beta/indeedapply/form/work-experience') ||
      currentUrl.includes('smartapply.indeed.com/beta/indeedapply/form/questions') ||
      currentUrl.includes('smartapply.indeed.com/beta/indeedapply/form/qualification-questions')
    ) {
      let userAnswers = [];
      // Iterate over each input and print its label
      for (const input of $(
        "main:first input, main:first textarea, main:first select"
      )) {
        let groupLabel = "";
        let label = "";

        // For radio buttons and checkboxes within a fieldset
        if (input.type === "radio" || input.type === "checkbox") {
          const fieldset = input.closest("fieldset");

          // Retrieve group label
          if (fieldset) {
            const legend = fieldset.querySelector("legend");
            if (legend) {
              groupLabel = legend.textContent.trim();
            } else {
              const label = $(fieldset).siblings("label");
              if (label.length) {
                groupLabel = label.text().trim();
              }
            }
          }

          // Adjacent label element for radio/checkbox
          label = findLabelForInput(input);
        } else {
          // For other inputs like text, select, etc.
          groupLabel = findLabelForInput(input);
        }

        var inputType;

        // Retrieve input type
        if (input.tagName.toLowerCase() === "input") {
          inputType = input.type; // This will be 'text', 'radio', 'checkbox', etc.
        } else {
          inputType = input.tagName.toLowerCase(); // This will be 'textarea', 'select', 'button'
        }

        // Retrieve isOption value
        var isOptional = groupLabel.includes("(optional)");

        if (command === "fill_answer") {
          await fetchAnswerForQuestion(
            groupLabel,
            label,
            isOptional,
            inputType,
            input
          );
        } else if (command === "save_answers") {
          if (
            !userAnswers.find((userAnswer) => userAnswer.question === groupLabel)
          ) {
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

      if (autoBidContinue) {
        handleClickContinueBtn('div.ia-BasePage-footer button');
      } else {
        console.log('-!- CEASE auto bidding. Complete missing answers and click auto bid button to proceed. -!-');
      }
    }

    if (currentUrl.includes('smartapply.indeed.com/beta/indeedapply/form/review')) {
      const submitBtn = document.querySelector('div.ia-BasePage-footer button');
      submitBtn.click();
    }
  } catch (error) {
    console.error(error);
  }
};

/**
 * Main function to start the observer
 * @return {void}
 *  */
(function () {
  // Options for the observer (which mutations to observe)
  var config = { attributes: false, childList: true, subtree: true };
  var debounceTimer;

  // Callback function to execute when mutations are observed
  var callback = function (mutationsList, observer) {
    for (var mutation of mutationsList) {
      if (mutation.type === "childList") {
        var form = $(formSelector);
        var questions = $(questionSelector);
        if (form.length > 0 && questions.length > 0) {
          clearTimeout(debounceTimer);
          // observer.disconnect(); // Stop observing
          debounceTimer = setTimeout(async () => {
            await onFormLoaded(); // Call the function only if no more mutations within 300ms
          }, 500); // Debounce time is set to 300ms
          break; // Exit the loop
        }
      }
    }
  };

  // Create an observer instance linked to the callback function
  var observer = new MutationObserver(callback);

  // Function to start observing
  const startObserving = () => {
    observer.observe(document.body, config);
    console.log("Observation started/restarted...");

    // Retrieve profile ID from local storage
    chrome.storage.local.get(["currentId"], function (result) {
      profileId = result.currentId;
      console.log("Profile ID retrieved: ", profileId);
    });
  };
  startObserving();
  urlChangeHandler();

  //For url change
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  let intervalId;

  async function urlChangeHandler() {
    console.log('URL changed to:', location.href);
    // Add your code to handle the URL change here

    // If the condition is met, clear the interval
    if (location.href.includes('www.indeed.com/viewjob' || isAutoBidOne)) {
      isAutoBidOne = false;
      handleClickApplyBtn();
    }

    if (location.href.includes('smartapply.indeed.com/beta/indeedapply/form/resume')) {
      await operateAllInputFields("fill_answer")();
    }

    if (location.href.includes('smartapply.indeed.com/beta/indeedapply/form/review')) {
      await operateAllInputFields("fill_answer")();
    }

    if (location.href.includes('smartapply.indeed.com/beta/indeedapply/form/post-apply')) {
      clearInterval(intervalId);
      chrome.runtime.sendMessage({ action: 'closeTab' });
    }
  }

  // Override pushState
  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    urlChangeHandler();
  };

  // Override replaceState
  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    urlChangeHandler();
  };

  // Listen for popstate event
  window.addEventListener('popstate', urlChangeHandler);

  // Check URL periodically to catch changes that might not be detected
  let lastUrl = location.href;
  intervalId = setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      urlChangeHandler();
    }
  }, 2000);
})();
