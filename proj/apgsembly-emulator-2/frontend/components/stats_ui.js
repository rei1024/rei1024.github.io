// @ts-check

/* style.cssで設定 */
const CURRENT_STATE_CLASS = 'stats_current_state';

/**
 * @param {string} name
 * @param {{ z: number, nz: number }} stat
 */
function createRow(name, stat) {
    const $tr = document.createElement('tr');
    const $name = document.createElement('td');
    if (true) {
        const $code = document.createElement('code');
        $code.textContent = name;
        $name.colSpan = 2;
        $name.append($code);
    }

    const $sum = document.createElement('td');
    $sum.textContent = (stat.z + stat.nz).toString();
    const $z = document.createElement('td');
    $z.textContent = stat.z.toString();
    const $nz = document.createElement('td');
    $nz.textContent = stat.nz.toString();
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
     */
    constructor(root) {
        /**
         * @private
         */
        this.root = root;

        /**
         * @type {{ sum: Element, z: Element, nz: Element, tr: HTMLElement }[]}
         * @private
         */
        this.cells = [];
    }

    /**
     * @param {{ z: number, nz: number }[]} stateStats
     * @param {string[]} states
     */
    initialize(stateStats, states) {
        this.cells = [];
        this.root.innerHTML = "";
        for (const [i, stat] of stateStats.entries()) {
            const name = states[i] ?? "";
            const { $tr, $sum, $z, $nz } = createRow(name, stat);
            this.root.append($tr);
            this.cells.push({ sum: $sum, z: $z, nz: $nz, tr: $tr });
        }
    }

    clear() {
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
                item.tr.classList.add(CURRENT_STATE_CLASS);
            } else {
                item.tr.classList.remove(CURRENT_STATE_CLASS);
            }

            const stat = stats[i] ?? error();
            item.sum.textContent = (stat.z + stat.nz).toString();
            item.z.textContent = stat.z.toString();
            item.nz.textContent = stat.nz.toString();
        }
    }
}

/**
 * @returns {never}
 */
function error() {
    throw Error('error');
}
