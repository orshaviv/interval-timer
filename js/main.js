/**
 * Main JavaScript file for Interval Timer application
 */

import { getElements } from "./ui.js";
import { initTimer } from "./timer.js";
import { initPresets } from "./presets.js";
import { initThemeToggle } from "./theme.js";
import { initInputNumber } from "./input-number.js";

/**
 * Initialize the application
 */
function initApp() {
  // Get DOM elements
  const elements = getElements();

  // Initialize timer functionality
  initTimer(elements);

  // Initialize preset functionality
  initPresets(elements);

  // Initialize theme toggle functionality
  initThemeToggle();

  // Initialize input number components
  initInputNumber();
}

// Initialize the app when DOM is fully loaded
document.addEventListener("DOMContentLoaded", initApp);
