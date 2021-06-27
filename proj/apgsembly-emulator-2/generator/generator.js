import { generate } from './rule.js'
const rule = document.querySelector("#rule");
const generateButton = document.querySelector("#generate");
const code = document.querySelector("#output");
const copy = document.querySelector('#copy');

generateButton.addEventListener("click", () => {
    code.value = generate(parseInt(rule.value, 10))
});

copy.addEventListener('click', () => {
    navigator.clipboard.writeText(code.value);
});
