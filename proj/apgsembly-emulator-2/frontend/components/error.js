// @ts-check

import { create } from "../util/create.js";

/**
 * @param {HTMLElement} $error
 * @param {import('../app.js').AppState} appState
 * @param {string} errorMessage
 */
export function renderErrorMessage($error, appState, errorMessage) {
    $error.replaceChildren();
    if (appState === "RuntimeError" || appState === "ParseError") {
        const messages = errorMessage.split("\n");
        for (const message of messages) {
            $error.append(
                create("span", "- " + message),
                create("br"),
            );
        }
        $error.classList.remove("d-none");
    } else {
        $error.classList.add("d-none");
    }
}
