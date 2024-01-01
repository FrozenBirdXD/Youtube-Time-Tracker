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
const button = document.createElement('button');
button.innerText = 'Clear Timer';
button.addEventListener('click', () => {
    alert('Timer is now cleared');
    chrome.storage.sync.set({ totalTime: 0 })
});
document.body.appendChild(button)

// event handler for settings button
const settingsButton = document.getElementsByClassName('settings')[0];

settingsButton.addEventListener('click', () => {
    // Fetch the content of the external settings HTML file
    fetch('/pages/html/settings.html')
        .then(response => response.text())
        .then(html => {
            // Create a new div element to hold the content of the settings page
            const settingsPage = document.createElement('div');
            settingsPage.innerHTML = html;

            // Replace the current content of the popup with the settings page
            document.body.innerHTML = '';
            document.body.appendChild(settingsPage);

            const backButton = document.createElement('button');
            backButton.textContent = 'Back';
            backButton.addEventListener('click', () => {
                // Reload the popup with the original content
                location.reload();
            });

            document.body.appendChild(backButton);
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
