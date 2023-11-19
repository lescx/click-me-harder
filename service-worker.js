"use strict";

// getCurrentTabId() retrieves the ID of the currently active tab
// in the last focused window,
// which is necessary for sending messages to the correct tab.
async function getCurrentTabId() {
  try {
    return (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))[0]?.id;
  } catch (err) {
    console.error("error getting current tab ID: ", err);
    return null;
  }
}

// This function injects the auto-clicker script into the specified tab
// if it's not already injected.
async function injectScriptIfNeeded(tabId) {
  try {
    // Check if the script is already injected
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      function: () => window.autoClickerInjected,
    });

    // If the script is not injected, inject it
    if (!result?.result) {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['scripts/auto-clicker.js'],
      });

      // After successful injection, mark the script as injected
      await chrome.scripting.executeScript({
        target: { tabId },
        function: () => { window.autoClickerInjected = true; },
      });
    }
  } catch (err) {
    console.error("Failed to inject or check script: ", err);
  }
}

// This async function toggles the state of the extension.
// It sends a message with { toggle: true } to the content script
// running in the current tab. This approach simplifies the logic
// by not requiring the service worker to keep track of the auto-clicker's state.
async function toggleEnableExtension() {
  let currentTabId = await getCurrentTabId();
  if (currentTabId) {
    await injectScriptIfNeeded(currentTabId);
    chrome.tabs.sendMessage(currentTabId, { toggle: true }).catch(err =>
      console.error("failed to send message: ", err)
    );
  };
}

// Utility function to safely create a context menu item.
// It tries to create the item and catches the error if the item already exists.
function createContextMenu(id, title, parentId = null) {
  try {
    chrome.contextMenus.create({
      id: id,
      title: title,
      contexts: ['all'],
      parentId: parentId
    });
  } catch (error) {
    if (error.message.includes('Cannot create item with duplicate id')) {
      console.log(`Context menu item with id '${id}' already exists.`);
    } else {
      throw error; // Rethrow other unexpected errors.
    }
  }
}

// Create the main context menu and its children using the safe utility function.
createContextMenu("autoClicker", "Auto Clicker");
createContextMenu("followMouseMode", "Follow mouse", "autoClicker");
createContextMenu("fixLocationMode", "Fix location", "autoClicker");

// The listener for Chrome commands is set up to respond
// to the "toggle-auto-clicker" command. When this command is triggered,
// it calls toggleEnableExtension to toggle the state of the auto-clicker.
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "follow_mouse_mode") {
    await toggleEnableExtension(); // TODO: Handle two modes
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "specificLocationMode" || info.menuItemId === "followMouseMode") {
    await toggleEnableExtension();
  }
});
