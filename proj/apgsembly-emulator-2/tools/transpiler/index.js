// @ts-check
/**
 * Transpiler
 * @packageDocumentation
 */

import { $type } from "../../frontend/util/selector.js";
import { transpile } from "./transpile.js";

const $input = $type("#input", HTMLTextAreaElement);
const $output = $type("#output", HTMLTextAreaElement);
const $transpile = $type("#transpile", HTMLElement);
const $copy = $type("#copy", HTMLButtonElement);

$transpile.addEventListener("click", () => {
    const result = transpile($input.value);
    if (typeof result === "string") {
        $input.classList.remove("is-invalid");
        $copy.disabled = false;
        $output.value = result;
    } else {
        $input.classList.add("is-invalid");
        $copy.disabled = true;
        $output.value = result.message;
    }
});

$copy.addEventListener("click", async () => {
    await navigator.clipboard.writeText($output.value.trim());

    $copy.textContent = "Copied";
    $copy.classList.add("btn-success");
    $copy.classList.remove("btn-primary");
    setTimeout(() => {
        $copy.textContent = "Copy";
        $copy.classList.remove("btn-success");
        $copy.classList.add("btn-primary");
    }, 1000);
});
