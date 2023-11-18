"use strict";

if (typeof autoClickerInit === 'undefined') {
  let autoClickerInterval;
  let mousePosition = { x: 0, y: 0 };
  const autoClickerInit = true; // Flag to prevent re-initialization

  document.addEventListener('mousemove', (event) => {
    mousePosition.x = event.clientX;
    mousePosition.y = event.clientY;
  });

  function simulateClick() {
    const element = document.elementFromPoint(mousePosition.x, mousePosition.y);
    element?.click();
  }

  function startAutoClicker() {
    autoClickerInterval = setInterval(simulateClick, 1);
  }

  function stopAutoClicker() {
    clearInterval(autoClickerInterval);
  }

  chrome.runtime.onMessage.addListener((message) => {
    message.autoClickerEnabled ? startAutoClicker() : stopAutoClicker();
  });
}
