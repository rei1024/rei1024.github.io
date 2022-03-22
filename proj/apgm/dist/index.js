// @ts-check

// deno.enable = false

import { integration } from "./integraion.js";
import { downloadBlob } from "./download.js";
import { initEditor, initMonaco } from "./apgm_monaco/init.js";

initMonaco();

const $samples = document.querySelectorAll(".js_sample");

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

const $prefix_input = document.querySelector("#prefix_input");
if (!($prefix_input instanceof HTMLInputElement)) {
    throw Error("$prefix_input");
}

const $apgmInput = document.querySelector("#apgm_input");
if (!($apgmInput instanceof HTMLElement)) {
    throw Error("$apgmInput");
}

const editor = initEditor($apgmInput);

const compile = () => {
    $output.value = "";
    try {
        const options = {};
        if ($prefix_input.value.trim() !== "") {
            options.prefix = $prefix_input.value.trim();
        }

        /**
         * @type {string}
         */
        const result = integration(editor.getValue(), options).join("\n");
        $download.disabled = false;
        $copy.disabled = false;
        $error.style.display = "none";
        $output.value = result;
        $apgmInput.style.borderColor = "";
    } catch (e) {
        if (!(e instanceof Error)) {
            e = new Error("unknown error");
        }
        $error.textContent = e.message;
        $error.style.display = "block";
        $download.disabled = true;
        $copy.disabled = true;
        $apgmInput.style.borderColor = "#dc3545";
        $apgmInput.style.borderWidth = "2px";
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
        setTimeout(() => {
            $copy.textContent = "Copy";
        }, 1000);
    });
});

$download.addEventListener("click", () => {
    downloadBlob(new Blob([$output.value]), "output.apg");
});

const DATA_DIR = location.origin.includes("github")
    ? "./dist/data/"
    : "./dist/data/";

$samples.forEach((sample) => {
    if (!(sample instanceof HTMLElement)) {
        throw Error("sample is not HTMLElement");
    }
    sample.addEventListener("click", () => {
        fetch(DATA_DIR + sample.dataset.src).then((x) => x.text()).then(
            (str) => {
                editor.setValue(str);
                editor.scrollToTop();
            },
        );
    });
});
