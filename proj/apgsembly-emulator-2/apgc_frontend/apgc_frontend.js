// @ts-check

import { mainWithComment } from "../apgc/apgc.js";

const $input = document.querySelector('#input');

if (!($input instanceof HTMLTextAreaElement)) {
    throw Error('$input');
}

const $samples = document.querySelectorAll('.js_sample');

const $output = document.querySelector('#output');
if (!($output instanceof HTMLTextAreaElement)) {
    throw Error('$output');
}

const $compile = document.querySelector('#compile');
if (!($compile instanceof HTMLButtonElement)) {
    throw Error('$compile');
}

const $copy = document.querySelector('#copy');
if (!($copy instanceof HTMLButtonElement)) {
    throw Error('$compile');
}

const $error = document.querySelector('#error');
if (!($error instanceof HTMLElement)) {
    throw Error('$error');
}

$compile.addEventListener('click', () => {
    try {
        const result = mainWithComment($input.value);
        $copy.disabled = false;
        $error.style.display = "none";
        $output.value = result;
    } catch (e) {
        $error.textContent = e.message;
        $error.style.display = "block";
        $copy.disabled = true;
    }
});

$copy.addEventListener('click', () => {
    navigator.clipboard.writeText($output.value.trim()).then(() => {
        $copy.textContent = "Copied";
        setTimeout(() => {
            $copy.textContent = "Copy";
        }, 1000);
    });
});

// GitHub Pagesは1階層上になる
const DATA_DIR = location.origin.includes('github') ? "../apgsembly-emulator-2/apgc_frontend/data/" : "../apgc_frontend/data/";

$samples.forEach(sample => {
    if (!(sample instanceof HTMLElement)) {
        throw Error('sample is not HTMLElement');
    }
    sample.addEventListener('click', () => {
        fetch(DATA_DIR + sample.dataset.src).then(x => x.text()).then(str => {
            $input.value = str;
        });
    });
});
