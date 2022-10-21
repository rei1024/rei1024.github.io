// @ts-check

/**
 * @returns {number[]}
 */
function getFrequencies() {
    /** @type {number[]} */
    const frequencyArray = [];
    const maxOrder = 6;
    for (let i = 0; i <= maxOrder; i++) {
        const base = 10 ** i;
        for (let j = 1; j <= 9; j++) {
            frequencyArray.push(base * j);
        }
    }

    // 値を追加したらHTMLも変更すること
    frequencyArray.push(
        ...[10, 15].map(x => x * 10 ** maxOrder)
    );

    return frequencyArray;
}

/**
 * @returns {never}
 */
function error() {
    throw Error('error');
}

/**
 * 周波数入力
 * @param {HTMLInputElement} $frequencyInput
 * @param {import("../app.js").App} app
 */
export function setupFrequencyInput($frequencyInput, app) {
    const frequencies = getFrequencies();

    $frequencyInput.min = "0";
    $frequencyInput.max = (frequencies.length - 1).toString();

    $frequencyInput.addEventListener('input', () => {
        const value = parseInt($frequencyInput.value, 10);
        const freq = frequencies[value] ?? error();
        $frequencyInput.ariaValueText = `(${freq.toString()}Hz)`;
        app.setFrequency(freq);
        app.renderFrequencyOutput();
    });
}
