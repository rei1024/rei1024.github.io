// @ts-check

import { create } from "../util/create.js";

/* style.cssで設定 */
const CURRENT_STATE_CLASS = 'stats_current_state';

/**
 * @param {string} stateName
 * @param {{ z: number, nz: number }} stat
 */
function createRow(stateName, stat) {
    const $name = document.createElement('td');
    $name.colSpan = 2;
    $name.append(create('code', $code => {
        $code.textContent = stateName;
    }));

    const num = 'num';

    const $sum = document.createElement('td');
    $sum.textContent = (stat.z + stat.nz).toLocaleString();
    $sum.classList.add(num);

    const $z = document.createElement('td');
    $z.textContent = stat.z.toLocaleString();
    $z.classList.add(num);

    const $nz = document.createElement('td');
    $nz.textContent = stat.nz.toLocaleString();
    $nz.classList.add(num);

    // row
    const $tr = document.createElement('tr');
    $tr.append($name, $sum, $z, $nz);

    return { $tr, $sum, $z, $nz };
}

/**
 * UI for statistics
 */
export class StatsUI {
    /**
     *
     * @param {HTMLElement} root
     * @param {HTMLElement} statsNumberOfStates
     */
    constructor(root, statsNumberOfStates) {
        /**
         * @private
         */
        this.root = root;

        /**
         * @private
         */
        this.statsNumberOfStates = statsNumberOfStates;

        /**
         * @type {{ $sum: Element, $z: Element, $nz: Element, $tr: HTMLElement }[]}
         * @private
         */
        this.cells = [];
    }

    /**
     * @param {{ z: number, nz: number }[]} stateStats
     * @param {string[]} states
     */
    initialize(stateStats, states) {
        this.statsNumberOfStates.textContent = states.length.toLocaleString();

        this.cells = [];
        this.root.innerHTML = "";

        for (const [i, stat] of stateStats.entries()) {
            const name = states[i] ?? "";
            const { $tr, $sum, $z, $nz } = createRow(name, stat);
            this.root.append($tr);
            this.cells.push({ $sum, $z, $nz, $tr });
        }
    }

    clear() {
        this.statsNumberOfStates.textContent = '';
        this.cells = [];
        this.root.innerHTML = '';
    }

    /**
     * @param {{ z: number, nz: number }[]} stateStats
     * @param {number} currentIndex
     */
    render(stateStats, currentIndex) {
        const stats = stateStats;
        const cells = this.cells;
        const len = cells.length;
        for (let i = 0; i < len; i++) {
            const item = cells[i] ?? error();

            if (currentIndex === i) {
                item.$tr.classList.add(CURRENT_STATE_CLASS);
            } else {
                item.$tr.classList.remove(CURRENT_STATE_CLASS);
            }

            const { z, nz } = stats[i] ?? error();
            item.$sum.textContent = (z + nz).toLocaleString();
            item.$z.textContent = z.toLocaleString();
            item.$nz.textContent = nz.toLocaleString();
        }
    }
}

/**
 * @returns {never}
 */
function error() {
    throw Error('error');
}
