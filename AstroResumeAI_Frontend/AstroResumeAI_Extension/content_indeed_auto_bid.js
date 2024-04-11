(function () {
    // Create job bid start button
    const startButton = document.createElement('button');
    startButton.textContent = 'Astro Start Job';
    startButton.className = 'astro-bid-start-button';


    // Define Question Class Name from Page
    const questionSelector = 'main:first input, main:first textarea, main:first select, main:first button';
    console.log("[[[[[startButton]]]]]")
    // Append the button to the body of the webpage
    document.body.appendChild(startButton);

    // Add an event listener to toggle the side panel on click
    startButton.addEventListener('click', async function () {
        console.log('startButton clicked')
        var $button = $("button span:contains('Continue')").parent();

        // Check if the button exists and perform actions
        if ($button.length > 0) {
            console.log('Button found:', $button);
            // For example, to click the button programmatically:
            // $button.click();
        } else {
            console.log('Button not found');
        }



        // Selector for the new form. Adjust this to target the new form specifically.
        var formSelector = 'main';

        // Function to be called when the form is detected
        function onFormLoaded() {
            console.log('New form is loaded.');
            let questionList = [];
            setTimeout(() => {
                getAllInputFields();
                // $(questionSelector).each(function () {
                //     // let question = element.find(".question").text();
                //     questionList.push(getQuestionFromElement($(this)));
                // });
                // console.log(questionList)
            }, 300);
            // Perform your actions with the form here
        }

        // Options for the observer (which mutations to observe)
        var config = { attributes: false, childList: true, subtree: true };

        // Callback function to execute when mutations are observed
        var callback = function (mutationsList, observer) {
            for (var mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    var form = $(formSelector);
                    var questions = $(questionSelector);
                    if (form.length > 0 && questions.length > 0) {
                        observer.disconnect(); // Stop observing
                        onFormLoaded();
                        break; // Exit the loop
                    }
                }
            }
        };

        // Create an observer instance linked to the callback function
        var observer = new MutationObserver(callback);

        // Start observing the document body for configured mutations
        observer.observe(document.body, config);

        // Event listener for the button click
        $($button).on('click', function () {
            // The observer is already set up and will handle the form loading
            console.log('Button clicked. Waiting for the form to load...');
        });
    });
})();


async function waitForElement(selector) {
    let element = document.querySelector(selector);
    while (!element) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        element = document.querySelector(selector);
    }
    return element;
}

async function simulateClick(element) {
    element.dispatchEvent(
        new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
        })
    );
}

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

