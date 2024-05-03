// @ts-check

import { $$ } from "./util/selector.js";
import { downloadBlob } from "./util/download.js";

import { initEditor, initMonaco } from "./apgm_monaco/init.js";
import { setupCopy } from "./copy.js";

import { formatAPGsembly, integration } from "./integration.js";

initMonaco();

const $examplesButton = $$("#examples", HTMLButtonElement);
const $examples = document.querySelectorAll(".js_example");

const $output = $$("#output", HTMLTextAreaElement);

const $compile = $$("#compile", HTMLButtonElement);

const $run = $$("#run", HTMLButtonElement);

const $copy = $$("#copy", HTMLButtonElement);

const $download = $$("#download", HTMLButtonElement);

const $prefixInput = $$("#prefix_input", HTMLInputElement);

const $watchMode = $$("#watch_mode", HTMLInputElement);

const $disableOptimization = $$("#disable_optimization", HTMLInputElement);

const $apgmInput = $$("#apgm_input", HTMLElement);

const $configButton = $$("#config_button", HTMLButtonElement);

const editor = initEditor($apgmInput);

/**
 * @param {Error & { apgmSpan?: import('../src/apgm/ast/core').APGMSourceSpan }} e
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

        // ウォッチモードではエラーで移動しない
        if (!$watchMode.checked) {
            editor.revealLine(e.apgmSpan.start.line);
        }
    } catch (_e) {
        // ignore
    }
}

const resetError = () => {
    editor.setMarker(undefined);
    $output.classList.remove("is-invalid");
    $apgmInput.style.borderColor = "";
    $output.style.borderColor = "";
    $compile.style.backgroundColor = "";
};

const compile = (withReaction = true) => {
    const input = editor.getValue();
    $output.value = "";
    resetError();
    try {
        /**
         * @type {import('../src/integration/mod').IntegrationOptions}
         */
        const options = {};
        if ($prefixInput.value.trim() !== "") {
            options.prefix = $prefixInput.value.trim();
        }

        options.noOptimize = $disableOptimization.checked;

        /**
         * @type {string}
         */
        const result = formatAPGsembly(integration(input, options).join("\n"));
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

        $output.value = e.message;
        $output.classList.add("is-invalid");
        $download.disabled = true;
        $copy.disabled = true;
        if (withReaction) {
            $apgmInput.style.borderColor = "var(--bs-danger)";
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
        open(url, undefined, "noreferrer=yes,noopener=yes");
    }
});

setupCopy($copy, () => $output.value.trim());

$download.addEventListener("click", () => {
    downloadBlob(new Blob([$output.value]), "output.apg");
});

const DATA_DIR = "./dist/data/";

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

const watchMode = "apgm_watch_mode";

/** @type {number | undefined} */
let id = undefined;

function updateWatchMode() {
    if ($watchMode.checked) {
        id = setInterval(() => {
            compile(false);
        }, 500);
        $compile.disabled = true;
        localStorage.setItem(watchMode, "on");
    } else {
        clearInterval(id);
        $compile.disabled = false;
        localStorage.removeItem(watchMode);
    }
}

$watchMode.addEventListener("change", () => {
    updateWatchMode();
});

$compile.disabled = false;
$run.disabled = false;
$examplesButton.disabled = false;
$configButton.disabled = false;
$copy.disabled = false;
$download.disabled = false;

try {
    if (localStorage.getItem(watchMode) === "on") {
        $watchMode.checked = true;
        updateWatchMode();
    }
} catch (error) {
    console.error(error);
}
