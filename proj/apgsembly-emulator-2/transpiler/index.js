// @ts-check

import { transpile } from "./transpile.js";

// Transpiler

const $input = document.querySelector('#input');
if (!($input instanceof HTMLTextAreaElement)) {
    throw Error('input is not a HTMLTextAreaElement');
}

const $output = document.querySelector('#output');
if (!($output instanceof HTMLTextAreaElement)) {
    throw Error('output is not a HTMLTextAreaElement');
}

const $transpile = document.querySelector('#transpile');
if (!($transpile instanceof HTMLElement)) {
    throw Error('transpile is not a HTMLElement');
}

const $copy = document.querySelector('#copy');
if (!($copy instanceof HTMLButtonElement)) {
    throw Error('copy is not a HTMLButtonElement');
}

$transpile.addEventListener('click', () => {
    const result = transpile($input.value);
    if (typeof result === 'string') {
        $input.classList.remove('is-invalid');
        $copy.disabled = false;
        $output.value = result;
    } else {
        $input.classList.add('is-invalid');
        $copy.disabled = true;
        $output.value = result.message;
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
