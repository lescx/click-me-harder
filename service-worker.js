"use strict";

let autoClickerEnabled = false;

async function getCurrentTabId() {
  let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true});
  return tab.id;
}

async function toggleAutoClicker() {
  let currentTabId = await getCurrentTabId();
  autoClickerEnabled = !autoClickerEnabled;
  console.log("AutoClicker " + (autoClickerEnabled ? "enabled" : "disabled"));

  if (autoClickerEnabled) {
    chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      files: ['scripts/auto-clicker.js'],
    }).then(() => {
      console.log("Injected scripts/auto-clicker.js");
      chrome.tabs.sendMessage(currentTabId, { autoClickerEnabled });
    }).catch(err => console.error("Script injection failed: ", err));
  } else {
    chrome.tabs.sendMessage(currentTabId, { autoClickerEnabled });
  }
}

// Toggle auto clicker using commands
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-auto-clicker") {
    await toggleAutoClicker();
  }
});

/*****************
/  Context Menu  *
*****************/

// Create the parent item
chrome.contextMenus.create({
  id: "autoClicker",
  title: "Auto Clicker",
  contexts: ["all"]
});

chrome.contextMenus.create({
  id: "specificLocation",
  title: "[Placeholder] Click Location",
  parentId: "autoClicker",
  contexts: ["all"]
});

//chrome.contextMenus.create({
//  id: "followMouse",
//  title: "Follow Mouse",
//  parentId: "autoClicker",
//  contexts: ["all"]
//});

// Add click event listener
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "specificLocation" || info.menuItemId === "followMouse") {
    // Toggle Auto Clicker when either menu item is selected
    await toggleAutoClicker();
    // Additional logic for specific location or follow mouse can be added here
  }
});
