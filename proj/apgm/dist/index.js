// @ts-check

// deno.enable = false

import { integration } from "./integraion.js";

const $input = document.querySelector("#input");

if (!($input instanceof HTMLTextAreaElement)) {
    throw Error("$input");
}

const $samples = document.querySelectorAll(".js_sample");

const $output = document.querySelector("#output");
if (!($output instanceof HTMLTextAreaElement)) {
    throw Error("$output");
}

const $compile = document.querySelector("#compile");
if (!($compile instanceof HTMLButtonElement)) {
    throw Error("$compile");
}

const $copy = document.querySelector("#copy");
if (!($copy instanceof HTMLButtonElement)) {
    throw Error("$compile");
}

const $error = document.querySelector("#error");
if (!($error instanceof HTMLElement)) {
    throw Error("$error");
}

$compile.addEventListener("click", () => {
    $output.value = "";
    $input.classList.remove("is-invalid");
    try {
        /**
         * @type {string}
         */
        const result = integration($input.value).join("\n");
        $copy.disabled = false;
        $error.style.display = "none";
        $output.value = result;
    } catch (e) {
        if (!(e instanceof Error)) {
            e = new Error("unknown error");
        }
        $error.textContent = e.message;
        $error.style.display = "block";
        $copy.disabled = true;
        $input.classList.add("is-invalid");
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
                $input.value = str;
            },
        );
    });
});
