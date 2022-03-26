// @ts-check

// HTMLと合わせること
const START = "Start";
const STOP = "Stop";

const primary = "btn-primary";
const red = "btn-danger";

/**
 *
 * @param {HTMLButtonElement} $toggle
 */
export function startButton($toggle) {
    $toggle.disabled = false;
    $toggle.textContent = START;
    $toggle.classList.add(primary);
    $toggle.classList.remove(red);
}

/**
 *
 * @param {HTMLButtonElement} $toggle
 */
export function startButtonDisabled($toggle) {
    startButton($toggle);
    $toggle.disabled = true;
}

/**
 *
 * @param {HTMLButtonElement} $toggle
 */
export function stopButton($toggle) {
    $toggle.disabled = false;
    $toggle.textContent = STOP;
    $toggle.classList.remove(primary);
    $toggle.classList.add(red);
}
