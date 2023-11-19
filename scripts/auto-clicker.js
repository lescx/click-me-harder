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

// simulateClick() currently retrieves the cursor position once every
// Millisecond. This is overkill when the mouse doesn't actually move.
// There is a lot of performance saving potential here.
function simulateClick() {
  const element = document.elementFromPoint(mousePosition.x, mousePosition.y);
  element?.click();
}

// There might be a better way to start and stop the auto clicker then by
// clearing autoClickerInterval
function startAutoClicker() {
  autoClickerInterval = setInterval(simulateClick, 5);
}

function stopAutoClicker() {
  clearInterval(autoClickerInterval);
}

// Event listener for messages from the service worker
// to start or stop the auto clicker.
chrome.runtime.onMessage.addListener((message) => {
  if (message.toggle) {
    isEnabled = !isEnabled;
    isEnabled ? startAutoClicker() : stopAutoClicker();
  }
});
