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
if (!($copy instanceof HTMLElement)) {
    throw Error('input is not a HTMLTextAreaElement');
}

$transpile.addEventListener('click', () => {
    const program = Program.parse($input.value);
    if (program instanceof Program) {
        $output.value = program.pretty();
    } else {
        $output.value = program;
    }
});

$copy.addEventListener('click', () => {
    navigator.clipboard.writeText($output.value.trim());
});
