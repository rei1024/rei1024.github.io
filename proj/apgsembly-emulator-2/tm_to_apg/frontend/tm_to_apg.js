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

// 入力が行われなかったらコメントとして追加
let comment = '';

$generate.addEventListener('click', () => {
    const tm = TM.parse($input.value);
    $input.classList.remove('is-invalid');
    if (tm instanceof Error) {
        $copy.disabled = true;
        $output.value = tm.message;
        $input.classList.add('is-invalid');
        return;
    }
    const tmMap = TMMap.fromTM(tm);
    if (tmMap instanceof Error) {
        $copy.disabled = true;
        $output.value = tmMap.message;
        $input.classList.add('is-invalid');
        return;
    }
    const apg = convert(tmMap);
    if (apg instanceof Error) {
        $copy.disabled = true;
        $output.value = apg.message;
        $input.classList.add('is-invalid');
    } else {
        $copy.disabled = false;
        if (comment !== '') {
            $output.value = [
                `# ${comment}`,
                `# State    Input    Next state    Actions`,
                `# ---------------------------------------`,
                apg
            ].join('\n');
        } else {
            $output.value = [apg].join('\n');
        }
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

$input.addEventListener('input', () => {
    comment = '';
});

for (const { name, prog } of list) {
     // <button class="dropdown-item" data-src="pi_calc.apg">π Calculator</button>
    const button = document.createElement('button');
    button.classList.add('dropdown-item');
    button.textContent = name;
    button.addEventListener('click', () => {
        $input.value = prog;
        comment = name;
    });
    $list.append(button);
}
