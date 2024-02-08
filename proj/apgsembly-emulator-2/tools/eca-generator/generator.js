// @ts-check

import { $type } from "../../frontend/util/selector.js";
import { generate } from "./rule.js";

const rule = $type("#rule", HTMLInputElement);
const generateButton = $type("#generate", HTMLButtonElement);
const code = $type("#output", HTMLTextAreaElement);

// 出力をコピーする
const copy = $type("#copy", HTMLButtonElement);

/**
 * @param {number} n
 * @returns {number | undefined}
 */
function validateNum(n) {
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

/**
 * @param {string} str
 * @returns {number | undefined}
 */
function parseNum(str) {
    str = str.trim();
    // remove _
    str = [...str].filter((x) => x !== "_").join("");

    if (str.startsWith("0b")) {
        const n = parseInt(str.slice(2), 2);
        return validateNum(n);
    }

    if (str.startsWith("0x")) {
        const n = parseInt(str.slice(2), 16);
        return validateNum(n);
    }

    const n = parseInt(str, 10);
    return validateNum(n);
}

rule.addEventListener("input", () => {
    const isValid = parseNum(rule.value) !== undefined;
    generateButton.disabled = !isValid;
    if (isValid) {
        rule.classList.remove("is-invalid");
    } else {
        rule.classList.add("is-invalid");
    }
});

generateButton.addEventListener("click", () => {
    code.value = "";
    copy.disabled = true;

    const n = parseNum(rule.value);
    if (n === undefined) {
        return;
    }
    code.value = generate(n);
    copy.disabled = false;
});

copy.addEventListener("click", async () => {
    await navigator.clipboard.writeText(code.value);

    copy.textContent = "Copied";
    copy.classList.add("btn-success");
    copy.classList.remove("btn-primary");
    setTimeout(() => {
        copy.textContent = "Copy";
        copy.classList.remove("btn-success");
        copy.classList.add("btn-primary");
    }, 1000);
});
