/* eslint-disable no-undef */

import { create } from "./create.js";

document.querySelector('#close').addEventListener('click', () => {
    window.close();
});

const diagram = document.querySelector('#diagram');

/**
 * @param {string} graphDefinition
 */
function render(graphDefinition) {
    mermaid.mermaidAPI.render('svg', graphDefinition, function (svgString) {
        diagram.innerHTML = svgString;
    });
}

const KEY = 'state-diagram-input';

const string = localStorage.getItem(KEY);

if (string == null) {
    diagram.textContent = '';

    const span = document.createElement('span');
    span.textContent = 'Go To ';

    const a = document.createElement('a');
    a.href = '../../index.html';
    a.textContent = 'APGsembly Emulator';

    const div = document.createElement('div');
    div.append(span, a);
    diagram.append(div);
} else {
    localStorage.removeItem(KEY);
    render(create(string));
}

const input = document.querySelector('#input');

input.addEventListener('input', () => {
    try {
        render(create(input.value));
        input.classList.remove('is-invalid');
    } catch (error) {
        if (error instanceof Error) {
            const lines = error.message.split("\n");
            diagram.textContent = '';
            diagram.append(...lines.flatMap(line => [line, document.createElement('br')]));
        }
        input.classList.add('is-invalid');
    }
});

function enableInput() {
    input.parentElement.classList.remove('d-none');
}
window.enableInput = enableInput;
