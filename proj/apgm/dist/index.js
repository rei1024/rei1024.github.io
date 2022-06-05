// @ts-check

// deno.enable = false

import { integration } from "./integraion.js";
import { downloadBlob } from "./download.js";
import { initEditor, initMonaco } from "./apgm_monaco/init.js";

initMonaco();

const $examples = document.querySelectorAll(".js_example");

const $output = document.querySelector("#output");
if (!($output instanceof HTMLTextAreaElement)) {
    throw Error("$output");
}

const $compile = document.querySelector("#compile");
if (!($compile instanceof HTMLButtonElement)) {
    throw Error("$compile");
}

const $run = document.querySelector("#run");
if (!($run instanceof HTMLButtonElement)) {
    throw Error("$run");
}

const $copy = document.querySelector("#copy");
if (!($copy instanceof HTMLButtonElement)) {
    throw Error("$copy");
}

const $download = document.querySelector("#download");
if (!($download instanceof HTMLButtonElement)) {
    throw Error("$download");
}

const $error = document.querySelector("#error");
if (!($error instanceof HTMLElement)) {
    throw Error("$error");
}

const $errorMsg = document.querySelector("#error_msg");
if (!($errorMsg instanceof HTMLElement)) {
    throw Error("$errorMsg");
}

const $prefix_input = document.querySelector("#prefix_input");
if (!($prefix_input instanceof HTMLInputElement)) {
    throw Error("$prefix_input");
}

const $apgmInput = document.querySelector("#apgm_input");
if (!($apgmInput instanceof HTMLElement)) {
    throw Error("$apgmInput");
}

const editor = initEditor($apgmInput);

/**
 * @param {{ message: string, apgmLocation: { line: number, column: number } }} e
 */
export function showError(e) {
    try {
        const line = e.apgmLocation.line;
        const column = e.apgmLocation.column;
        if (!Number.isInteger(line)) {
            return;
        }
        editor.setMarker({
            message: e.message,
            startLineNumber: line,
            startColumn: column,
            endLineNumber: line,
            endColumn: column + 3,
        });
        editor.revealLine(line);
    } catch (_e) {
        // NOP
    }
}

const resetError = () => {
    editor.setMarker(undefined);
    $error.style.display = "none";
    $apgmInput.style.borderColor = "";
    $output.style.borderColor = "";
    $compile.style.backgroundColor = "";
};

const compile = () => {
    $output.value = "";
    resetError();
    try {
        const options = {};
        if ($prefix_input.value.trim() !== "") {
            options.prefix = $prefix_input.value.trim();
        }

        /**
         * @type {string}
         */
        const result = integration(editor.getValue(), options).join("\n");
        $output.value = result;
        $download.disabled = false;
        $copy.disabled = false;
        $output.style.borderColor = "var(--bs-success)";
        $compile.style.backgroundColor = "var(--bs-success)";
        setTimeout(() => {
            $output.style.borderColor = "";
            $compile.style.backgroundColor = "";
        }, 500);
    } catch (e) {
        if (!(e instanceof Error)) {
            e = new Error("unknown error");
        }

        $errorMsg.textContent = e.message;
        $error.style.display = "block";
        $download.disabled = true;
        $copy.disabled = true;
        $apgmInput.style.borderColor = "#dc3545";
        $apgmInput.style.borderWidth = "2px";
        if (typeof e.apgmLocation !== "undefined") {
            showError(e);
        }
    }
};

$compile.addEventListener("click", () => {
    compile();
});

$run.addEventListener("click", () => {
    compile();
    // @ts-ignore
    if (!$copy.disabled) {
        const url = new URL(
            "https://rei1024.github.io/proj/apgsembly-emulator-2/",
        );
        localStorage.setItem("initial_code", $output.value);
        open(url);
    }
});

$copy.addEventListener("click", () => {
    navigator.clipboard.writeText($output.value.trim()).then(() => {
        $copy.textContent = "Copied";
        $copy.classList.add("btn-success");
        $copy.classList.remove("btn-primary");
        setTimeout(() => {
            $copy.textContent = "Copy";
            $copy.classList.remove("btn-success");
            $copy.classList.add("btn-primary");
        }, 1000);
    });
});

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
