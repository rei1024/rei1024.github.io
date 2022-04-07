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

const $dir = document.querySelector('#dir');

if (!($dir instanceof HTMLSelectElement)) {
    throw TypeError('$dir is not a HTMLSelectElement');
}

const $flip = document.querySelector('#flip');

if (!($flip instanceof HTMLInputElement)) {
    throw TypeError('$dir is not a HTMLInputElement');
}

const $sampleList = document.querySelector('#sample_list');

if ($sampleList === null) {
    throw TypeError('$sampleList is null');
}

const $ruleInvalid = document.querySelector('#rule_invalid');

if (!($ruleInvalid instanceof HTMLElement)) {
    throw TypeError('$ruleInvalid is not a HTMLElement');
}

// サンプルの名前を保持する
let comment = '';

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
        comment = desc;
    });
    $sampleList.append(button);
};

rule.addEventListener('input', () => {
    comment = '';
});

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

    /** @type {0 | 1 | 2 | 3} */
    // @ts-ignore
    const dir = parseInt($dir.value, 10);
    const header = `${comment === '' ? '' : `# ${comment}\n`}# Turmite ${rule.value}\n#COMPONENTS NOP,B2D,U0-2\n`;
    try {
        const tur = Turmites.fromObjectString(rule.value);
        code.value = header + generate(tur, x, y, dir);
        copy.disabled = false;
    } catch (e) {
        try {
            const tur = AbsTurmites.fromObjectString(rule.value);
            code.value = header + absGenerate(tur, x, y, dir, $flip.checked);
            copy.disabled = false;
        } catch (e) {
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
        copy.classList.add('btn-success');
        copy.classList.remove('btn-primary');
        setTimeout(() => {
            copy.textContent = "Copy";
            copy.classList.remove('btn-success');
            copy.classList.add('btn-primary');
        }, 1000);
    });
});

// ボタンを有効化
generateButton.disabled = false;
$samplesButton.disabled = false;
