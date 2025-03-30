/**
 * Utility functions for the interval timer
 */

// Speech synthesis
const synth = window.speechSynthesis;

/**
 * Speaks the provided text using speech synthesis
 * @param {string} text - Text to be spoken
 */
export function speak(text) {
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  synth.speak(utterance);
}

/**
 * Formats seconds to a mm:ss time string
 * @param {number} totalSeconds - Total seconds to format
 * @returns {string} Formatted time string (mm:ss)
 */
export function formatSecondsToTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

/**
 * Converts a time input value to seconds
 * @param {string} timeValue - Time value in "mm:ss" format
 * @returns {number} Total seconds
 */
export function getTimeInSeconds(timeValue) {
  if (!timeValue) return 0;
  const [minutes, seconds] = timeValue.split(":").map(Number);
  return minutes * 60 + seconds;
}

/**
 * Acquires a wake lock to prevent the screen from sleeping
 * @returns {Promise<WakeLockSentinel|null>} Wake lock or null if not supported/failed
 */
export async function acquireWakeLock() {
  if ("wakeLock" in navigator) {
    try {
      const wakeLock = await navigator.wakeLock.request("screen");
      console.log("Wake lock acquired");

      wakeLock.addEventListener("release", () => {
        console.log("Wake lock released");
      });

      return wakeLock;
    } catch (err) {
      console.log("Wake lock request failed: ", err.message);
      return null;
    }
  }
  return null;
}

/**
 * Releases a wake lock
 * @param {WakeLockSentinel} wakeLock - The wake lock to release
 * @returns {Promise<void>}
 */
export async function releaseWakeLock(wakeLock) {
  if (wakeLock) {
    try {
      await wakeLock.release();
      console.log("Wake lock released");
    } catch (err) {
      console.log("Error releasing wake lock: ", err.message);
    }
  }
}
