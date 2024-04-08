function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.trim().length >= 6;
}

const yb = { id: function (str) { return document.getElementById(str) } };

function generateScoreResumeItem(id, text, value) {
    try {
        if (document.querySelector('[data-id="' + id + '"]') === null) {
            let customCollectionItem = document.createElement('div');
            customCollectionItem.classList.add("custom-collection-item");
            customCollectionItem.setAttribute('data-id', id);
            customCollectionItem.innerHTML = `<div class="svgcontainer" id="${id}-svgcontainer">
            <svg width="70" height="70" class="svg" id="${id}-svg">
                <circle class="progressbg" id="${id}-progressbg" cx="35" cy="35" r="30" stroke-width="10" fill="transparent"
                    stroke-dasharray="188.49555921538757" />
                <circle class="progress" id="${id}-progress" cx="35" cy="35" r="30" stroke-width="10" fill="transparent"
                    stroke-dasharray="188.49555921538757" />
            </svg>
            <div class="slidervalue" id="${id}-slidervalue"></div>
        </div>
        <p class="resume-title">${text}</p>`;
            document.getElementById('score-collection').appendChild(customCollectionItem);
            function showSliderValue() { yb.id(`${id}-slidervalue`).innerHTML = value + '%'; }

            showSliderValue();
            setProgress();
            function setProgress() {
                var radius = yb.id(`${id}-progress`).getAttribute('r');
                var circumference = 2 * Math.PI * radius;

                var progress_in_percent = value;
                var progress_in_pixels = circumference * (100 - progress_in_percent) / 100;
                yb.id(`${id}-progress`).style.strokeDashoffset = progress_in_pixels + 'px';

                if (value < 25) {
                    yb.id(`${id}-progress`).style.stroke = 'red';
                    yb.id(`${id}-slidervalue`).style.color = 'red';
                }
                else if (value >= 75) {
                    yb.id(`${id}-progress`).style.stroke = '#7df';
                    yb.id(`${id}-slidervalue`).style.color = '#7df';
                }
                else {
                    yb.id(`${id}-progress`).style.stroke = 'gold';
                    yb.id(`${id}-slidervalue`).style.color = 'gold';
                }
            }
            document.getElementById('score-collection').appendChild(customCollectionItem);
            return true;
        }
    } catch (error) {
        console.log(error);
    }
}

export { validateEmail, validatePassword, generateScoreResumeItem };
