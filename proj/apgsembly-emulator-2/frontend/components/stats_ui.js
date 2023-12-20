// @ts-check

import { internalError } from "../../src/internalError.js";
import { create } from "../util/create.js";
import { toLocaleString } from "../util/toLocaleString.js";

/* style.cssで設定 */
const CURRENT_STATE_CLASS = "stats_current_state";

/**
 * @typedef {{ z: number, nz: number }} StatsItem
 */

/**
 * @param {string} stateName
 * @param {StatsItem} stat
 */
const createRow = (stateName, { z, nz }) => {
    const $name = create("td", {
        fn: ($name) => {
            $name.colSpan = 2;
        },
        children: [create("code", stateName)],
    });

    const numClass = "num";

    const $sum = create("td", {
        text: toLocaleString(z + nz),
        classes: [numClass],
    });

    const $z = create("td", {
        text: toLocaleString(z),
        classes: [numClass],
    });

    const $nz = create("td", {
        text: toLocaleString(nz),
        classes: [numClass],
    });

    // row
    const $tr = create("tr", {
        children: [$name, $sum, $z, $nz],
    });

    return { $tr, $sum, $z, $nz };
};

/**
 * UI for statistics
 */
export class StatsUI {
    /** @type {HTMLElement} */
    #statsNumberOfStates;

    /**
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
        this.#statsNumberOfStates = statsNumberOfStates;

        /**
         * @type {{ $sum: Element, $z: Element, $nz: Element, $tr: HTMLElement }[]}
         * @private
         */
        this.cells = [];
    }

    /**
     * @param {StatsItem[]} stateStats
     * @param {string[]} states
     */
    initialize(stateStats, states) {
        this.#statsNumberOfStates.textContent = toLocaleString(states.length);

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
        this.#statsNumberOfStates.innerHTML = "";
        this.cells = [];
        this.root.innerHTML = "";
    }

    /**
     * @param {StatsItem[]} stateStats
     * @param {number} currentIndex
     */
    render(stateStats, currentIndex) {
        const stats = stateStats;
        const cells = this.cells;
        const len = cells.length;
        for (let i = 0; i < len; i++) {
            const item = cells[i] ?? internalError();

            if (currentIndex === i) {
                item.$tr.classList.add(CURRENT_STATE_CLASS);
            } else {
                item.$tr.classList.remove(CURRENT_STATE_CLASS);
            }

            const { z, nz } = stats[i] ?? internalError();
            item.$sum.textContent = toLocaleString(z + nz);
            item.$z.textContent = toLocaleString(z);
            item.$nz.textContent = toLocaleString(nz);
        }
    }
}
