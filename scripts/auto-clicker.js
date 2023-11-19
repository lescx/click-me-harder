"use strict";

// Mark the script as injected
window.autoClickerInjected = true;

let isEnabled = false;
let autoClickerInterval;
let mousePosition = { x: 0, y: 0 };

document.addEventListener('mousemove', (event) => {
  mousePosition.x = event.clientX;
  mousePosition.y = event.clientY;
});

// simulateClick() currently retrieves the cursor position once every 4ms.
// This is overkill when the mouse doesn't actually move.
// There is a possible performance improvement.
function simulateClick() {
  const element = document.elementFromPoint(mousePosition.x, mousePosition.y);
  element?.click();
}

// TODO:
// Add arg1 to the setInterval function which should specify which
// mode I want to enter.
function startAutoClicker() {
  autoClickerInterval = setInterval(simulateClick, 4);
}

function stopAutoClicker() {
  clearInterval(autoClickerInterval);
  autoClickerInterval = null;
}

// Event listener for messages from the service worker
// to start or stop the auto clicker.
// TODO:
// Add arg1 to startAutoClicker() (and stopAutoClicker()?)
chrome.runtime.onMessage.addListener((message) => {
  if (message.toggle) {
    isEnabled = !isEnabled;
    isEnabled ? startAutoClicker() : stopAutoClicker();
  }
});
