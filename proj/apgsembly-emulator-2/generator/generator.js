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
    copy.disabled = true;
    const n = parseInt(rule.value, 10);
    if (isNaN(n)) {
        code.value = "";
        return;
    }
    if (!Number.isInteger(n)) {
        code.value = "";
        return;
    }
    if (n < 0) {
        code.value = "";
        return;
    }
    if (n > 255) {
        code.value = "";
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
