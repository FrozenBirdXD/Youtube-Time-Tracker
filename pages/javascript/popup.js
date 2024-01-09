const STORAGE_KEY_START_TIME = "startTime";
const STORAGE_KEY_TOTAL_TIME = "totalTime";
const STORAGE_KEY_TODAY_TIME = "todayTime";
const STORAGE_KEY_SETTINGS_DAILY_LIMIT = "dailyTimeLimit"

document.addEventListener('DOMContentLoaded', loadSavedTime());

function loadSavedTime() {
    chrome.storage.sync.get([STORAGE_KEY_TOTAL_TIME, STORAGE_KEY_TODAY_TIME, STORAGE_KEY_SETTINGS_DAILY_LIMIT], function (result) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        } else {
            let totalTime = result.totalTime || 0;
            let timeToday = result.todayTime || 0;
            let dailyTimeLimit = result.dailyTimeLimit || 7200;
            document.getElementById('timeSpent').innerText = `Total time spent on YouTube: ${formatTime(totalTime)}`;
            document.getElementById('timeToday').innerText = `Time watched today: ${formatTime(timeToday)}`;
            document.getElementById('timeLeft').innerText = `Time left today: ${formatTime(dailyTimeLimit - timeToday)}`;
        }
    });
}

chrome.action.onClicked.addListener(() => {
    loadSavedTime();
});

// add clear timer button to page
const clearTimerButton = document.getElementById('clearTimer');
clearTimerButton.addEventListener('click', () => {
    alert('Timer is now cleared');
    chrome.storage.sync.set({ [STORAGE_KEY_TOTAL_TIME]: 0 })
    chrome.storage.sync.set({ [STORAGE_KEY_START_TIME]: 0 });
    chrome.storage.sync.set({ [STORAGE_KEY_START_TIME]: 0 });

    loadSavedTime();
});

// event handler for settings button
const settingsButton = document.getElementById('settings');

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
            const backButton = document.getElementById('back');
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


function formatTime(seconds) {
    if (seconds === 0) {
        return "00:00:00";
    }
    if (seconds < 0) {
        console.log(seconds);
        return "Invalid time";
    }

    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    // format time HH:MM:SS
    const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(Math.floor(seconds))}`;
    return formattedTime;
}

// helper function to pad zero for single-digit numbers
function padZero(number) {
    return (number < 10) ? `0${number}` : number;
}
