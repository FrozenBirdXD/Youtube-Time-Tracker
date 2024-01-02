document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.sync.get(['totalTime'], function (result) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        } else {
            let totalTime = result.totalTime || 0;
            document.getElementById('timeSpent').innerText = `Total time spent on YouTube: ${formatTime(totalTime)}`;
        }
    });
});

// add clear timer button to page
const clearTimerButton = document.getElementById('clearTimer');
clearTimerButton.addEventListener('click', () => {
    alert('Timer is now cleared');
    chrome.storage.sync.set({ totalTime: 0 })
});

// event handler for settings button
const settingsButton = document.getElementsByClassName('settings')[0];

settingsButton.addEventListener('click', () => {
    // fetch content of the external settings HTML file
    fetch('/pages/html/settings.html')
        .then(response => response.text())
        .then(html => {
            // create new div element to hold content of the settings page
            const settingsPage = document.createElement('div');
            settingsPage.innerHTML = html;

            // append settings page content to the document body
            document.body.innerHTML = '';
            document.body.appendChild(settingsPage);

            // load the associated JS file
            const scriptElement = document.createElement('script');
            scriptElement.src = '/pages/javascript/settings.js';

            //---------------------------------------------------------------
            // js code for settings page
            //---------------------------------------------------------------
            // event handler for back button
            const backButton = document.getElementsByClassName('back')[0];
            backButton.addEventListener('click', () => {
                location.reload();
            });

            // event handler for save settings button
            const saveSettingsButton = document.getElementById('saveSettings');
            saveSettingsButton.addEventListener('click', function () {
                const dailyLimitInput = document.getElementById('dailyLimit');
                const dailyLimit = dailyLimitInput.value;

                // TODO: save settings logic 

                alert(`Settings saved! Daily limit set to ${dailyLimit} minutes.`);
            });
            //---------------------------------------------------------------

            document.body.appendChild(scriptElement);
        })
        .catch(error => console.error('Error loading settings HTML:', error));
});


function formatTime(milliseconds) {
    if (milliseconds == 0) {
        return "00:00:00";
    }
    if (milliseconds < 0) {
        return "Invalid time";
    }

    let seconds = Math.floor(milliseconds / 1000);

    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    // format time HH:MM:SS
    const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
    return formattedTime;
}

// helper function to pad zero for single-digit numbers
function padZero(number) {
    return (number < 10) ? `0${number}` : number;
}
