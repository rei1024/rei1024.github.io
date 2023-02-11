// @ts-check

/**
 * input要素にエラーを表示する
 * @param {HTMLInputElement} $input
 * @param {string} message
 */
export function setCustomError($input, message) {
    $input.setCustomValidity(message);
    $input.reportValidity();
    $input.classList.add("is-invalid");
}

/**
 * input要素からエラーを取り除く
 * @param {HTMLInputElement} $input
 */
export function removeCustomError($input) {
    $input.setCustomValidity("");
    $input.reportValidity();
    $input.classList.remove("is-invalid");
}
