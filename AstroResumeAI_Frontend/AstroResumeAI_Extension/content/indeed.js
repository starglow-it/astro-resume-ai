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
    contactInfo: 'smartapply.indeed.com/beta/indeedapply/form/contact-info',
    resume: 'smartapply.indeed.com/beta/indeedapply/form/resume',
    workExp: 'smartapply.indeed.com/beta/indeedapply/form/work-experience',
    questions: 'smartapply.indeed.com/beta/indeedapply/form/questions',
    qualificationQuestions: 'smartapply.indeed.com/beta/indeedapply/form/qualification-questions',
    review: 'smartapply.indeed.com/beta/indeedapply/form/review',
    postApply: 'smartapply.indeed.com/beta/indeedapply/form/post-apply',
    commuteCheck: 'smartapply.indeed.com/beta/indeedapply/form/commute-check'
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
        console.log(payload);
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

// Function to handle form loading and set up event listeners
async function onFormLoaded() {
    setTimeout(() => {

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
const operateAllInputFields = async (command) => {
    try {
        const userAnswers = [];
        let previousGroupLabel = '';

        for (const input of $(selectors.question)) {
            const fieldset = input.closest("fieldset");
            const legend = fieldset ? fieldset.querySelector("legend") : null;
            const groupLabel = legend && !currentUrl.includes(urlSelectors.workExp) ? legend.textContent.trim() : findLabelForInput(input) ?? '';
            
            // Skip the current loop iteration if the groupLabel is the same as the previous one
            if (groupLabel === previousGroupLabel) {
                continue;
            }
            
            // Update previousGroupLabel to the current groupLabel
            previousGroupLabel = groupLabel;
        
            const label = input.type === "radio" || input.type === "checkbox" ? window.findLabelForInput(input) : groupLabel;
            const inputType = input.tagName.toLowerCase() === "input" ? input.type : input.tagName.toLowerCase();
            const isOptional = groupLabel.includes("(optional)");
        
            if (command === "fill_answer") {
                await fetchAnswerForQuestion(groupLabel, label, isOptional, inputType, input);
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

        if (command === "save_answers") {
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

    const handleJobPage = async () => {
        handleClickApplyBtn();
    };

    const handleResumePage = async () => {
        const element = document.querySelector(selectors.resume);
        window.simulateClick(element);
        handleClickContinueBtn(selectors.continueButton2);
    };

    const handleInputFieldsPage = async () => {
        await window.waitIfAllElementsRendered();
        $(selectors.continueButton).click(async () => {
            await operateAllInputFields("save_answers");
        });
        setTimeout(async () => { await operateAllInputFields("fill_answer"); }, 1000);
    };

    const handleReviewPage = async () => {
        const submitBtn = await window.waitForElement(selectors.continueButton2);
        window.simulateClick(submitBtn);
    };

    const handlePostApplyPage = async () => {
        chrome.runtime.sendMessage({ action: 'autoBidCompleted' });
    };

    const pageChangeHandler = async () => {
        const url = location.href;

        switch (true) {
            case url.includes(urlSelectors.viewJob):
                await handleJobPage();
                break;

            case url.includes(urlSelectors.resume):
                await handleResumePage();
                break;

            case url.includes(urlSelectors.workExp) ||
                url.includes(urlSelectors.contactInfo) ||
                url.includes(urlSelectors.questions) ||
                url.includes(urlSelectors.qualificationQuestions):
                await handleInputFieldsPage();
                break;

            case url.includes(urlSelectors.review):
                await handleReviewPage();
                break;

            case url.includes(urlSelectors.postApply):
                await handlePostApplyPage();
                break;

            case url.includes(urlSelectors.commuteCheck):
                await handlePostApplyPage();
                break;

            default:
                // Optionally handle unknown cases
                console.log('No matching URL found');
                break;
        }
    };

    window.onUrlChange(pageChangeHandler);
})();