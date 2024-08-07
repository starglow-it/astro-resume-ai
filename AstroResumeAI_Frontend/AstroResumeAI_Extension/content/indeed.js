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
    jobPage: 'www.indeed.com/job/',
    contactInfo: 'smartapply.indeed.com/beta/indeedapply/form/contact-info',
    resume: 'smartapply.indeed.com/beta/indeedapply/form/resume',
    workExp: 'smartapply.indeed.com/beta/indeedapply/form/work-experience',
    questions: 'smartapply.indeed.com/beta/indeedapply/form/questions',
    demographicQuestion: 'smartapply.indeed.com/beta/indeedapply/form/demographic-questions',
    qualificationQuestions: 'smartapply.indeed.com/beta/indeedapply/form/qualification-questions',
    documents: 'smartapply.indeed.com/beta/indeedapply/form/documents',
    review: 'smartapply.indeed.com/beta/indeedapply/form/review',
    postApply: 'smartapply.indeed.com/beta/indeedapply/form/post-apply',
    // isAlreadyApplied: 'smartapply.indeed.com/beta/indeedapply/postresumeapply',
    commuteCheck: 'smartapply.indeed.com/beta/indeedapply/form/commute-check',
    intervention: 'smartapply.indeed.com/beta/indeedapply/form/intervention',
    qualificationInvention: 'smartapply.indeed.com/beta/indeedapply/form/qualification-intervention',
};

const dateQuestionList = [
    "date available",
    "todays date",
    "wht is your earliest start date"
]

const skipQuestionList = [
    "day options",
    "time options",
    "cover letter"
]

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'autoBidStopReceived') {
        autoBidContinue = false;
        console.log('-!- Auto bid stopped. -!-');
    }
});

const handleJobPage = async () => {
    handleClickApplyBtn();
};

const handleResumePage = async () => {
    const element = document.querySelector(selectors.resume);
    window.simulateClick(element);
    handleClickContinueBtn(selectors.continueButton2);
};

const handleInputFieldsPage = async (exceptionCase = '') => {
    await window.waitIfAllElementsRendered();
    $(selectors.continueButton).click(async () => {
        await operateAllInputFields("save_answers");
    });
    setTimeout(async () => { await operateAllInputFields("fill_answer", exceptionCase); }, 1000);
};

const handleReviewPage = async () => {
    const submitBtn = await window.waitForElement(selectors.continueButton2);
    window.simulateClick(submitBtn);
};

const handlePostApplyPage = async () => {
    chrome.runtime.sendMessage({ action: 'autoBidCompleted' });
};

const handleSkipPage = async () => {
    chrome.runtime.sendMessage({ action: 'autoBidSkipped' });
};

const findAllTextNodes = (node) => {
    let textNodes = [];
    node.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
            textNodes.push(child);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            textNodes = textNodes.concat(findAllTextNodes(child));
        }
    });
    return textNodes;
}

const findClosestLegendEl = (input) => {
    try {
        const inputElement = $(input);

        if (!inputElement.length) {
            throw new Error("Input element not found");
        }

        if (inputElement.is('select')) {
            const inputElementId = inputElement.attr('id');

            if (!inputElementId) {
                throw new Error("Without id, cannot catch the question for select");
            }

            return $(`label[for="${inputElementId}"]`).text();
        } else {
            const parentLabel = inputElement.closest('label');

            if (parentLabel.length === 0) {
                throw new Error("Parent label element not found");
            }

            const siblingLegend = parentLabel.siblings('legend');

            if (siblingLegend.length === 0) {
                throw new Error("Sibling legend element not found");
            }

            const textNodes = findAllTextNodes(siblingLegend[0]);

            if (textNodes.length < 2) {
                throw new Error("Not enough text nodes found in sibling legend");
            }

            return textNodes[textNodes.length - 2].textContent;
        }
    } catch (error) {
        console.error(error.message);
        return '';
    }
};

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
                window.autoFillAnswer(input, inputType, label, answer);

                return true;
            } else if (!isOptional) {
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

function handleClickContinueBtn(btnQuery) {
    const buttons = document.querySelectorAll(btnQuery);

    if (buttons.length > 0) {
        const activeBtn = Array.from(buttons).find(button => {
            const computedStyle = window.getComputedStyle(button);
            return computedStyle.display === 'flex' && button.textContent === 'Continue';
        });

        if (activeBtn && autoBidContinue) {
            activeBtn.click();
        } else {
            if (!autoBidContinue) {
                autoBidContinue = true;
            }
        }
    }
}

async function handleClickApplyBtn() {
    const maxWaitTime = 8000;
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
                await handlePostApplyPage();
                clearInterval(checkInterval);
            }
        }
    }, intervalTime);
}

