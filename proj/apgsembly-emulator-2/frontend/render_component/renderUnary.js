// @ts-check

import { UReg } from "../../src/components/UReg.js";

/**
 * @type {HTMLElement[]}
 */
let unaryCache = [];

/**
 *
 * @param {HTMLElement} $unaryRegister
 * @param {Map<number, UReg>} regs
 */
export function setUpUnary($unaryRegister, regs) {
    unaryCache = [];

    const unaryHeader = document.createElement('tr');
    for (const key of regs.keys()) {
        const th = document.createElement('th');
        th.textContent = `U${key}`;
        unaryHeader.appendChild(th);
    }

    const unaryData = document.createElement('tr');
    for (const [key, value] of regs.entries()) {
        const td = document.createElement('td');
        td.textContent = value.getValue().toString();
        td.dataset['test'] = `U${key}`;
        unaryCache.push(td);
        unaryData.appendChild(td);
    }

    const unaryTable = document.createElement('table');
    unaryTable.appendChild(unaryHeader);
    unaryTable.appendChild(unaryData);
    unaryTable.classList.add('table');

    // 幅を均等にする
    unaryTable.style.tableLayout = "fixed";
    // 16pxから変更
    unaryTable.style.marginBottom = "0px";
    $unaryRegister.innerHTML = "";
    $unaryRegister.appendChild(unaryTable);
}

/**
 *
 * @param {Map<number, UReg>} regs
 */
export function renderUnary(regs) {
    let i = 0;
    for (const reg of regs.values()) {
        const item = unaryCache[i];
        if (item === undefined) {
            throw Error('renderUnary: internal error');
        }
        item.textContent = reg.getValue().toString();
        i++;
    }
}
