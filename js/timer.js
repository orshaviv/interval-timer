/**
 * Timer module that handles the interval timer functionality
 */

import {
  speak,
  formatSecondsToTime,
  getTimeInSeconds,
  acquireWakeLock,
  releaseWakeLock,
} from "./utils.js";

// Timer state
class Timer {
  constructor() {
    this.intervals = 0;
    this.intervalTime = 0;
    this.restTime = 0;
    this.currentInterval = 1;
    this.isResting = false;
    this.timeRemaining = 0;
    this.originalTime = 0;
    this.isRunning = false;
    this.timerId = null;
    this.lastCountdownTime = null;
    this.sets = 1;
    this.setRestTime = 30;
    this.currentSet = 1;
    this.isBetweenSets = false;
    this.waitForUserBetweenSets = false;
    this.totalElapsedTime = 0;
    this.totalElapsedTimer = null;
    this.totalStartTime = 0;
    this.wakeLock = null;
    this.speed = 1.0;
  }
}

const timer = new Timer();

/**
 * Initializes timer event listeners
 * @param {Object} elements - DOM elements
 */
export function initTimer(elements) {
  elements.startButton.addEventListener("click", () => startTimer(elements));
  elements.playPauseButton.addEventListener("click", () =>
    togglePlayPause(elements)
  );
  elements.resetButton.addEventListener("click", () =>
    resetCurrentInterval(elements)
  );
  elements.backButton.addEventListener("click", () => backToSettings(elements));
}

/**
 * Starts the timer based on input values
 * @param {Object} elements - DOM elements
 */
export function startTimer(elements) {
  // Get values from input fields
  timer.sets = parseInt(elements.inputs.sets.value) || 1;
  timer.intervals = parseInt(elements.inputs.intervals.value) || 1;

  // Get interval time from time input
  timer.intervalTime = getTimeInSeconds(elements.inputs.intervalTime.value);

  // Get set rest time
  timer.waitForUserBetweenSets = elements.inputs.setRestTime.value === "00:00";
  timer.setRestTime = timer.waitForUserBetweenSets
    ? 0
    : getTimeInSeconds(elements.inputs.setRestTime.value);

  // Get rest time
  timer.restTime = getTimeInSeconds(elements.inputs.restTime.value);

  // Get speed value
  timer.speed = parseFloat(elements.inputs.speedSlider.value) / 100;

  // Reset timer state
  timer.currentSet = 1;
  timer.currentInterval = 1;
  timer.isResting = false;
  timer.isBetweenSets = false;
  timer.timeRemaining = timer.intervalTime;
  timer.originalTime = timer.intervalTime;
  timer.isRunning = true;
  timer.lastCountdownTime = null;
  timer.totalElapsedTime = 0;
  timer.totalStartTime = Date.now();

  // Acquire wake lock
  acquireWakeLock().then((lock) => {
    timer.wakeLock = lock;
  });

  // Update UI
  updateDisplay(elements);
  elements.setupScreen.classList.add("hidden");
  elements.timerScreen.classList.remove("hidden");
  elements.presetsContainer.classList.add("hidden");

  // Hide set info if sets = 0
  elements.setInfoDisplay.classList.toggle("hidden-element", timer.sets <= 0);

  // Announce start
  speak("Interval 1 begin");

  // Start timers
  startCountdown(elements);
  startTotalTimeTracking(elements);
}

/**
 * Toggles the timer between play and pause
 * @param {Object} elements - DOM elements
 */
function togglePlayPause(elements) {
  if (timer.isRunning) {
    // Pause the timer
    clearInterval(timer.timerId);
    clearInterval(timer.totalElapsedTimer);
    timer.isRunning = false;
    elements.playPauseButton.textContent = timer.isBetweenSets
      ? "Start Next Set"
      : "Play";
    elements.playPauseButton.classList.add("paused");
    releaseWakeLock(timer.wakeLock);
    timer.wakeLock = null;
  } else {
    // Resume the timer or start next set
    timer.isRunning = true;
    timer.totalStartTime = Date.now() - timer.totalElapsedTime * 1000;

    if (timer.isBetweenSets && timer.waitForUserBetweenSets) {
      // Start the next set after manual pause
      timer.isBetweenSets = false;
      timer.timeRemaining = timer.intervalTime;
      timer.originalTime = timer.intervalTime;
      speak(`Set ${timer.currentSet} begin. Interval 1`);
    }

    acquireWakeLock().then((lock) => {
      timer.wakeLock = lock;
    });
    elements.playPauseButton.textContent = "Pause";
    elements.playPauseButton.classList.remove("paused");
    startCountdown(elements);
    startTotalTimeTracking(elements);
  }
}

