// @ts-check

import { generate } from './rule.js';

const rule = document.querySelector("#rule");
if (!(rule instanceof HTMLInputElement)) {
    throw Error('rule is not a HTMLInputElement');
}

const generateButton = document.querySelector("#generate");
if (!(generateButton instanceof HTMLButtonElement)) {
    throw Error('generateButton is not a HTMLButtonElement');
}

const code = document.querySelector("#output");
if (!(code instanceof HTMLTextAreaElement)) {
    throw Error('code is not a HTMLTextAreaElement');
}

// 出力をコピーする
const copy = document.querySelector('#copy');

if (!(copy instanceof HTMLButtonElement)) {
    throw TypeError('copy is not a HTMLButtonElement');
}

generateButton.addEventListener("click", () => {
    code.value = "";
    copy.disabled = true;
    const n = parseInt(rule.value, 10);
    if (isNaN(n)) {
        return;
    }
    if (!Number.isInteger(n)) {
        return;
    }
    if (n < 0) {
        return;
    }
    if (n > 255) {
        return;
    }
    code.value = generate(n);
    copy.disabled = false;
});

copy.addEventListener('click', () => {
    navigator.clipboard.writeText(code.value).then(() => {
        copy.textContent = "Copied";
        setTimeout(() => {
            copy.textContent = "Copy";
        }, 1000);
    });
});

// 有効化
generateButton.disabled = false;
