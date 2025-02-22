(function () {
    // Function to handle URL changes
    const onUrlChange = (callback) => {
        // Store the initial URL
        let lastUrl = '';

        // Function to check for URL changes
        const checkUrlChange = () => {
            const currentUrl = location.href;
            if (currentUrl !== lastUrl) {
                lastUrl = currentUrl;
                callback();
            }
        };

        // Observe changes to the URL via pushState and replaceState
        const observeUrlChange = () => {
            const originalPushState = history.pushState;
            const originalReplaceState = history.replaceState;

            history.pushState = function () {
                originalPushState.apply(this, arguments);
                checkUrlChange();
            };

            history.replaceState = function () {
                originalReplaceState.apply(this, arguments);
                checkUrlChange();
            };

            window.addEventListener('popstate', checkUrlChange);
        };

        // Function to handle DOM changes and check for URL changes
        const observeDomChanges = () => {
            const observer = new MutationObserver(() => {
                // Check URL change on DOM change
                checkUrlChange();
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        // Initialize DOM observation
        observeDomChanges();

        observeUrlChange();

        // Initial call to handle the current URL
        checkUrlChange();
    }

    // Function to retrieve element after it's fully loaded
    const waitForElement = async (selector) => {
        let element = document.querySelector(selector);
        while (!element) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            element = document.querySelector(selector);
        }
        return element;
    }

    // Function to dispatch click event on an element
    const simulateClick = (element) => {
        element.dispatchEvent(new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window
        }));
    }

    // Function to dispatch keyboard event on an element to fill the input
    const simulateKeyboardInput = (element, value) => {
        element.value = value;
        element.dispatchEvent(new Event("input", { bubbles: true }));
        element.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // Function to find the label for an input element
    const findLabelForInput = (input) => {
        let id = $(input).attr("id");
        if (id) {
            let explicitLabel = $(`label[for='${id}']`);
            if (explicitLabel.length) {
                return explicitLabel.text().trim();
            } else {
                id = id.replace(/"/g, "'");
                id = ""
                if (explicitLabel) {
                    return explicitLabel.text().trim();
                }
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
    const autoFillAnswer = (input, inputType, label, answer) => {
        switch (inputType) {
            case "radio":
                if (label.toLowerCase() === answer.toLowerCase()) {
                    simulateClick(input);
                }
                break;
            case "checkbox":
                if (answer.toLowerCase().includes(label.toLowerCase())) {
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
    const retrieveUserInputAnswer = (input, inputType) => {
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
        } else if (inputType === 'tel') {
            answer = $(`input[type="tel"]`).val() || null
        }

        return answer;
    }

    const getSelectedRowHrefs = (rowSelector, cellSelector, linkSelector) => {
        const hrefs = [];

        $(rowSelector).each(function () {
            const cellDiv = $(this).find(cellSelector);
            const aElement = cellDiv.find(linkSelector);
            const href = aElement.attr('href');

            if (href) {
                hrefs.push(href);
            }
        });

        return hrefs;
    }

    // Function to check if all elements are rendered
    const waitIfAllElementsRendered = () => {
        return new Promise((resolve) => {
            let timeout;
            const observer = new MutationObserver((mutationsList, observer) => {
                // Clear any existing timeout
                clearTimeout(timeout);

                // Set a timeout to resolve the promise if no mutations occur for a while
                timeout = setTimeout(() => {
                    observer.disconnect();
                    resolve();
                }, 500); // Adjust this delay as necessary
            });

            // Start observing the document body
            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });

            // Initial check
            timeout = setTimeout(() => {
                observer.disconnect();
                resolve();
            }, 500); // Adjust this delay as necessary
        });
    }

    const cleanString = (input) => {
        // Convert input string to lowercase
        let cleanedString = input.toLowerCase();

        // Replace all non-alphanumeric characters (except spaces) with an empty string
        cleanedString = cleanedString.replace('(optional)', '')
        cleanedString = cleanedString.replace(/[^a-z0-9 ]/g, '');

        return cleanedString;
    }

    const isElementVisible = (element) => {
        if (!element) {
            return false;
        }

        // Check if the element is in the DOM and not hidden by CSS
        const style = window.getComputedStyle(element);
        const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';

        // Check if the element is within the viewport
        const rect = element.getBoundingClientRect();
        const isInViewport = rect.top >= 0 && rect.left >= 0;

        return isVisible && isInViewport;
    }

    const hasHiddenParent = (element) => {
        let currentElement = element;

        while (currentElement) {
            if (currentElement.hasAttribute('hidden')) {
                return true;
            }
            currentElement = currentElement.parentElement;
        }

        return false;
    }
    // Attach functions to window object
    window.waitForElement = waitForElement;
    window.simulateClick = simulateClick;
    window.simulateKeyboardInput = simulateKeyboardInput;
    window.findLabelForInput = findLabelForInput;
    window.autoFillAnswer = autoFillAnswer;
    window.retrieveUserInputAnswer = retrieveUserInputAnswer;
    window.waitIfAllElementsRendered = waitIfAllElementsRendered;
    window.onUrlChange = onUrlChange;
    window.cleanString = cleanString;
    window.isElementVisible = isElementVisible;
    window.hasHiddenParent = hasHiddenParent;
    window.getSelectedRowHrefs = getSelectedRowHrefs;
})();
