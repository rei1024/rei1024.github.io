// @ts-check

/**
 * @type {{ sum: Element, z: Element, nz: Element }[]}
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
        cache.push({ sum: $sum, z: $z, nz: $nz });
    }
}

/**
 * @returns {never}
 */
function error() {
    throw Error('error');
}

/**
 * @param {HTMLTableSectionElement} $statsBody
 * @param {{ z: number, nz: number }[]} stateStats
 * @param {number} currentIndex
 */
export function renderStats($statsBody, stateStats, currentIndex) {
    const trs = $statsBody.childNodes;
    const stats = stateStats;
    for (let i = 0; i < trs.length; i++) {
        const tr = trs.item(i);
        const stat = stats[i] ?? error();
        if (!(tr instanceof HTMLTableRowElement)) {
            throw Error('error');
        }
        if (currentIndex === i) {
            tr.style.backgroundColor = '#e1f5fe';
        } else {
            tr.style.backgroundColor = '';
        }
        const item = cache[i] ?? error();
        item.sum.textContent = (stat.z + stat.nz).toString();
        item.z.textContent = stat.z.toString();
        item.nz.textContent = stat.nz.toString();
    }
}
