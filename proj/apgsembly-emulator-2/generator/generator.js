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

/**
 *
 * @param {string} str
 * @returns {number | undefined}
 */
function parseNum(str) {
    const n = parseInt(str, 10);
    if (isNaN(n)) {
        return undefined;
    }
    if (!Number.isInteger(n)) {
        return undefined;
    }
    if (n < 0) {
        return undefined;
    }
    if (n > 255) {
        return undefined;
    }

    return n;
}

rule.addEventListener('input', () => {
    generateButton.disabled = parseNum(rule.value) === undefined;
});

generateButton.addEventListener("click", () => {
    rule.classList.remove('is-invalid');
    code.value = "";
    copy.disabled = true;
    const n = parseNum(rule.value);
    if (n === undefined) {
        rule.classList.add('is-invalid');
        return;
    }
    code.value = generate(n);
    copy.disabled = false;
});

copy.addEventListener('click', () => {
    navigator.clipboard.writeText(code.value).then(() => {
        copy.textContent = "Copied";
        copy.classList.add('btn-success');
        copy.classList.remove('btn-primary');
        setTimeout(() => {
            copy.textContent = "Copy";
            copy.classList.remove('btn-success');
            copy.classList.add('btn-primary');
        }, 1000);
    });
});
