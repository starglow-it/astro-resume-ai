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

  // If no label found
  return "No Label Found";
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

    if (answer) {
      autoFillAnswer(input, inputType, label, answer);
    }
  } catch (error) {
    console.log(error.response.data);
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

    console.log(response_data.message);
  } catch (error) {
    console.log(error.response.data);
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

/**
 * Main operation function for input fields. This fills answers or save answers based on 'command' parameter
 * @param {string} command -  'fill_answer' or 'save_answers'
 * @return {void}
 *  */
const operateAllInputFields = (command) => async () => {
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
};

/**
 * Main function to start the observer
 * @return {void}
 *  */
(function () {
  // Create job bid start button
  const startButton = document.createElement("button");
  startButton.textContent = "Astro Start Job";
  startButton.className = "astro-bid-start-button";
  // Define Question Class Name from Page
  // Append the button to the body of the webpage
  document.body.appendChild(startButton);

  // Add an event listener to toggle the side panel on click
  startButton.addEventListener("click", async function () {
    await operateAllInputFields("fill_answer")();
  });

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
  };
  startObserving();
})();

// Retrieve profile ID from local storage
chrome.storage.local.get(["currentId"], function (result) {
  profileId = result.currentId;
  console.log("Profile ID retrieved: ", profileId);
});
