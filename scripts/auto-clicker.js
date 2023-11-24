"use strict";

// Mark this script as injected, used for the service-worker
window.autoClickerInjected = true;

let isEnabled = false;
let autoClickerInterval; // is set to the return value of setInterval(); 4ms for on, null for off
let mousePosition = { x: 0, y: 0 };
let currentMode = null;

document.addEventListener('mousemove', (event) => {
  if (isEnabled && currentMode === "followMouse" || currentMode === "fixedLocation") {
    mousePosition.x = event.clientX;
    mousePosition.y = event.clientY;
  }
});

// TODO:
// Hier ist eine Optimierung möglich, in dem man nicht immer wieder das Element
// sucht unter dem Cursor. Insbesondere bei dem fixedLocation mode, muss das
// Element nur einmal gesucht werden.
function simulateClickAtPosition(x, y) {
  const element = document.elementFromPoint(x, y);
  element?.click();
}

// Mode which simulates a click every 4ms under the mouse cursor
function followMouseMode() {
  simulateClickAtPosition(mousePosition.x, mousePosition.y);
}

// User clicks position after enabling this mode and
// it then autoclicks at the position
function fixedLocationMode(fixedCoordinate) {
  simulateClickAtPosition(fixedCoordinate.x, fixedCoordinate.y); // for some reason, these coordinates are 0 0 here.
}

function startAutoClicker() {
  const modeFunction = currentMode === "followMouse" ? followMouseMode : fixedLocationMode;
  console.log("started auto clicker (mode: " + currentMode + ")");

  if (currentMode === "fixedLocation") {
    let fixedCoordinates = { x: mousePosition.x, y: mousePosition.y };
    console.log(fixedCoordinates);
    autoClickerInterval = setInterval(() => fixedLocationMode(fixedCoordinates), 4);
  } else {
    autoClickerInterval = setInterval(modeFunction, 4);
  }
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
