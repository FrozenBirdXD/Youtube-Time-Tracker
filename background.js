// Function to check and handle the current tab
function checkCurrentTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs && tabs[0]) {
            const currentTab = tabs[0];
            const url = currentTab.url;
            console.log("URL: ", url);

            if (url && typeof url === 'string' && url.startsWith('https://www.youtube.com')) {
                // The current tab is on YouTube

                console.log("start tracking-background");
                chrome.tabs.sendMessage(currentTab.id, { type: 'startTracking' });

            } else if (url && typeof url === 'string') {
                console.log("stop tracking-background");
                chrome.tabs.sendMessage(currentTab.id, { type: 'stopTracking' });
            }
        }
    });
}

// Event listener for tab changes
chrome.tabs.onActivated.addListener(function (activeInfo) {
    // Check the current tab when the tab is changed
    checkCurrentTab();
});

// Initial check when the extension is loaded
checkCurrentTab();

// chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//     const tabId = tabs[0].id;
//     chrome.tabs.sendMessage(tabId, { msg: 'checkInjection' }, function (response) {
//         if (response === true) {
//             console.log('Content script is already injected');
//         } else {
//             console.log('Content script is not injected, injecting now');
//             chrome.scripting.executeScript({
//                 target: { tabId: tabId },
//                 files: ["content.js"]
//             });
//         }
//     });
// });
