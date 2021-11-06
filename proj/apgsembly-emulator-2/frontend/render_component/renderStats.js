// @ts-check

/**
 * @type {{ sum: Element, z: Element, nz: Element, tr: HTMLElement }[]}
 */
let cache = [];

/**
 * @param {HTMLTableSectionElement} $statsBody
 * @param {{ z: number, nz: number }[]} stateStats
 * @param {string[]} states
 */
export function setUpStats($statsBody, stateStats, states) {
    cache = [];
    $statsBody.innerHTML = "";
    for (const [i, stat] of stateStats.entries()) {
        const name = states[i] ?? "";
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
        $statsBody.append($tr);
        cache.push({ sum: $sum, z: $z, nz: $nz, tr: $tr });
    }
}

/**
 * @returns {never}
 */
function error() {
    throw Error('error');
}

/**
 * @param {{ z: number, nz: number }[]} stateStats
 * @param {number} currentIndex
 */
export function renderStats(stateStats, currentIndex) {
    const stats = stateStats;
    const len = cache.length;
    for (let i = 0; i < len; i++) {
        const item = cache[i] ?? error();
        const cls = 'stats_current_state'; /* style.cssで設定 */
        if (currentIndex === i) {
            item.tr.classList.add(cls);
        } else {
            item.tr.classList.remove(cls);
        }
        const stat = stats[i] ?? error();
        item.sum.textContent = (stat.z + stat.nz).toString();
        item.z.textContent = stat.z.toString();
        item.nz.textContent = stat.nz.toString();
    }
}
