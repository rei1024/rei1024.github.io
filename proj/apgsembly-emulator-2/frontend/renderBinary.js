// @ts-check

import { BReg } from "../src/components/BReg.js";

/**
 * @param {HTMLElement} $binaryRegister
 * @param {Map<number, BReg>} regs
 */
export function setUpBinary($binaryRegister, regs) {

    const table = document.createElement('table');
    for (const key of regs.keys()) {
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.textContent = `B${key}`;
        const td = document.createElement('td');
        td.dataset['test'] = `B${key}`;
        if (true) {
            const code0 = document.createElement('code');
            code0.style.color = "black";
            // 長い場合は改行を入れる
            code0.style.wordBreak = "break-all";

            const decimal = document.createElement('span');
            decimal.classList.add('decimal');
            const pointer = document.createElement('span');
            pointer.classList.add('pointer');
            code0.append(decimal, pointer);
            const br = document.createElement('br');
            td.append(code0, br);
        }
        if (true) {
            const code = document.createElement('code');
            code.style.wordBreak = "break-all";
            const $prefix = document.createElement('span');
            $prefix.classList.add('prefix');
            const $head = document.createElement('span');
            $head.style.color = "#0D47A1";
            // 下線
            $head.style.borderBottom = "3px solid #0D47A1";
            $head.classList.add('head');
            const $suffix = document.createElement('span');
            $suffix.classList.add('suffix');
            code.append($prefix, $head, $suffix);
            td.append(code);
        }

        tr.append(th, td);
        table.append(tr);
    }
    $binaryRegister.innerHTML = "";
    $binaryRegister.append(table);
}

/**
 * @returns {never}
 */
function error() {
    throw Error('error');
}

/**
 *
 * @param {HTMLElement} $binaryRegister
 * @param {Map<number, BReg>} regs
 * @param {boolean} hideBinary
 * @param {boolean} reverseBinary
 */
export function renderBinary($binaryRegister, regs, hideBinary, reverseBinary) {
    const rows = $binaryRegister.querySelectorAll('tr');
    let i = 0;
    for (const reg of regs.values()) {
        const row = rows[i];
        if (row === undefined) {
            throw Error('renderBinary: internal error');
        }
        const $prefix = row.querySelector('.prefix') ?? error();
        const $head = row.querySelector('.head') ?? error();
        const $suffix = row.querySelector('.suffix') ?? error();
        const $decimal = row.querySelector('.decimal') ?? error();
        const $pointer = row.querySelector('.pointer') ?? error();
        if (hideBinary) {
            $prefix.textContent = '';
            $head.textContent = '';
            $suffix.textContent = '';
        } else if (reverseBinary) {
            const obj = reg.toObject();
            // toObjectは新しい配列を返すため、reverseの副作用は無視する
            $prefix.textContent = obj.suffix.reverse().join('');
            $head.textContent = obj.head.toString();
            $suffix.textContent = obj.prefix.reverse().join('');
        } else {
            const obj = reg.toObject();
            $prefix.textContent = obj.prefix.join('');
            $head.textContent = obj.head.toString();
            $suffix.textContent = obj.suffix.join('');
        }
        $decimal.textContent = "value = " + reg.toDecimalString();
        $pointer.textContent = ", pointer = " + reg.pointer.toString();
        i++;
    }
}
