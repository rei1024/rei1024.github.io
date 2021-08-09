/* eslint-disable camelcase */
// @ts-check

import {
    emit,
    promote,
    if_zero,
    if_non_zero,
    while_zero,
    while_non_zero,
    output,
    inc_u,
    tdec_u,
    inc_b,
    tdec_b,
    read_b,
    set_b,
    inc_b2dx,
    inc_b2dy,
    tdec_b2dx,
    tdec_b2dy,
    read_b2d,
    set_b2d,
    add_a1,
    add_b0,
    add_b1,
    sub_a1,
    sub_b0,
    sub_b1,
    mul_0,
    mul_1,
    nop,
    halt_out,
} from "../apgdsl.js";

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

const $inner = document.querySelector('#ir_inner');

const $compileIR = document.querySelector('#compile_ir');
if (!($compileIR instanceof HTMLButtonElement)) {
    throw Error('$compile_ir');
}

$compile.addEventListener('click', () => {
    try {
        globalThis.main = "";
        globalThis.headers = [];
        if ($input.value.trim().length === 0) {
            throw Error('Input is empty');
        }
        eval($input.value);
        const obj = promote(globalThis.main);
        $inner.textContent = JSON.stringify(obj, null, 2);
        const str = typeof globalThis.headers === 'string' ? globalThis.headers.trim() : globalThis.headers.join('\n').trim();
        $output.value = (str.length === 0 ? "" : (str + "\n")) + emit(obj).map(x => x.pretty()).join('\n');
        $copy.disabled = false;
        $error.style.display = "none";
    } catch (e) {
        $error.textContent = e.message;
        $error.style.display = "block";
        $copy.disabled = true;
    }
});

$compileIR.addEventListener('click', () => {
    try {
        $copy.disabled = false;
        $error.style.display = "none";
        const obj = JSON.parse($input.value);
        $inner.textContent = JSON.stringify(obj, null, 2);
        $output.value = emit(obj).map(x => x.pretty()).join('\n');
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
const DATA_DIR = location.origin.includes('github') ? "https://rei1024.github.io/proj/apgsembly-emulator-2/apgdsl/frontend/data/" : "./frontend/data/";

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