/**
 * Main operation function for input fields. This fills answers or saves answers based on 'command' parameter
 * @param {string} command -  'fill_answer' or 'save_answers'
 */
const operateAllInputFields = async (command, exceptionCase = '') => {
    try {
        const userAnswers = [];
        let previousGroupLabel = '';
        const fetchAnswerPromises = [];

        for (const input of $(selectors.question)) {
            const fieldset = input.closest("fieldset");
            const legend = fieldset ? fieldset.querySelector("legend") : null;
            let originGroupLabel = '';

            if (exceptionCase === 'demographic-questions') {
                originGroupLabel = findClosestLegendEl(input);
            } else {
                originGroupLabel = legend && !currentUrl.includes(urlSelectors.workExp) ? legend.textContent.trim() : window.findLabelForInput(input);
            }

            const isOptional = Boolean(originGroupLabel) ? originGroupLabel.includes("(optional)") : false;
            const groupLabel = Boolean(originGroupLabel) ? window.cleanString(originGroupLabel) : '';

            if (groupLabel === previousGroupLabel || groupLabel == "" || !window.isElementVisible(input) || window.hasHiddenParent(input)) {
                continue;
            }

            previousGroupLabel = groupLabel;
            const label = input.type === "radio" || input.type === "checkbox" ? window.findLabelForInput(input) : originGroupLabel;
            const inputType = input.tagName.toLowerCase() === "input" ? input.type : input.tagName.toLowerCase();
            const noAnswerExisted = inputType === 'select' ? true : !Boolean(window.retrieveUserInputAnswer(input, inputType));
            if (command === "fill_answer" && noAnswerExisted) {
                if (dateQuestionList.indexOf(groupLabel) > -1) {
                    window.autoFillAnswer(input, inputType, label, input.placeholder);
                    continue;
                }
                if (skipQuestionList.indexOf(groupLabel) == -1)
                    fetchAnswerPromises.push(fetchAnswerForQuestion(groupLabel, label, isOptional, inputType, input));
            } else if (command === "save_answers") {
                const existingAnswer = userAnswers.find(userAnswer => userAnswer.question === groupLabel);
                if (!existingAnswer) {
                    userAnswers.push({
                        question: groupLabel,
                        isOptional: isOptional,
                        inputType: inputType,
                        answer: window.retrieveUserInputAnswer(input, inputType),
                        standard_question: input.getAttribute("data-standard-id"),
                    });
                }
            }
        }

        if (fetchAnswerPromises.length > 0) {
            await Promise.all(fetchAnswerPromises).then(() => {
                // All fetch requests have completed
                console.log('All fetch requests have completed.');
                // Trigger your event or perform your action here
            }).catch(error => {
                console.error('An error occurred while fetching answers:', error);
            });
        }

        if (command === "save_answers") {
            console.log(userAnswers);
            await saveAnswersForQuestions(userAnswers);
        }

        if (command === "fill_answer") {
            if (autoBidContinue) {
                handleClickContinueBtn(selectors.continueButton2);
            } else {
                console.log('-!- CEASE auto bidding. Complete missing answers and click auto bid button to proceed. -!-');
                chrome.runtime.sendMessage({ action: 'autoBidSkipped' });
            }
        }
    } catch (error) {
        console.error('Error operating input fields:', error);
    }
};

/**
 * Main function to start the observer
 */
(function () {
    chrome.storage.local.get(["currentId"], function (result) {
        profileId = result.currentId;
        console.log("Profile ID retrieved: ", profileId);
    });

    const pageChangeHandler = async () => {
        const url = location.href;
        await window.waitIfAllElementsRendered();
        switch (true) {
            case url.includes(urlSelectors.viewJob):
            case url.includes(urlSelectors.jobPage):
                await handleJobPage();
                break;

            case url.includes(urlSelectors.resume):
                await handleResumePage();
                break;

            case url.includes(urlSelectors.workExp) ||
                url.includes(urlSelectors.contactInfo) ||
                url.includes(urlSelectors.questions) ||
                url.includes(urlSelectors.documents) ||
                url.includes(urlSelectors.qualificationQuestions):
                await handleInputFieldsPage();
                break;

            case url.includes(urlSelectors.demographicQuestion):
                await handleInputFieldsPage('demographic-questions');
                break;

            case url.includes(urlSelectors.review):
                await handleReviewPage();
                break;

            case url.includes(urlSelectors.postApply):
            // case url.includes(urlSelectors.isAlreadyApplied):
            case url.includes(urlSelectors.commuteCheck):
                await handlePostApplyPage();
                break;

            case url.includes(urlSelectors.intervention):
            case url.includes(urlSelectors.qualificationInvention):
                await handleSkipPage();
                break;

            default:
                // Optionally handle unknown cases
                console.log('No matching URL found');
                break;
        }
    };

    window.onUrlChange(pageChangeHandler);
})();