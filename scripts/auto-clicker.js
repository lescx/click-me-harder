"use strict";

// Mark this script as injected, used for the service-worker
window.autoClickerInjected = true;

let isEnabled = false;
let autoClickerInterval; // is set to the return value of setInterval(); 4ms for on, null for off
let mousePosition = { x: 0, y: 0 };
let currentMode = null;

document.addEventListener('mousemove', (event) => {
  if (isEnabled && currentMode === "followMouse") {
    mousePosition.x = event.clientX;
    mousePosition.y = event.clientY;
  }
});

document.addEventListener('click', (event) => {
  if (isEnabled && currentMode === "fixedLocation") {
    fixedClickPosition = { x: event.clientX, y: event.clientY };
    console.log("fixedClickPosition captured: " + fixedClickPosition.x + " " + fixedClickPosition.y);
  }
});

function simulateClickAtPosition(x, y) {
  const element = document.elementFromPoint(x, y);
  element?.click();
}

// Mode which simulates a click every 4ms under the mouse cursor
function followMouseMode() {
  simulateClickAtPosition(mousePosition.x, mousePosition.y);
}

// User clicks position after enabling this mode and then autoclicks at the position
function fixedLocationMode(x, y) {
  simulateClickAtPosition(x, y);
}

function startAutoClicker() {
  const modeFunction = currentMode === "followMouse" ? followMouseMode : fixedLocationMode;
  console.log("startAutoClicker (mode: " + currentMode + ")");
  autoClickerInterval = setInterval(modeFunction, 4);
}

function stopAutoClicker() {
  console.log("stopped auto clicker (mode: " + currentMode + ")");
  clearInterval(autoClickerInterval);
  autoClickerInterval = null;
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.mode) {
    // If the auto-clicker is currently enabled
    if (isEnabled) {
      // Stop the auto-clicker if the same mode is reselected or if changing modes
      stopAutoClicker();
      // If the same mode is reselected, toggle off the auto-clicker and return early
      if (currentMode === message.mode) {
        isEnabled = false;
        return;
      }
    }
    // Change mode and start auto-clicker if it's currently disabled or changing modes
    currentMode = message.mode;
    isEnabled = true;
    startAutoClicker();
  }
});
