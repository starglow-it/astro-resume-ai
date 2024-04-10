(function () {
    // Create job bid start button
    const startButton = document.createElement('button');
    startButton.textContent = 'Astro Start Job';
    startButton.className = 'astro-bid-start-button';


    // Define Question Class Name from Page
    const questionSelector = '.ia-Questions-item';
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
            $button.click();
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
                $(questionSelector).each(function () {
                    // let question = element.find(".question").text();
                    questionList.push(getQuestionFromElement($(this)));
                });
                console.log(questionList)
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

const getQuestionFromElement = (element) => {
    var questionText = element.find('.css-12axhzd').first().text().trim(); // Get the question text
    var optionalQuestion = element.find('.css-1bz7tuv').length > 0; // Check if it's marked as optional
    var inputType = element.find('input').attr('type'); // Get the input type (radio, number, etc.)
    var answer = null; // Initialize answer as null

    // Handle different types of inputs to extract the answer (if any)
    if (inputType === 'radio') {
        inputType = 'radio'; // For clarity, though this is redundant
        var selectedRadio = element.find('input[type=radio]:checked + span').text().trim();
        answer = selectedRadio ? selectedRadio : null;
    } else if (inputType === 'number') {
        inputType = 'number'; // Similarly redundant, just for clarity
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

    return {
        question: questionText,
        optionalQuestion: optionalQuestion,
        type: inputType,
        answer: answer
    };
}


const getTextNode = (node) => {
    return node.childNodes.filter(n => n.nodeType === 3);
}