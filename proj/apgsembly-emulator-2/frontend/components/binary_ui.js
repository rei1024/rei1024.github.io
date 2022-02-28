// @ts-check

import { BReg } from "../../src/components/BReg.js";

/**
 * @returns {never}
 */
function error() {
    throw Error('error');
}

/**
 * UI for binary registers
 */
export class BinaryUI {
    /**
     *
     * @param {HTMLElement} root
     */
    constructor(root) {
        /**
         * @private
         */
        this.root = root;

        /**
         * @type {{
         * decimal: HTMLElement,
         * hex: HTMLElement,
         * pointer: HTMLElement,
         * prefix: HTMLElement,
         * head: HTMLElement,
         * suffix: HTMLElement
         * }[]}
         * @private
         */
        this.cells = [];
    }

    /**
     * initialize DOM
     * @param {Map<number, BReg>} regs
     */
    initialize(regs) {
        const cells = [];
        const table = document.createElement('table');
        for (const key of regs.keys()) {
            const tr = document.createElement('tr');
            const th = document.createElement('th');
            th.textContent = `B${key}`;
            const td = document.createElement('td');
            td.dataset['test'] = `B${key}`;

            // start meta
            const metaDataCode = document.createElement('code');
            // 長い場合は改行を入れる
            metaDataCode.style.wordBreak = "break-all";
            metaDataCode.classList.add('binary_info'); // style.cssで設定
            const decimal = document.createElement('span');
            decimal.classList.add('decimal');
            const hex = document.createElement('span');
            hex.classList.add('hex');
            const pointer = document.createElement('span');
            pointer.classList.add('pointer');
            metaDataCode.append(decimal, hex, pointer);
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
            cells.push({
                decimal: decimal,
                hex: hex,
                pointer: pointer,
                prefix: $prefix,
                head: $head,
                suffix: $suffix
            });
        }

        this.root.innerHTML = "";
        this.root.append(table);

        this.cells = cells;
    }

    clear() {
        this.cells = [];
        this.root.innerHTML = '';
    }

    /**
     *
     * @param {Map<number, BReg>} regs
     * @param {boolean} hideBinary
     * @param {boolean} reverseBinary
     * @param {boolean} showBinaryValueInDecimal
     * @param {boolean} showBinaryValueInHex
     */
    render(regs, hideBinary, reverseBinary, showBinaryValueInDecimal, showBinaryValueInHex) {
        let i = 0;
        const cells = this.cells;
        for (const reg of regs.values()) {
            const binaryCacheElem = cells[i] ?? error();
            const $prefix = binaryCacheElem.prefix;
            const $head = binaryCacheElem.head;
            const $suffix = binaryCacheElem.suffix;
            const $decimal = binaryCacheElem.decimal;
            const $pointer = binaryCacheElem.pointer;
            const $hex = binaryCacheElem.hex;

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

            if (showBinaryValueInDecimal) {
                $decimal.textContent = "value = " + reg.toDecimalString() + ", ";
            } else {
                $decimal.textContent = "";
            }

            if (showBinaryValueInHex) {
                $hex.textContent = "hex = " + reg.toHexString() + ", ";
            } else {
                $hex.textContent = "";
            }

            $pointer.textContent = "pointer = " + reg.pointer.toString();
            i++;
        }
    }
}
