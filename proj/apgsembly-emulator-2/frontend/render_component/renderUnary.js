// @ts-check

import { UReg } from "../../src/components/UReg.js";

/**
 * キャッシュ用のキー
 */
export const UNARY_REG_ITEMS_CLASS = 'js_unary_data';

/**
 *
 * @param {HTMLElement} $unaryRegister
 * @param {Map<number, UReg>} regs
 */
export function setUpUnary($unaryRegister, regs) {
    const unaryHeader = document.createElement('tr');
    for (const key of regs.keys()) {
        const th = document.createElement('th');
        th.textContent = `U${key}`;
        unaryHeader.appendChild(th);
    }
    const unaryData = document.createElement('tr');
    unaryData.classList.add(UNARY_REG_ITEMS_CLASS);
    for (const [key, value] of regs.entries()) {
        const td = document.createElement('td');
        td.textContent = value.getValue().toString();
        td.dataset['test'] = `U${key}`;
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
 * @param {NodeListOf<ChildNode>} items setUpUnaryのunaryDataのchildNodes
 * @param {Map<number, UReg>} regs
 */
export function renderUnary(items, regs) {
    let i = 0;
    for (const reg of regs.values()) {
        const item = items[i];
        if (item === undefined) {
            throw Error('renderUnary: internal error');
        }
        item.textContent = reg.getValue().toString();
        i++;
    }
}