/**
 * Resets the current interval back to the beginning
 * @param {Object} elements - DOM elements
 */
function resetCurrentInterval(elements) {
  clearInterval(timer.timerId);
  clearInterval(timer.totalElapsedTimer);

  // Reset to beginning of workout
  timer.currentSet = 1;
  timer.currentInterval = 1;
  timer.isResting = false;
  timer.isBetweenSets = false;

  // Reset time
  timer.timeRemaining = timer.intervalTime;
  timer.originalTime = timer.timeRemaining;
  timer.lastCountdownTime = null;

  // Reset total elapsed time
  timer.totalElapsedTime = 0;
  timer.totalStartTime = Date.now();

  // Release and reacquire wake lock if still running
  if (timer.isRunning) {
    releaseWakeLock(timer.wakeLock);
    timer.wakeLock = null;
    acquireWakeLock().then((lock) => {
      timer.wakeLock = lock;
    });
  }

  updateDisplay(elements);
  updateTotalTimeDisplay(elements);

  if (timer.isRunning) {
    startCountdown(elements);
    startTotalTimeTracking(elements);
  }
}

/**
 * Returns to the setup screen
 * @param {Object} elements - DOM elements
 */
function backToSettings(elements) {
  clearInterval(timer.timerId);
  clearInterval(timer.totalElapsedTimer);
  timer.isRunning = false;

  if (timer.wakeLock) {
    releaseWakeLock(timer.wakeLock);
    timer.wakeLock = null;
  }

  elements.timerScreen.classList.add("hidden");
  elements.setupScreen.classList.remove("hidden");
  elements.presetsContainer.classList.remove("hidden");

  // Cancel any ongoing speech
  const synth = window.speechSynthesis;
  synth.cancel();
}

/**
 * Starts the main countdown
 * @param {Object} elements - DOM elements
 */
function startCountdown(elements) {
  clearInterval(timer.timerId);

  const startTime = Date.now();
  const initialTimeRemaining = timer.timeRemaining;

  timer.timerId = setInterval(() => {
    // Apply speed multiplier to elapsed time calculation
    const elapsedTime = Math.floor(
      ((Date.now() - startTime) / 1000) * timer.speed
    );
    timer.timeRemaining = Math.max(0, initialTimeRemaining - elapsedTime);

    // Voice countdown logic
    const originalDuration = timer.isBetweenSets
      ? timer.setRestTime
      : timer.isResting
      ? timer.restTime
      : timer.intervalTime;

    if (
      timer.timeRemaining <= 3 &&
      timer.timeRemaining > 0 &&
      originalDuration > 3
    ) {
      // Only speak if we haven't already spoken this number
      if (timer.lastCountdownTime !== timer.timeRemaining) {
        speak(timer.timeRemaining.toString());
        timer.lastCountdownTime = timer.timeRemaining;
      }
    }

    updateDisplay(elements);

    if (timer.timeRemaining === 0) {
      clearInterval(timer.timerId);

      if (timer.isBetweenSets) {
        // Between-sets rest is complete, start the next set
        timer.isBetweenSets = false;
        timer.timeRemaining = timer.intervalTime;
        timer.originalTime = timer.intervalTime;
        speak(`Set ${timer.currentSet} begin. Interval 1`);
        updateDisplay(elements);
        if (timer.isRunning) {
          startCountdown(elements);
        }
      } else {
        handleIntervalComplete(elements);
      }
    }
  }, 100);
}

/**
 * Handles completion of the current interval
 * @param {Object} elements - DOM elements
 */
function handleIntervalComplete(elements) {
  if (timer.isResting) {
    // Rest period completed, move to next interval
    timer.currentInterval++;
    timer.isResting = false;

    if (timer.currentInterval > timer.intervals) {
      // All intervals in this set completed
      handleSetComplete(elements);
      return;
    }

    timer.timeRemaining = timer.intervalTime;
    timer.originalTime = timer.intervalTime;
    speak(`Interval ${timer.currentInterval} begin`);
  } else {
    // Work interval completed
    if (timer.restTime > 0) {
      // Move to rest period if rest time > 0
      timer.isResting = true;
      timer.timeRemaining = timer.restTime;
      timer.originalTime = timer.restTime;
      speak("Rest");
    } else {
      // Skip rest period if rest time is 0
      timer.currentInterval++;

      if (timer.currentInterval > timer.intervals) {
        // All intervals in this set completed
        handleSetComplete(elements);
        return;
      }

      // Set up next interval immediately
      timer.timeRemaining = timer.intervalTime;
      timer.originalTime = timer.intervalTime;
      speak(`Interval ${timer.currentInterval} begin`);
    }
  }

  timer.lastCountdownTime = null;
  updateDisplay(elements);
  if (timer.isRunning) {
    startCountdown(elements);
  }
}

