let autoClickerEnabled = false;

async function getCurrentTab() {
  let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true});
  return tab;
}

// Toggle auto clicker
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-auto-clicker") {
    let currentTab = await getCurrentTab();
    if (currentTab && currentTab.id) {
      autoClickerEnabled = !autoClickerEnabled;
      console.log("AutoClicker " + (autoClickerEnabled ? "enabled" : "disabled"));

      if (autoClickerEnabled) {
        chrome.scripting.executeScript({
          target: { tabId: currentTab.id },
          files: ['scripts/auto-clicker.js'],
        }).then(() => {
          console.log("injected scripts/auto-clicker.js");
          // Send a message to auto-clicker.js to start the autoclicker
          chrome.tabs.sendMessage(currentTab.id, { autoClickerEnabled });
        }).catch(err => console.error("Script injection failed: ", err));
      } else {
        // Send a message to auto-clicker.js to stop the autoclicker
        chrome.tabs.sendMessage(currentTab.id, { autoClickerEnabled });
      }
    }
  }
});
