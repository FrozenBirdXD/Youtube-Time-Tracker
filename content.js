chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === "startTracking") {
        const { startTime } = new Date().getTime() / 1000;
        console.log("in content script: startTracking Message was sent");
        chrome.storage.sync.set({ startTime });
    }
    else if (request.type === "stopTracking") {
        const { endTime } = new Date().getTime() / 1000;
        console.log("in content script: startTracking Message was sent");
        startTime = chrome.storage.sync.get(["startTime"]);
        const duration = endTime - startTime;

        const { savedTotalTime } = chrome.storage.sync.get(["totalTime"]);
        const totalTime = savedTotalTime || 0;

        chrome.storage.sync.set({ totalTime: totalTime + duration });
    }
});

console.log("in content.js file");