const questionPatternAnswers = [
    {
        questionText: "Experience:",
        optionalQuestion: false,
        inputType: "radio",
        answer: "Yes"
    },
    {
        questionText: "authorized to work",
        optionalQuestion: false,
        inputType: "radio",
        answer: "Yes"
    },
    {
        questionText: "Are you currently authorized",
        optionalQuestion: false,
        inputType: "radio",
        answer: "Yes"
    },
    {
        questionText: "visa sponsorship",
        optionalQuestion: false,
        inputType: "radio",
        answer: "No"
    },
    {
        questionText: "W2 position",
        optionalQuestion: false,
        inputType: "radio",
        answer: "Yes"
    },
    {
        questionText: "Will you be able to relocate",
        optionalQuestion: false,
        inputType: "radio",
        answer: "No"
    },
    {
        questionText: "Will you be able to reliably commute",
        optionalQuestion: false,
        inputType: "radio",
        answer: "No"
    },
    {
        questionText: "How many years of",
        optionalQuestion: false,
        inputType: "number",
        answer: 7
    },
    {
        questionText: "What is the highest level of education",
        optionalQuestion: false,
        inputType: "radio",
        answer: "Master's"
    },
    {
        questionText: "What is your highest level of completed education",
        optionalQuestion: false,
        inputType: "radio",
        answer: "Masters Degree or higher"
    },
    {
        questionText: "following US states",
        optionalQuestion: false,
        inputType: "radio",
        answer: "Yes"
    },
    {
        questionText: "Do you speak",
        optionalQuestion: false,
        inputType: "text",
        answer: "English"
    },
    {
        questionText: "Do you speak",
        optionalQuestion: false,
        inputType: "radio",
        answer: "Yes"
    },
    {
        questionText: "Gender",
        optionalQuestion: false,
        inputType: "radio",
        answer: "Male"
    },
    {
        questionText: "you are a U.S. Citizen",
        optionalQuestion: false,
        inputType: "checkbox",
        answer: "No"
    },
    {
        questionText: "Do you have experience with",
        optionalQuestion: false,
        inputType: "textarea",
        answer: "Yes"
    },
    {
        questionText: "Certification",
        optionalQuestion: false,
        inputType: "checkbox",
        answer: "Yes"
    },
    {
        questionText: "Do you have experience with",
        optionalQuestion: false,
        inputType: "checkbox",
        answer: "Yes"
    },
    {
        questionText: "desired salary",
        optionalQuestion: false,
        inputType: "text",
        answer: "$9000 / month"
    },
    {
        questionText: "Have you been previously employed at",
        optionalQuestion: false,
        inputType: "radio",
        answer: "No"
    },
    {
        questionText: "Please confirm your legal first and last name",
        optionalQuestion: false,
        inputType: "text",
        answer: "Jerry Green"
    },
    {
        questionText: "located in",
        optionalQuestion: false,
        inputType: "radio",
        answer: "No"
    },
    {
        questionText: "Are you open to",
        optionalQuestion: false,
        inputType: "radio",
        answer: "Yes"
    },
    {
        questionText: "Have you ever held",
        optionalQuestion: false,
        inputType: "radio",
        answer: "Yes"
    },
    {
        questionText: "U.S. citizenship",
        optionalQuestion: false,
        inputType: "radio",
        answer: "No"
    },
    {
        questionText: "active security clearance",
        optionalQuestion: false,
        inputType: "radio",
        answer: "Yes"
    },
    {
        questionText: "desired compensation",
        optionalQuestion: false,
        inputType: "text",
        answer: "$9000 / month"
    },
    {
        questionText: "level of security clearance",
        optionalQuestion: false,
        inputType: "select",
        answer: "Background Check"
    },
    {
        questionText: "list all active certifications",
        optionalQuestion: false,
        inputType: "textarea",
        answer: "AWS Certified Cloud Practitioner"
    },
    {
        questionText: "Recent Job Title",
        optionalQuestion: false,
        inputType: "text",
        answer: "Lead Full Stack Developer"
    },
    {
        questionText: "Recent Employer",
        optionalQuestion: false,
        inputType: "text",
        answer: "Soft Elegance"
    },
    {
        questionText: "number to receive text",
        optionalQuestion: false,
        inputType: "text",
        answer: "+13465610919"
    },
    {
        questionText: "It is okay to send me text messages",
        optionalQuestion: false,
        inputType: "radio",
        answer: "Yes"
    },
    {
        questionText: "proceed with this",
        optionalQuestion: false,
        inputType: "radio",
        answer: "Yes"
    },
    {
        questionText: "Have you",
        optionalQuestion: false,
        inputType: "Checkbox",
        answer: "Yes"
    },
    {
        questionText: "assistance",
        optionalQuestion: false,
        inputType: "radio",
        answer: "No"
    },
    {
        questionText: "Current Location",
        optionalQuestion: true,
        inputType: "text",
        answer: "Killeen, TX"
    },
    {
        questionText: "Where are you located",
        optionalQuestion: true,
        inputType: "textarea",
        answer: "Killeen, TX"
    },
    {
        questionText: "phone",
        optionalQuestion: true,
        inputType: "text",
        answer: "+13465610919"
    },
    {
        questionText: "address",
        optionalQuestion: true,
        inputType: "textarea",
        answer: "Killeen, TX"
    },
    {
        questionText: "city",
        optionalQuestion: true,
        inputType: "text",
        answer: "Killeen"
    },
    {
        questionText: "state",
        optionalQuestion: true,
        inputType: "text",
        answer: "TX"
    },
    {
        questionText: "zip",
        optionalQuestion: true,
        inputType: "text",
        answer: "76549"
    },
]

const getQuestionFromElement = (element) => {
    var questionText = element.find('.css-12axhzd').first().text().trim(); // Get the question text
    var optionalQuestion = element.find('.css-1bz7tuv').length > 0; // Check if it's marked as optional
    var inputType = element.find('input').attr('type'); // Get the input type (radio, number, etc.)
    if (!inputType) {
        inputType = element.find('textarea').length > 0 ? 'textarea' : inputType;
        inputType = element.find('select').length > 0 ? 'select' : inputType;
    }
    var answer = null; // Initialize answer as null

    // Handle different types of inputs to extract the answer (if any)
    if (inputType === 'radio') {

        var selectedRadio = element.find('input[type=radio]:checked + span').text().trim();
        answer = selectedRadio ? selectedRadio : null;
    } else if (inputType === 'number') {
        var numberInputValue = element.find('input[type=number]').val();
        answer = numberInputValue ? numberInputValue : null;
    }
    // Since there's no direct way to distinguish a listbox from a standard button, this part is a simplification
    // Assuming any question without a radio or number input, and containing a button is treated as a listbox question 
    else if (element.find('button').length > 0) {
        inputType = 'listbox';
        // Assuming there's no direct way to get a selected value from a listbox in this HTML without further details
        answer = null; // Placeholder as we cannot determine the selected value without more specific HTML structure
    }

    let result = questionPatternAnswers.find(item => questionText.toLocaleLowerCase().includes(item.questionText.toLocaleLowerCase()));
    if (result) {
        switch (inputType) {
            case "radio":
                if (answer == null) {
                    answer = result.answer;
                    element.find('input').each((index, option) => {
                        if ($(option).parent().find("span").text().trim() == result.answer) {
                            simulateClick(option);
                        }
                    });
                }
                break;

            case "select":
                if (answer == null) {
                    answer = result.answer;
                    simulateKeyboardInput(element.find('select')[0], element.find(`option:contains("${answer}")`).val());
                }
                break;

            case "number":
                if (answer == null) {
                    answer = result.answer;
                    simulateKeyboardInput(element.find('input')[0], answer)
                }
                break;

            case "text":
                if (answer == null) {
                    answer = result.answer;
                    simulateKeyboardInput(element.find('input')[0], answer);
                }
                break;

            case "textarea":
                if (answer == null) {
                    simulateKeyboardInput(element.find('textarea')[0], answer);
                }
                break;

            default:
                break;
        }
    }

    return {
        questionText: questionText,
        optionalQuestion: optionalQuestion,
        inputType: inputType,
        answer: answer
    };
}


