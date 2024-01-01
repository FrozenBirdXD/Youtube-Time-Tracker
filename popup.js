document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.sync.get(['totalTime'], function (result) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        } else {
            let totalTime = result.totalTime || 0;
            console.log('DOM Content loaded')
            console.log('Total time retrieved:', totalTime);
            document.getElementById('timeSpent').innerText = `Total time spent on YouTube: ${formatTime(totalTime)}`;
        }
    });
});

const pauseTimer = document.getElementById("pauseTimer");
if (pauseTimer) {
    pauseTimer.onclick = function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {

        });
    };
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

function pad(num) {
    return num.toString().padStart(2, '0');
}
