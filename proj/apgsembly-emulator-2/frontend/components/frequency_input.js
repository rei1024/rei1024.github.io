// @ts-check

/**
 * 周波数入力
 * @param {HTMLInputElement} $frequencyInput
 * @param {import("../app").App} app
 * @param {number} defaultFrequency
 */
export function setupFrequencyInput($frequencyInput, app, defaultFrequency) {
    /** @type {number[]} */
    const frequencyArray = [];
    for (let i = 0; i < 7; i++) {
        const base = 10 ** i;
        for (let j = 1; j <= 9; j++) {
            frequencyArray.push(base * j);
        }
    }

    frequencyArray.push(10 ** 7);

    $frequencyInput.min = "0";
    $frequencyInput.max = (frequencyArray.length - 1).toString();

    $frequencyInput.addEventListener('input', () => {
        const value = parseInt($frequencyInput.value, 10);
        if (!isNaN(value)) {
            const freq = frequencyArray[value] ?? defaultFrequency;
            $frequencyInput.ariaValueText = `(${freq.toString()}Hz)`;
            app.setFrequency(freq);
        } else {
            app.setFrequency(defaultFrequency);
        }

        app.renderFrequencyOutput();
    });
}
