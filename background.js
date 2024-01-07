const STORAGE_KEY_START_TIME = "startTime";
const STORAGE_KEY_TOTAL_TIME = "totalTime";
let isTracking = false; // track whether YouTube is currently being tracked
let isBrowserWindowFocused = true;

async function checkCurrentTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
        if (tabs && tabs[0]) {
            const currentTab = tabs[0];
            const url = currentTab.url;
            console.log("URL: ", url);

            const youtubeRegex = /^https:\/\/www\.youtube\.com/;

            if (url && typeof url === 'string' && youtubeRegex.test(url)) { // if current tab is on YouTube
                console.log("is on youtube");
                if (!isTracking) {
                    await startTracking();
                }
            } else if (url && typeof url === 'string') { // the current tab is not on YouTube
                if (isTracking) {
                    await stopTracking();
                }
            }
        }
    });
};

async function startTracking() {
    const result = await new Promise((resolve) => {
        chrome.storage.sync.get([STORAGE_KEY_START_TIME], resolve);
    });
    const savedStartTime = result[STORAGE_KEY_START_TIME];
    const startTime = Math.floor(new Date().getTime() / 1000);

    if (savedStartTime == null || savedStartTime == 0) {
        await new Promise((resolve) => {
            chrome.storage.sync.set({ [STORAGE_KEY_START_TIME]: startTime }, resolve);
        });
    }

    isTracking = true;
}

async function stopTracking() {
    const endTime = Math.floor(new Date().getTime() / 1000);
    const result = await new Promise((resolve) => {
        chrome.storage.sync.get([STORAGE_KEY_START_TIME, STORAGE_KEY_TOTAL_TIME], resolve);
    });
    const startTime = result[STORAGE_KEY_START_TIME];

    if (startTime == 0) {
        return;
    }

    const duration = endTime - startTime;
    const savedTotalTime = result[STORAGE_KEY_TOTAL_TIME] || 0;

    await new Promise((resolve) => {
        chrome.storage.sync.set({ [STORAGE_KEY_TOTAL_TIME]: savedTotalTime + duration }, resolve);
    });

    await new Promise((resolve) => {
        chrome.storage.sync.set({ [STORAGE_KEY_START_TIME]: 0 }, resolve);
    });

    isTracking = false;
}

const ALARM_NAME = '15sec';

// check if alarm exists to avoid resetting the timer.
// the alarm might be removed when the browser session restarts.
async function createAlarm() {
    const alarm = await chrome.alarms.get(ALARM_NAME);
    if (typeof alarm === 'undefined') {
        console.log('created alarm');
        chrome.alarms.create(ALARM_NAME, {
            periodInMinutes: 0.25
        });
        console.log('check tab from alarm creation');
        checkCurrentTab();
    }
}

// check every 15 seconds
chrome.alarms.onAlarm.addListener(async () => {
    console.log('alarm');
    await checkCurrentTab();
});

chrome.tabs.onUpdated.addListener(async () => {
    console.log('updated');
    // check the current tab when the tab is changed
    await checkCurrentTab();
});

chrome.tabs.onActivated.addListener(async () => {
    console.log('activated');
    await checkCurrentTab();
});

chrome.windows.onFocusChanged.addListener(async (window) => {
    // if chrome has no more focused windows, also happens when the user clicks the extension icon
    if (window == chrome.windows.WINDOW_ID_NONE) {
        if (isTracking && isBrowserWindowFocused) {
            console.log('window lost from youtube');
            await stopTracking();
            isBrowserWindowFocused = false;
        }
    } else {
        console.log("Ok we are back");
        isBrowserWindowFocused = true;
        await checkCurrentTab();
    }
});


// initial check when the extension is loaded
checkCurrentTab();
createAlarm();