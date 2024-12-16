// @ts-check

import { convert } from "../src/convert.js";
import { TMMap } from "../src/TMMap.js";
import { TM } from "../src/TM.js";
import { list } from "./data.js";
import { parseStdFormat } from "../src/std-format/std-format-parser.js";
import { convertStd } from "../src/std-format/convert-std.js";

const $input = document.querySelector("#input");
if (!($input instanceof HTMLTextAreaElement)) {
    throw Error("input is not a HTMLTextAreaElement");
}

const $output = document.querySelector("#output");
if (!($output instanceof HTMLTextAreaElement)) {
    throw Error("input is not a HTMLTextAreaElement");
}

const $generate = document.querySelector("#generate");
if (!($generate instanceof HTMLElement)) {
    throw Error("generate is not a HTMLTextAreaElement");
}

const $copy = document.querySelector("#copy");
if (!($copy instanceof HTMLButtonElement)) {
    throw Error("copy is not a HTMLButtonElement");
}

const $list = document.querySelector("#example_list");
if (!($list instanceof HTMLElement)) {
    throw Error("list is not a HTMLElement");
}

// 入力が行われなかったらコメントとして追加
let comment = "";

/**
 * @param {string} input
 * @returns {string | Error} apg
 */
function integration(input) {
    const tm = TM.parse(input);
    if (tm instanceof Error) {
        try {
            const std = parseStdFormat(input.trim());
            return `# Standard text format: ${input.trim()}\n` + convertStd(std);
        } catch (error) {
            if (error instanceof SyntaxError) {
                return new Error(tm.message + "\n" + error.message);
            } else {
                return new Error(
                    error instanceof Error ? error.message : "",
                );
            }
        }
    }

    const tmMap = TMMap.fromTM(tm);
    if (tmMap instanceof Error) {
        return tmMap;
    }
    return convert(tmMap);
}

$generate.addEventListener("click", () => {
    $input.classList.remove("is-invalid");
    $output.style.color = "black";
    const apg = integration($input.value);

    if (apg instanceof Error) {
        $copy.disabled = true;
        $output.value = apg.message;
        $output.style.color = "var(--bs-danger)";
        $input.classList.add("is-invalid");
        return;
    }

    $copy.disabled = false;
    const header = [
        `#COMPONENTS NOP,HALT_OUT,U0-2,B0-2`,
        `# State    Input    Next state    Actions`,
        `# ---------------------------------------`,
    ];

    $output.value = [
        ...comment !== "" ? [`# ${comment}`] : [],
        ...header,
        apg,
    ].join("\n");
});

$copy.addEventListener("click", () => {
    navigator.clipboard.writeText($output.value.trim()).then(() => {
        $copy.textContent = "Copied";
        $copy.classList.add("btn-success");
        $copy.classList.remove("btn-primary");
        setTimeout(() => {
            $copy.textContent = "Copy";
            $copy.classList.remove("btn-success");
            $copy.classList.add("btn-primary");
        }, 1000);
    });
});

$input.addEventListener("input", () => {
    comment = "";
});

for (const { name, prog } of list) {
    // <button class="dropdown-item" data-src="pi_calc.apg">π Calculator</button>
    const button = document.createElement("button");
    button.classList.add("dropdown-item");
    button.textContent = name;
    button.addEventListener("click", () => {
        $input.value = prog;
        comment = name;
    });
    const li = document.createElement("li");
    li.append(button);
    $list.append(li);
}
