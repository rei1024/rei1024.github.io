// @ts-check

/* eslint-disable no-undef */

import { create } from "./create.js";
import { $type } from "../../frontend/util/selector.js";

$type("#close", HTMLElement).addEventListener("click", () => {
    globalThis.close();
});

const diagram = $type("#diagram", HTMLElement);

/**
 * @param {string} graphDefinition
 */
function render(graphDefinition) {
    // @ts-ignore
    mermaid.mermaidAPI.render(
        "svg",
        graphDefinition,
        /**
         * @param {string} svgString
         */
        function (svgString) {
            diagram.innerHTML = svgString;
        },
    );
}

const KEY = "state-diagram-input";

const string = localStorage.getItem(KEY);

if (string == null) {
    diagram.innerHTML = "";

    const span = document.createElement("span");
    span.textContent = "Go To ";

    const a = document.createElement("a");
    a.href = "../../index.html";
    a.textContent = "APGsembly Emulator";

    const div = document.createElement("div");
    div.append(span, a);
    diagram.append(div);
} else {
    localStorage.removeItem(KEY);
    render(create(string));
}

const input = $type("#input", HTMLTextAreaElement);

input.addEventListener("input", () => {
    try {
        render(create(input.value));
        input.classList.remove("is-invalid");
    } catch (error) {
        if (error instanceof Error) {
            const lines = error.message.split("\n");
            diagram.innerHTML = "";
            diagram.append(
                ...lines.flatMap((
                    line,
                ) => [line, document.createElement("br")]),
            );
        }
        input.classList.add("is-invalid");
    }
});

function enableInput() {
    input.parentElement?.classList.remove("d-none");
}

// @ts-ignore
window.enableInput = enableInput;
