let autoClickerInterval;
let mousePosition = { x: 0, y: 0 }; // Initialisiere mousePosition

// Event-Listener für Mausbewegungen
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

// Funktion, um den AutoClicker zu starten
function startAutoClicker() {
  if (!autoClickerInterval) { // Starte nur, wenn noch nicht aktiv
    console.log("start AutoClicker");
    autoClickerInterval = setInterval(simulateClick, 2);
  }
}

// Funktion, um den AutoClicker zu stoppen
function stopAutoClicker() {
  if (autoClickerInterval) { // Stoppe nur, wenn aktiv
    console.log("stop AutoClicker");
    clearInterval(autoClickerInterval);
    autoClickerInterval = null;
  }
}

// Listener für Nachrichten von der Erweiterung
chrome.runtime.onMessage.addListener((message) => {
  if (message.autoClickerEnabled) {
    startAutoClicker();
  } else {
    stopAutoClicker();
  }
});
