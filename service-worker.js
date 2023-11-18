let autoClickerEnabled = false;

async function getCurrentTabId() {
  let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true});
  return tab.id;
}

// Toggle auto clicker
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-auto-clicker") {
    let currentTabId = await getCurrentTabId();
    autoClickerEnabled = !autoClickerEnabled;
    console.log("AutoClicker " + (autoClickerEnabled ? "enabled" : "disabled"));

    if (autoClickerEnabled) {
      chrome.scripting.executeScript({
        target: { tabId: currentTabId },
        files: ['scripts/auto-clicker.js'],
      }).then(() => {
        console.log("injected scripts/auto-clicker.js");
        // Send a message to auto-clicker.js to start the autoclicker
        chrome.tabs.sendMessage(currentTabId, { autoClickerEnabled });
      }).catch(err => console.error("Script injection failed: ", err));
    } else {
      // Send a message to auto-clicker.js to stop the autoclicker
      chrome.tabs.sendMessage(currentTabId, { autoClickerEnabled });
    }
  }
});
