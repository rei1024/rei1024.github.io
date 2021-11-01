// @ts-check

import { BReg } from "../src/components/BReg.js";

/**
 * @type {{
 * decimal: HTMLElement,
 * pointer: HTMLElement,
 * prefix: HTMLElement,
 * head: HTMLElement,
 * suffix: HTMLElement
 * }[]}
 */
let binaryCache = [];

/**
 * @param {HTMLElement} $binaryRegister
 * @param {Map<number, BReg>} regs
 */
export function setUpBinary($binaryRegister, regs) {
    binaryCache = [];
    const table = document.createElement('table');
    for (const key of regs.keys()) {
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.textContent = `B${key}`;
        const td = document.createElement('td');
        td.dataset['test'] = `B${key}`;

        // start meta
        const metaDataCode = document.createElement('code');
        metaDataCode.style.color = "black";
        // 長い場合は改行を入れる
        metaDataCode.style.wordBreak = "break-all";

        const decimal = document.createElement('span');
        decimal.classList.add('decimal');
        const pointer = document.createElement('span');
        pointer.classList.add('pointer');
        metaDataCode.append(decimal, pointer);
        const br = document.createElement('br');
        td.append(metaDataCode, br);
        // end meta

        // start binary
        const binaryCode = document.createElement('code');
        binaryCode.style.wordBreak = "break-all";
        const $prefix = document.createElement('span');
        $prefix.classList.add('prefix');
        const $head = document.createElement('span');
        $head.style.color = "#0D47A1";
        // 下線
        $head.style.borderBottom = "3px solid #0D47A1";
        $head.classList.add('head');
        const $suffix = document.createElement('span');
        $suffix.classList.add('suffix');
        binaryCode.append($prefix, $head, $suffix);
        td.append(binaryCode);
        // end binary

        tr.append(th, td);
        table.append(tr);
        binaryCache.push({
            decimal: decimal,
            pointer: pointer,
            prefix: $prefix,
            head: $head,
            suffix: $suffix
        });
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
 * @param {Map<number, BReg>} regs
 * @param {boolean} hideBinary
 * @param {boolean} reverseBinary
 */
export function renderBinary(regs, hideBinary, reverseBinary) {
    let i = 0;
    for (const reg of regs.values()) {
        const binaryCacheElem = binaryCache[i] ?? error();
        const $prefix = binaryCacheElem.prefix;
        const $head = binaryCacheElem.head;
        const $suffix = binaryCacheElem.suffix;
        const $decimal = binaryCacheElem.decimal;
        const $pointer = binaryCacheElem.pointer;
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
