// @ts-check

import { convert } from "../src/convert.js";
import { TMMap } from "../src/TMMap.js";
import { TM } from "../src/TM.js";
import { list } from "./data.js";

const $input = document.querySelector('#input');
if (!($input instanceof HTMLTextAreaElement)) {
    throw Error('input is not a HTMLTextAreaElement');
}

const $output = document.querySelector('#output');
if (!($output instanceof HTMLTextAreaElement)) {
    throw Error('input is not a HTMLTextAreaElement');
}

const $generate = document.querySelector('#generate');
if (!($generate instanceof HTMLElement)) {
    throw Error('generate is not a HTMLTextAreaElement');
}

const $copy = document.querySelector('#copy');
if (!($copy instanceof HTMLButtonElement)) {
    throw Error('copy is not a HTMLButtonElement');
}

const $list = document.querySelector('#example_list');
if (!($list instanceof HTMLElement)) {
    throw Error('list is not a HTMLElement');
}

$generate.addEventListener('click', () => {
    const tm = TM.parse($input.value);
    if (tm instanceof Error) {
        $copy.disabled = true;
        $output.value = tm.message;
        return;
    }
    const tmMap = TMMap.fromTM(tm);
    if (tmMap instanceof Error) {
        $copy.disabled = true;
        $output.value = tmMap.message;
        return;
    }
    const apg = convert(tmMap);
    if (apg instanceof Error) {
        $copy.disabled = true;
        $output.value = apg.message;
    } else {
        $copy.disabled = false;
        $output.value = apg;
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

for (const { name, prog } of list) {
     // <button class="dropdown-item js_sample" data-src="pi_calc.apg">π Calculator</button>
    const button = document.createElement('button');
    button.classList.add('dropdown-item');
    button.textContent = name;
    button.addEventListener('click', () => {
        $input.value = prog;
    });
    $list.append(button);
}
