// @ts-check

/**
 * ブレークポイント初期化
 * @param {HTMLSelectElement} $breakpointSelect
 * @param {import('../../src/Machine.js').Machine | undefined} machine
 */
export function initializeBreakpointSelect($breakpointSelect, machine) {
    $breakpointSelect.innerHTML = '';
    if (machine === undefined) {
        return;
    }

    const none = document.createElement('option');
    none.textContent = "None";
    none.value = "-1";
    none.selected = true;
    $breakpointSelect.append(none);

    for (const [state, stateIndex] of machine.getStateMap().entries()) {
        const option = document.createElement('option');
        option.textContent = state;
        option.value = stateIndex.toString();
        $breakpointSelect.append(option);
    }
}

/**
 * 入力
 * @param {HTMLSelectElement} $breakpointInputSelect
 * @returns {-1 | 0 | 1} -1 is any
 */
export function getBreakpointInput($breakpointInputSelect) {
    // -1: *
    // 0 : Z
    // 1 : NZ
    const biStr = $breakpointInputSelect.value;
    return biStr === "any" ? -1 :
            biStr === "zero" ? 0 : 1;
}
