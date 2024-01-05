const STORAGE_KEY_START_TIME = "startTime";
const STORAGE_KEY_TOTAL_TIME = "totalTime";
let isTracking = false; // track whether YouTube is currently being tracked

function checkCurrentTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs && tabs[0]) {
            const currentTab = tabs[0];
            const url = currentTab.url;
            console.log("URL: ", url);

            const youtubeRegex = /^https:\/\/www\.youtube\.com/;

            if (url && typeof url === 'string' && youtubeRegex.test(url)) { // if current tab is on YouTube
                if (!isTracking) {
                    startTracking();
                }
            } else if (url && typeof url === 'string') { // the current tab is not on YouTube
                if (isTracking) {
                    stopTracking();
                }
            }
        }
    });
};

function startTracking() {
    // start tracking if not already tracking
    chrome.storage.sync.get([STORAGE_KEY_START_TIME]).then((result) => {
        const savedStartTime = result[STORAGE_KEY_START_TIME];
        const startTime = new Date().getTime() / 1000;

        if (savedStartTime == null || savedStartTime == 0) {
            chrome.storage.sync.set({ [STORAGE_KEY_START_TIME]: startTime });
        }
    });

    isTracking = true;
}

function stopTracking() {
    const endTime = new Date().getTime() / 1000;

    chrome.storage.sync.get([STORAGE_KEY_START_TIME, STORAGE_KEY_TOTAL_TIME], function (result) {
        const startTime = result[STORAGE_KEY_START_TIME];
        const duration = endTime - startTime;
        const savedTotalTime = result[STORAGE_KEY_TOTAL_TIME] || 0;

        chrome.storage.sync.set({ [STORAGE_KEY_TOTAL_TIME]: savedTotalTime + duration });
        chrome.storage.sync.set({ [STORAGE_KEY_START_TIME]: 0 });
    });

    isTracking = false;
}

const ALARM_NAME = '15sec';

// check if alarm exists to avoid resetting the timer.
// the alarm might be removed when the browser session restarts.
async function createAlarm() {
    const alarm = await chrome.alarms.get(ALARM_NAME);
    if (typeof alarm === 'undefined') {
        chrome.alarms.create(ALARM_NAME, {
            periodInMinutes: 0.25
        });
        checkCurrentTab();
    }
}

// check every 15 seconds
chrome.alarms.onAlarm.addListener(() => {
    console.log('alarm');
    checkCurrentTab();
});

chrome.tabs.onUpdated.addListener(() => {
    console.log('updated');
    // check the current tab when the tab is changed
    checkCurrentTab();
});

chrome.tabs.onActivated.addListener(() => {
    console.log('activated');
    checkCurrentTab();
});

chrome.windows.onFocusChanged.addListener((window) => {
    if (window == chrome.windows.WINDOW_ID_NONE) {
        console.log('window lost');
        // wtf
        // stopTracking();
    } else {
        // checkCurrentTab();
    }
});


// initial check when the extension is loaded
checkCurrentTab();
createAlarm();