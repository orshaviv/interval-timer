/**
 * Manages timer presets
 */

// State for preset handling
let editMode = false;
let currentlySelectedPreset = null;

/**
 * Initializes presets and loads default if available
 * @param {Object} elements - DOM elements for the app
 */
export function initPresets(elements) {
  loadPresets(elements);

  // Load preset 1 by default if it exists
  const preset1 = localStorage.getItem("preset_1");
  if (preset1) {
    loadPreset("1", elements);
  }

  // Add event listeners
  elements.editButton.addEventListener("click", () => toggleEditMode(elements));
  elements.presetButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => handlePresetClick(e, elements));
  });

  // Add listeners to inputs to clear selected preset on manual changes
  elements.inputs.sets.addEventListener("input", clearSelectedPreset);
  elements.inputs.setRestTime.addEventListener("input", clearSelectedPreset);
  elements.inputs.intervals.addEventListener("input", clearSelectedPreset);
  elements.inputs.intervalTime.addEventListener("input", clearSelectedPreset);
  elements.inputs.restTime.addEventListener("input", clearSelectedPreset);
  elements.inputs.speedSlider.addEventListener("input", function () {
    const speed = parseFloat(this.value) / 100;
    elements.inputs.speedValue.textContent = speed.toFixed(1) + "x";
    clearSelectedPreset();
  });
}

/**
 * Loads all preset buttons from localStorage
 * @param {Object} elements - DOM elements
 */
function loadPresets(elements) {
  for (let i = 1; i <= 5; i++) {
    const preset = localStorage.getItem(`preset_${i}`);
    const presetBtn = document.querySelector(`.preset-btn[data-preset="${i}"]`);

    if (preset) {
      presetBtn.classList.add("active");
    } else {
      presetBtn.classList.remove("active");
    }
  }
}

/**
 * Toggles preset edit mode
 * @param {Object} elements - DOM elements
 */
function toggleEditMode(elements) {
  editMode = !editMode;
  elements.presetsContainer.classList.toggle("edit-mode", editMode);
  elements.editButton.textContent = editMode ? "Done" : "Edit";
}

/**
 * Handles preset button clicks
 * @param {Event} e - Click event
 * @param {Object} elements - DOM elements
 */
function handlePresetClick(e, elements) {
  const presetNumber = e.target.dataset.preset;

  if (editMode) {
    savePreset(presetNumber, elements);
  } else {
    loadPreset(presetNumber, elements);
  }
}

/**
 * Saves current timer settings to a preset
 * @param {string} presetNumber - Preset number
 * @param {Object} elements - DOM elements
 */
function savePreset(presetNumber, elements) {
  const presetData = {
    sets: elements.inputs.sets.value,
    setRestTime: elements.inputs.setRestTime.value,
    intervals: elements.inputs.intervals.value,
    intervalTime: elements.inputs.intervalTime.value,
    restTime: elements.inputs.restTime.value,
  };

  localStorage.setItem(`preset_${presetNumber}`, JSON.stringify(presetData));
  const presetBtn = document.querySelector(
    `.preset-btn[data-preset="${presetNumber}"]`
  );
  presetBtn.classList.add("active");

  if (currentlySelectedPreset !== null) {
    document
      .querySelector(`.preset-btn[data-preset="${currentlySelectedPreset}"]`)
      ?.classList.remove("selected");
  }

  currentlySelectedPreset = presetNumber;
  presetBtn.classList.add("selected");

  // Flash effect for visual feedback
  presetBtn.style.transform = "scale(1.2)";
  presetBtn.style.transition = "transform 0.2s";

  setTimeout(() => {
    presetBtn.style.transform = "scale(1)";
    if (currentlySelectedPreset === presetNumber) {
      presetBtn.classList.add("selected");
    }
  }, 200);
}

/**
 * Loads a preset into the UI
 * @param {string} presetNumber - Preset number
 * @param {Object} elements - DOM elements
 */
function loadPreset(presetNumber, elements) {
  const presetData = localStorage.getItem(`preset_${presetNumber}`);

  if (presetData) {
    const preset = JSON.parse(presetData);
    elements.inputs.sets.value = preset.sets || 1;
    elements.inputs.setRestTime.value = preset.setRestTime || "00:00";
    elements.inputs.intervals.value = preset.intervals;
    elements.inputs.intervalTime.value = preset.intervalTime;
    elements.inputs.restTime.value = preset.restTime;

    const speedValue = 100;
    elements.inputs.speedSlider.value = speedValue;
    elements.inputs.speedValue.textContent =
      (parseFloat(speedValue) / 100).toFixed(1) + "x";

    // Update the selected preset visual indicator
    if (currentlySelectedPreset !== null) {
      document
        .querySelector(`.preset-btn[data-preset="${currentlySelectedPreset}"]`)
        ?.classList.remove("selected");
    }

    currentlySelectedPreset = presetNumber;
    document
      .querySelector(`.preset-btn[data-preset="${presetNumber}"]`)
      .classList.add("selected");
  }
}

/**
 * Clears the currently selected preset
 */
export function clearSelectedPreset() {
  if (currentlySelectedPreset !== null) {
    document
      .querySelector(`.preset-btn[data-preset="${currentlySelectedPreset}"]`)
      ?.classList.remove("selected");
    currentlySelectedPreset = null;
  }
}