/**
 * Handles completion of the current set
 * @param {Object} elements - DOM elements
 */
function handleSetComplete(elements) {
  // If sets = 0 or 1, or we've completed all sets, finish the workout
  if (timer.sets <= 1 || timer.currentSet >= timer.sets) {
    completeWorkout(elements);
    return;
  }

  // Move to next set
  timer.currentSet++;
  timer.currentInterval = 1;
  timer.isResting = false;

  if (timer.waitForUserBetweenSets) {
    // Pause for user to resume manually
    timer.isBetweenSets = true;
    timer.isRunning = false;
    elements.playPauseButton.textContent = "Start Next Set";
    elements.playPauseButton.classList.add("paused");
    speak("Set complete. Press Start when ready for next set.");
    updateDisplay(elements);
  } else {
    // Start the rest period between sets
    timer.isBetweenSets = true;
    timer.timeRemaining = timer.setRestTime;
    timer.originalTime = timer.setRestTime;
    speak(
      `Set complete. Rest for ${formatSecondsToTime(
        timer.setRestTime
      )} before next set.`
    );
    updateDisplay(elements);

    if (timer.isRunning) {
      startCountdown(elements);
    }
  }
}

/**
 * Completes the workout and returns to setup screen
 * @param {Object} elements - DOM elements
 */
function completeWorkout(elements) {
  speak("Set completed");
  clearInterval(timer.totalElapsedTimer);
  elements.setupScreen.classList.remove("hidden");
  elements.timerScreen.classList.add("hidden");
  elements.presetsContainer.classList.remove("hidden");
  timer.isRunning = false;

  if (timer.wakeLock) {
    releaseWakeLock(timer.wakeLock);
    timer.wakeLock = null;
  }
}

/**
 * Starts tracking total elapsed time
 * @param {Object} elements - DOM elements
 */
function startTotalTimeTracking(elements) {
  clearInterval(timer.totalElapsedTimer);
  timer.totalElapsedTimer = setInterval(() => {
    if (timer.isRunning) {
      timer.totalElapsedTime = Math.floor(
        (Date.now() - timer.totalStartTime) / 1000
      );
      updateTotalTimeDisplay(elements);
    }
  }, 1000);
}

/**
 * Updates the total time display
 * @param {Object} elements - DOM elements
 */
function updateTotalTimeDisplay(elements) {
  elements.totalTimeDisplay.textContent = formatSecondsToTime(
    timer.totalElapsedTime
  );
}

/**
 * Updates the timer display based on current state
 * @param {Object} elements - DOM elements
 */
function updateDisplay(elements) {
  // Update timer display
  if (timer.isBetweenSets) {
    // Show time in mm:ss format for rest between sets
    elements.timerDisplay.textContent = formatSecondsToTime(
      timer.timeRemaining
    );
  } else {
    // Keep regular seconds display for intervals
    elements.timerDisplay.textContent = timer.timeRemaining;
  }

  // Update status text based on current state
  if (timer.isBetweenSets) {
    elements.statusDisplay.textContent = `Rest between sets`;
    elements.intervalTypeDisplay.textContent = "REST";
    elements.intervalTypeDisplay.style.color = "#3498db";
  } else {
    elements.statusDisplay.textContent = `Interval ${timer.currentInterval} of ${timer.intervals}`;
    elements.intervalTypeDisplay.textContent = timer.isResting
      ? "REST"
      : "WORK";
    elements.intervalTypeDisplay.style.color = timer.isResting
      ? "#3498db"
      : "#e74c3c";
  }

  // Update set info (hide if sets = 0)
  if (timer.sets > 0) {
    elements.setInfoDisplay.textContent = `Set ${timer.currentSet} of ${timer.sets}`;
    elements.setInfoDisplay.classList.remove("hidden-element");
  } else {
    elements.setInfoDisplay.classList.add("hidden-element");
  }
}
