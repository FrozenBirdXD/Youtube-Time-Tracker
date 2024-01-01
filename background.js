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
                // start tracking if not already tracking
                if (!isTracking) {
                    const startTime = new Date().getTime();
                    chrome.storage.sync.set({ [STORAGE_KEY_START_TIME]: startTime });
                    isTracking = true;
                }

            } else if (url && typeof url === 'string') { // The current tab is not on YouTube
                // stop tracking if currently tracking
                if (isTracking) {
                    const endTime = new Date().getTime();

                    chrome.storage.sync.get([STORAGE_KEY_START_TIME, STORAGE_KEY_TOTAL_TIME], function (result) {
                        const startTime = result[STORAGE_KEY_START_TIME];
                        const duration = endTime - startTime;

                        const savedTotalTime = result[STORAGE_KEY_TOTAL_TIME] || 0;
                        chrome.storage.sync.set({ [STORAGE_KEY_TOTAL_TIME]: savedTotalTime + duration });
                    });

                    isTracking = false;
                }
            }
        }
    });
};

// event listener for tab changes
chrome.tabs.onActivated.addListener(function (activeInfo) {
    // check the current tab when the tab is changed
    checkCurrentTab();
});

// initial check when the extension is loaded
checkCurrentTab();