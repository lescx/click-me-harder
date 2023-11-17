let autoClickerInterval;
let mousePosition = { x: 0, y: 0 };

document.addEventListener('mousemove', (event) => {
  mousePosition.x = event.clientX;
  mousePosition.y = event.clientY;
});

function simulateClick() {
  console.log("Simulate click");
  let element = document.elementFromPoint(mousePosition.x, mousePosition.y);
  if (element) {
    element.click();
  }
}

function startAutoClicker() {
  if (!autoClickerInterval) { // Start, if not active
    console.log("start AutoClicker");
    autoClickerInterval = setInterval(simulateClick, 1);
  }
}

function stopAutoClicker() {
  if (autoClickerInterval) { // Stop, if active
    console.log("stop AutoClicker");
    clearInterval(autoClickerInterval);
  }
}

// Listener for messages from auto clicker
chrome.runtime.onMessage.addListener((message) => {
  message.autoClickerEnabled ? startAutoClicker() : stopAutoClicker();
});
