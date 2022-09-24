// @ts-check

import { chunk } from "../util/chunk.js";
import { UReg } from "../../src/components/UReg.js";

/**
 * 列の数
 * @param {number} size
 * @returns
 */
function groupNumber(size) {
    const width = window.innerWidth;
    if (width < 768) {
        const num = 8;
        // 1個だけの列は作らない
        if (num + 1 === size) {
            return size;
        }
        return num;
    }

    const num = 12;
    if (num + 1 <= size && size <= num + 2) {
        return size;
    }
    return num;
}

/**
 *
 * @param {number} key
 */
function createHeaderCell(key) {
    const th = document.createElement('th');
    th.textContent = `U${key}`;
    return th;
}

/**
 *
 * @param {number} key
 * @param {UReg} value
 */
function createDataCell(key, value) {
    const td = document.createElement('td');
    td.textContent = value.getValue().toString();
    td.dataset['test'] = `U${key}`; // for e2e
    return td;
}

/**
 *
 * @param {ReadonlyMap<number, UReg>} regs
 * @returns {{ table: HTMLTableElement, cells: HTMLElement[] }}
 */
function createTable(regs) {
    /**
     * @type {HTMLElement[]}
     */
    const cells = [];

    /** @type {{ header: HTMLTableRowElement, data: HTMLTableRowElement }[]} */
    const rows = [];

    const num = groupNumber(regs.size);

    for (const entries of chunk(regs.entries(), num)) {
        const header = document.createElement('tr');
        const data = document.createElement('tr');
        for (const [key, value] of entries) {
            header.appendChild(createHeaderCell(key));

            const td = createDataCell(key, value);
            cells.push(td);
            data.appendChild(td);
        }

        rows.push({ header, data });
    }

    const table = document.createElement('table');
    for (const row of rows) {
        table.append(row.header, row.data);
    }

    table.classList.add('table');

    // 幅を均等にする
    table.style.tableLayout = "fixed";

    // 16pxから変更
    table.style.marginBottom = "0";

    return {
        table,
        cells
    };
}

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
     * @param {ReadonlyMap<number, UReg>} regs
     */
    initialize(regs) {
        const { table, cells } = createTable(regs);
        this.root.innerHTML = "";
        this.root.appendChild(table);
        this.cells = cells;
    }

    clear() {
        this.cells = [];
        this.root.innerHTML = '';
    }

    /**
     * @param {ReadonlyMap<number, UReg>} regs
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
