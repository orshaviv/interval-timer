/**
 * Input Number component functionality
 */

/**
 * Initializes all input number components
 */
export function initInputNumber() {
  const inputWrappers = document.querySelectorAll("[data-hs-input-number]");

  inputWrappers.forEach((wrapper) => {
    const input = wrapper.querySelector("[data-hs-input-number-input]");
    const incrementBtn = wrapper.querySelector(
      "[data-hs-input-number-increment]"
    );
    const decrementBtn = wrapper.querySelector(
      "[data-hs-input-number-decrement]"
    );

    if (!input || !incrementBtn || !decrementBtn) return;

    // Set initial attributes from the original input
    const min =
      input.getAttribute("min") !== null
        ? parseInt(input.getAttribute("min"))
        : null;
    const max =
      input.getAttribute("max") !== null
        ? parseInt(input.getAttribute("max"))
        : null;
    const step =
      input.getAttribute("step") !== null
        ? parseInt(input.getAttribute("step"))
        : 1;

    // Increment button click handler
    incrementBtn.addEventListener("click", () => {
      const currentValue = parseInt(input.value) || 0;
      const newValue = currentValue + step;

      if (max !== null) {
        input.value = Math.min(max, newValue);
      } else {
        input.value = newValue;
      }

      // Trigger input event to maintain compatibility with existing code
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // Decrement button click handler
    decrementBtn.addEventListener("click", () => {
      const currentValue = parseInt(input.value) || 0;
      const newValue = currentValue - step;

      if (min !== null) {
        input.value = Math.max(min, newValue);
      } else {
        input.value = newValue;
      }

      // Trigger input event to maintain compatibility with existing code
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // Handle direct input to ensure constraints
    input.addEventListener("change", () => {
      const currentValue = parseInt(input.value) || 0;

      if (min !== null && currentValue < min) {
        input.value = min;
      }

      if (max !== null && currentValue > max) {
        input.value = max;
      }
    });
  });
}
