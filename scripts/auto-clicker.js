"use strict";

// Mark this script as injected, used for the service-worker
window.autoClickerInjected = true;

let isEnabled = false;
let autoClickerInterval; // is set to the return value of setInterval(); 4ms for on, null for off
let mousePosition = { x: 0, y: 0 };
let staticElement = null;
let currentMode = null;

document.addEventListener('mousemove', (event) => {
  // TODO:
  // if currentMode === "staticLocation", this shouldn't be needed.
  // Instead, I should add a mouseclick listener.
  if (isEnabled && currentMode === "followMouse" || currentMode === "staticLocation") {
    mousePosition.x = event.clientX;
    mousePosition.y = event.clientY;
  }
});

// Mode which simulates a click every 4ms under the mouse cursor
function followMouseMode() {
  const element = document.elementFromPoint(mousePosition.x, mousePosition.y);
  element?.click();
}

// User clicks position after enabling this mode and
// it then autoclicks at the position
function staticLocationMode(staticCoordinate) {
  if (!staticElement) {
    // TODO:
    // staticElement sollte eigentlich definiert werden als der erste Klick,
    // sobald der staticLocation mode aktiviert wurde.
    staticElement = document.elementFromPoint(staticCoordinate.x, staticCoordinate.y);
  }
  staticElement?.click();
}

function resetstaticLocationMode() {
  staticElement = null;
}

function startAutoClicker() {
  const modeFunction = currentMode === "followMouse" ? followMouseMode : staticLocationMode;

  if (currentMode === "staticLocation") {
    let staticCoordinates = { x: mousePosition.x, y: mousePosition.y };
    autoClickerInterval = setInterval(() => staticLocationMode(staticCoordinates), 4);
  }

  if (currentMode === "followMouse") {
    autoClickerInterval = setInterval(modeFunction, 4);
  }
}

function stopAutoClicker() {
  if (currentMode === "staticLocation") { resetstaticLocationMode(); }
  clearInterval(autoClickerInterval);
  autoClickerInterval = null;
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.mode) {
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
