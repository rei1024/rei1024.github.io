// @ts-check

import { UReg } from "../../src/components/UReg.js";

/**
 * 1進数レジスタのUI
 * UI for unary registers
 */
export class UnaryUI {
    /**
     *
     * @param {HTMLElement} root
     */
    constructor(root) {
        /**
         * @type {HTMLElement}
         * @private
         */
        this.root = root;

        /**
         * @type {HTMLElement[]}
         * @private
         */
        this.cells = [];
    }

    /**
     * initialize DOM
     * @param {Map<number, UReg>} regs
     */
    initialize(regs) {
        /**
         * @type {HTMLElement[]}
         */
        const cells = [];

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
            td.dataset['test'] = `U${key}`; // for e2e
            cells.push(td);
            unaryData.appendChild(td);
        }

        const unaryTable = document.createElement('table');
        unaryTable.appendChild(unaryHeader);
        unaryTable.appendChild(unaryData);
        unaryTable.classList.add('table');

        // 幅を均等にする
        unaryTable.style.tableLayout = "fixed";

        // 16pxから変更
        unaryTable.style.marginBottom = "0";

        this.root.innerHTML = "";
        this.root.appendChild(unaryTable);
        this.cells = cells;
    }

    clear() {
        this.cells = [];
        this.root.innerHTML = '';
    }

    /**
     * @param {Map<number, UReg>} regs
     */
    render(regs) {
        let i = 0;
        const cells = this.cells;
        for (const reg of regs.values()) {
            const item = cells[i];
            if (item === undefined) {
                throw Error('renderUnary: internal error');
            }
            item.textContent = reg.getValue().toString();
            i++;
        }
    }
}
