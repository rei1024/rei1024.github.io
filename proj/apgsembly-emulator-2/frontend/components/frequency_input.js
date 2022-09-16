// @ts-check

/**
 * @returns {number[]}
 */
function createFrequencyArray() {
    /** @type {number[]} */
    const frequencyArray = [];
    for (let i = 0; i < 7; i++) {
        const base = 10 ** i;
        for (let j = 1; j <= 9; j++) {
            frequencyArray.push(base * j);
        }
    }

    // 値を追加したらHTMLも変更すること
    frequencyArray.push(10 * 10 ** 6, 15 * 10 ** 6);

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
    const frequencyArray = createFrequencyArray();

    $frequencyInput.min = "0";
    $frequencyInput.max = (frequencyArray.length - 1).toString();

    $frequencyInput.addEventListener('input', () => {
        const value = parseInt($frequencyInput.value, 10);
        const freq = frequencyArray[value] ?? error();
        $frequencyInput.ariaValueText = `(${freq.toString()}Hz)`;
        app.setFrequency(freq);
        app.renderFrequencyOutput();
    });
}
