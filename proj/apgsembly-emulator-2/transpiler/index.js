// @ts-check

import { Program } from "../src/Program.js";

// Transpiler

const $input = document.querySelector('#input');
if (!($input instanceof HTMLTextAreaElement)) {
    throw Error('input is not a HTMLTextAreaElement');
}

const $output = document.querySelector('#output');
if (!($output instanceof HTMLTextAreaElement)) {
    throw Error('input is not a HTMLTextAreaElement');
}

const $transpile = document.querySelector('#transpile');
if (!($transpile instanceof HTMLElement)) {
    throw Error('input is not a HTMLTextAreaElement');
}

const $copy = document.querySelector('#copy');
if (!($copy instanceof HTMLButtonElement)) {
    throw Error('copy is not a HTMLButtonElement');
}

$transpile.addEventListener('click', () => {
    const program = Program.parse($input.value);
    if (program instanceof Program) {
        $copy.disabled = false;
        $output.value = program.pretty();
    } else {
        $copy.disabled = true;
        $output.value = program;
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
