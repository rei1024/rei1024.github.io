// @ts-check

// deno.enable = false

import { integration } from "./integration.js";
import { downloadBlob } from "./download.js";
import { initEditor, initMonaco } from "./apgm_monaco/init.js";
import { setupCopy } from "./copy.js";
import { $$ } from "./selector.js";

initMonaco();

const $examplesButton = $$("#examples", HTMLButtonElement);
const $examples = document.querySelectorAll(".js_example");

const $output = $$("#output", HTMLTextAreaElement);

const $compile = $$("#compile", HTMLButtonElement);

const $run = $$("#run", HTMLButtonElement);

const $copy = $$("#copy", HTMLButtonElement);

const $download = $$("#download", HTMLButtonElement);

const $error = $$("#error", HTMLElement);

const $errorMsg = $$("#error_msg", HTMLElement);

const $prefixInput = $$("#prefix_input", HTMLInputElement);

const $watchMode = $$("#watch_mode", HTMLInputElement);

const $apgmInput = $$("#apgm_input", HTMLElement);

const $configButton = $$("#config_button", HTMLButtonElement);

const editor = initEditor($apgmInput);

/**
 * @typedef {{ line: number, column: number }} Loc
 */

/**
 * @param {Error & { apgmSpan?: { start: Loc, end: Loc } }} e
 */
export function showError(e) {
    try {
        if (!e.apgmSpan) {
            return;
        }

        editor.setMarker({
            message: e.message,
            startLineNumber: e.apgmSpan.start.line,
            startColumn: e.apgmSpan.start.column,
            endLineNumber: e.apgmSpan.end.line,
            endColumn: e.apgmSpan.end.column,
        });
        editor.revealLine(e.apgmSpan.start.line);
    } catch (_e) {
        // ignore
    }
}

const resetError = () => {
    editor.setMarker(undefined);
    $error.classList.add("d-none");
    $apgmInput.style.borderColor = "";
    $output.style.borderColor = "";
    $compile.style.backgroundColor = "";
};

const compile = (withReaction = true) => {
    $output.value = "";
    resetError();
    try {
        /**
         * @type {{ prefix?: string }}
         */
        const options = {};
        if ($prefixInput.value.trim() !== "") {
            options.prefix = $prefixInput.value.trim();
        }

        /**
         * @type {string}
         */
        const result = integration(editor.getValue(), options).join("\n");
        $output.value = result;
        $download.disabled = false;
        $copy.disabled = false;
        if (withReaction) {
            $compile.style.backgroundColor = "var(--bs-success)";
        }
        $output.style.borderColor = "var(--bs-success)";
        setTimeout(() => {
            $output.style.borderColor = "";
            if (withReaction) {
                $compile.style.backgroundColor = "";
            }
        }, 500);
    } catch (e) {
        if (!(e instanceof Error)) {
            e = new Error("unknown error");
        }

        $errorMsg.textContent = e.message;
        $error.classList.remove("d-none");
        $download.disabled = true;
        $copy.disabled = true;
        if (withReaction) {
            $apgmInput.style.borderColor = "#dc3545";
            $apgmInput.style.borderWidth = "2px";
        }
        showError(e);
    }
};

$compile.addEventListener("click", () => {
    compile();
});

$run.addEventListener("click", () => {
    compile();
    if (!$copy.disabled) {
        const url = new URL(
            "https://rei1024.github.io/proj/apgsembly-emulator-2/",
        );
        localStorage.setItem("initial_code", $output.value);
        open(url);
    }
});

setupCopy($copy, () => $output.value.trim());

$download.addEventListener("click", () => {
    downloadBlob(new Blob([$output.value]), "output.apg");
});

const DATA_DIR = location.origin.includes("github")
    ? "./dist/data/"
    : "./dist/data/";

$examples.forEach((example) => {
    if (!(example instanceof HTMLElement)) {
        throw Error("example is not HTMLElement");
    }
    example.addEventListener("click", () => {
        fetch(DATA_DIR + example.dataset.src)
            .then((x) => x.text())
            .then((str) => {
                editor.setValue(str);
                editor.scrollToTop();
                setTimeout(() => {
                    compile();
                }, 0);
            });
    });
});

/** @type {number | undefined} */
let id = undefined;
$watchMode.addEventListener("change", () => {
    if ($watchMode.checked) {
        id = setInterval(() => {
            compile(false);
        }, 500);
        $compile.disabled = true;
    } else {
        clearInterval(id);
        $compile.disabled = false;
    }
});

$compile.disabled = false;
$run.disabled = false;
$examplesButton.disabled = false;
$configButton.disabled = false;
$copy.disabled = false;
$download.disabled = false;
