/**
 * UI module that manages DOM element references and initialization
 */

/**
 * Gets all necessary DOM element references
 * @returns {Object} Object containing all DOM element references
 */
export function getElements() {
  return {
    setupScreen: document.getElementById("setup-screen"),
    timerScreen: document.getElementById("timer-screen"),
    startButton: document.getElementById("start-button"),
    playPauseButton: document.getElementById("play-pause"),
    resetButton: document.getElementById("reset"),
    backButton: document.getElementById("back-button"),
    timerDisplay: document.getElementById("timer"),
    statusDisplay: document.getElementById("status"),
    intervalTypeDisplay: document.getElementById("interval-type"),
    setInfoDisplay: document.getElementById("set-info"),
    totalTimeDisplay: document.getElementById("total-time"),
    presetsContainer: document.getElementById("presets-container"),
    presetButtons: document.querySelectorAll(".preset-btn"),
    editButton: document.getElementById("edit-btn"),
    inputs: {
      sets: document.getElementById("sets"),
      setRestTime: document.getElementById("set-rest-time"),
      intervals: document.getElementById("intervals"),
      intervalTime: document.getElementById("interval-time"),
      restTime: document.getElementById("rest-time"),
      speedSlider: document.getElementById("speed-slider"),
      speedValue: document.getElementById("speed-value"),
    },
  };
}
