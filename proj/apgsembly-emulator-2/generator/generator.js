import { generate } from './rule.js'
const rule = document.querySelector("#rule");
const generateButton = document.querySelector("#generate");
const code = document.querySelector("#output");
const copy = document.querySelector('#copy');

if (!(copy instanceof HTMLButtonElement)) {
    throw TypeError('copy is not a HTMLButtonElement');
}

generateButton.addEventListener("click", () => {
    code.value = generate(parseInt(rule.value, 10));
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
