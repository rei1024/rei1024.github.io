// @ts-check

/**
 * @param {HTMLTableSectionElement} $statsBody
 * @param {{ z: number, nz: number }[]} stateStats
 * @param {string[]} states
 * @param {number} currentIndex
 */
export function renderStats($statsBody, stateStats, states, currentIndex) {
    $statsBody.innerHTML = "";
    for (const [i, stat] of stateStats.entries()) {
        const name = states[i] ?? "";
        const $tr = document.createElement('tr');
        if (currentIndex === i) {
            $tr.style.backgroundColor = '#e1f5fe';
        }
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
    }
}