const findLabelForInput = (input) => {
    // Case 1: Explicit association via 'for' attribute
    var id = $(input).attr('id');
    if (id) {
        var explicitLabel = $('label[for="' + id + '"]');
        if (explicitLabel.length) {
            return explicitLabel.text().trim();
        }
    }

    // Case 2: Implicit association by nesting
    var parentLabel = $(input).closest('label');
    if (parentLabel.length) {
        return parentLabel.text().trim();
    }

    // Case 3: Adjacent elements
    // Previous element
    var prevLabel = $(input).prev('label');
    if (prevLabel.length) {
        return prevLabel.text();
    }
    // Next element
    var nextLabel = $(input).next('label');
    if (nextLabel.length) {
        return nextLabel.text();
    }

    // If no label found
    return "No Label Found";
}




const setAnswerForInput = (questionText, label, input) => {
    var inputType;
    if (input.tagName.toLowerCase() === 'input') {
        inputType = input.type; // This will be 'text', 'radio', 'checkbox', etc.
    } else {
        inputType = input.tagName.toLowerCase(); // This will be 'textarea', 'select', 'button'
    }

    var answer = null; // Initialize answer as null

    // Handle different types of inputs to extract the answer (if any)
    if (inputType === 'number' || inputType === 'text') {
        var numberInputValue = $(input).val();
        answer = numberInputValue ? numberInputValue : null;
    }
    
    let result = questionPatternAnswers.find(item => questionText.toLocaleLowerCase().includes(item.questionText.toLocaleLowerCase()));
    if (result) {
        switch (inputType) {
            case "radio":
                if (label.toLowerCase() == result.answer.toLowerCase()) {
                    simulateClick(input);
                }
                break;

            case "checkbox":
                if (label.toLowerCase() == result.answer.toLowerCase()) {
                    simulateClick(input);
                }
                break;

            case "select":
                simulateKeyboardInput(input, $(input).find(`option:contains("${result.answer}")`).val());
                break;

            case "number":
                if (answer == null) {
                    simulateKeyboardInput(input, result.answer)
                }
                break;

            case "text":
                if (answer == null) {
                    simulateKeyboardInput(input, result.answer);
                }
                break;

            case "textarea":
                    simulateKeyboardInput(input, result.answer);
                break;

            default:
                break;
        }
    }

    return {
        questionText: questionText,
        optionalQuestion: false,
        inputType: inputType,
        answer: answer
    };
}

const getAllInputFields = () => {
    // Iterate over each input and print its label
    $('main:first input, main:first textarea, main:first select, main:first button').each((index, input) => {
        let groupLabel = "";
        let label = "";

        // For radio buttons and checkboxes within a fieldset
        if (input.type === "radio" || input.type === "checkbox") {
            const fieldset = input.closest('fieldset');
            if (fieldset) {
                const legend = fieldset.querySelector('legend');
                if (legend) {
                    groupLabel = legend.textContent.trim();
                } else {
                    const label = $(fieldset).siblings('label');
                    if (label.length) {
                        groupLabel = label.text().trim();
                    }
                }
            }

            // Adjacent label for radio/checkbox
            label = findLabelForInput(input);
            console.log(`Group Label: ${groupLabel}, Option Label: ${label}`);
        } else {
            // For other inputs like text, select, etc.
            groupLabel = findLabelForInput(input);
            console.log(`Label: ${label}, Name: ${input.name}`);
        }
        setAnswerForInput(groupLabel, label, input);
    });
}