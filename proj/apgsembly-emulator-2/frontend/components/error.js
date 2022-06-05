// @ts-check

/**
 *
 * @param {HTMLElement} $error
 * @param {import('../index.js').AppState} appState
 * @param {string} errorMessage
 */
export function renderErrorMessage($error, appState, errorMessage) {
    if (appState === "RuntimeError" || appState === "ParseError") {
        const messages = errorMessage.split('\n');
        $error.innerHTML = "";
        for (const message of messages) {
            const span = document.createElement('span');
            span.textContent = "- " + message;
            const br = document.createElement('br');
            $error.append(span, br);
        }
        $error.classList.remove('d-none');
    } else {
        $error.classList.add('d-none');
    }
}
