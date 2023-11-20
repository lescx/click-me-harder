"use strict";

chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    id: "autoClicker",
    title: "Auto Clicker",
    contexts: ['all']
  });

  chrome.contextMenus.create({
    id: "followMouseMode",
    title: "Follow mouse",
    parentId: "autoClicker",
    contexts: ['all']
  });

  chrome.contextMenus.create({
    id: "fixedLocationMode",
    title: "Fix location",
    parentId: "autoClicker",
    contexts: ['all']
  });
});


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
    }
  } catch (err) {
    console.error("Failed to inject or check script: ", err);
  }
}

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

async function toggleAutoClickerMode(tabId, mode) {
  await injectScriptIfNeeded(tabId);
  chrome.tabs.sendMessage(tabId, { mode }).catch(err =>
    console.error("failed to send message: ", err)
  );
}

chrome.commands.onCommand.addListener(async (command) => {
  let currentTabId = await getCurrentTabId();
  if (currentTabId) {
    let mode = command === "follow_mouse_mode" ? "followMouse" : "fixedLocation";
    await toggleAutoClickerMode(currentTabId, mode);
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  let currentTabId = await getCurrentTabId();
  if (currentTabId) {
    let mode = info.menuItemId === "fixedLocationMode" ? "fixedLocation" : "followMouse";
    await toggleAutoClickerMode(currentTabId, mode);
  }
});
