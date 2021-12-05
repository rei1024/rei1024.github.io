// @ts-check

import { generate } from './src/generate_apg.js';
import { generate as absGenerate } from './src/abs_generate_apg.js';

import { Turmites } from './src/turmites.js';
import { AbsTurmites } from './src/abs_turmites.js';

import { peggLibrary, timLibrary, absLibrary } from './lib.js';

const rule = document.querySelector("#rule");
if (!(rule instanceof HTMLInputElement)) {
    throw Error('rule is not a HTMLInputElement');
}

const generateButton = document.querySelector("#generate");
if (!(generateButton instanceof HTMLButtonElement)) {
    throw Error('generateButton is not a HTMLButtonElement');
}

const $samplesButton = document.querySelector("#samples");
if (!($samplesButton instanceof HTMLButtonElement)) {
    throw Error('$samplesButton is not a HTMLButtonElement');
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

const $x = document.querySelector('#x');

if (!($x instanceof HTMLInputElement)) {
    throw TypeError('$x is not a HTMLInputElement');
}

const $y = document.querySelector('#y');

if (!($y instanceof HTMLInputElement)) {
    throw TypeError('$y is not a HTMLInputElement');
}

const $sampleList = document.querySelector('#sample_list');

if ($sampleList === null) {
    throw TypeError('$sampleList is null');
}

const $ruleInvalid = document.querySelector('#rule_invalid');

if (!($ruleInvalid instanceof HTMLElement)) {
    throw TypeError('$ruleInvalid is not a HTMLElement');
}

// https://sourceforge.net/p/golly/code/ci/57e0b46e117c8bfa605f0d61d22307ca5c5383d9/tree/Scripts/Python/Rule-Generators/Turmite-gen.py

/**
 *
 * @param {string} ruleString
 * @param {string} desc
 */
const addSample = (ruleString, desc) => {
    // <button class="dropdown-item">Text</button>
    const button = document.createElement('button');
    button.classList.add('dropdown-item');
    button.textContent = desc;
    button.addEventListener('click', () => {
        code.value = "";
        rule.value = ruleString;
    });
    $sampleList.append(button);
};

const libraries = [peggLibrary, timLibrary, absLibrary];

for (const lib of libraries) {
    for (const [ruleString, desc] of lib) {
        addSample(ruleString, desc);
    }
}

generateButton.addEventListener("click", () => {
    rule.classList.remove('is-invalid');
    copy.disabled = true;
    let x = Number($x.value);
    if (isNaN(x) || x < 0 || !Number.isInteger(x)) {
        $x.value = "0";
        x = 0;
    }
    let y = Number($y.value);
    if (isNaN(y) || y < 0 || !Number.isInteger(y)) {
        $y.value = "0";
        y = 0;
    }
    try {
        const tur = Turmites.fromObjectString(rule.value);
        code.value = `# Turmite ${rule.value}\n${generate(tur, x, y)}`;
        copy.disabled = false;
    } catch (e) {
        try {
            const tur = AbsTurmites.fromObjectString(rule.value);
            code.value = `# Turmite ${rule.value}\n${absGenerate(tur, x, y)}`;
            copy.disabled = false;
        } catch (e) {
            console.log(e);
            code.value = "";
            rule.classList.add('is-invalid');
            if (e instanceof Error) {
                $ruleInvalid.textContent = e.message;
            } else {
                $ruleInvalid.textContent = "Invalid specification.";
            }
        }
    }
});

copy.addEventListener('click', () => {
    navigator.clipboard.writeText(code.value).then(() => {
        copy.textContent = "Copied";
        setTimeout(() => {
            copy.textContent = "Copy";
        }, 1000);
    });
});

// ボタンを有効化
generateButton.disabled = false;
$samplesButton.disabled = false;
