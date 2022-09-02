// @ts-check

import { generate } from './src/generate_apg.js';
import { generate as absGenerate } from './src/abs_generate_apg.js';

import { Turmites } from './src/turmites.js';
import { AbsTurmites } from './src/abs_turmites.js';

import { peggLibrary, timLibrary, absLibrary } from './lib.js';

import { $type } from "../frontend/util/selector.js";

const rule = $type("#rule", HTMLInputElement);

const generateButton = $type("#generate", HTMLButtonElement);

const $samplesButton = $type("#samples", HTMLButtonElement);

const code = $type("#output", HTMLTextAreaElement);

// 出力をコピーする
const copy = $type('#copy', HTMLButtonElement);

const $x = $type('#x', HTMLInputElement);
const $y = $type('#y', HTMLInputElement);

const $dir = $type('#dir', HTMLSelectElement);

const $flip = $type('#flip', HTMLInputElement);

const $sampleList = $type('#sample_list', HTMLElement);

const $ruleInvalid = $type('#rule_invalid', HTMLElement);

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

// 何かしら変化したらコメント削除
rule.addEventListener('input', () => {
    comment = '';
});

const allRules = peggLibrary.concat(timLibrary, absLibrary);

for (const [ruleString, desc] of allRules) {
    addSample(ruleString, desc);
}

function getInput() {
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
    return { x, y, dir };
}

generateButton.addEventListener("click", () => {
    rule.classList.remove('is-invalid');
    copy.disabled = true;

    const { x, y, dir } = getInput();
    const header = `${comment === '' ? '' : `# ${comment}\n`}# Turmite ${rule.value}\n#COMPONENTS NOP,B2D,U0-2\n`;
    try {
        const tur = Turmites.fromObjectString(rule.value);
        code.value = header + generate(tur, x, y, dir);
        copy.disabled = false;
    } catch (_) {
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
