// @ts-check

let charNum = 40;

const windowInnerWidth = window.innerWidth;

if (windowInnerWidth >= 1200) {
    charNum = 120;
} else if (windowInnerWidth >= 992) {
    charNum = 100;
} else if (windowInnerWidth >= 768) {
    charNum = 70;
} else if (windowInnerWidth >= 576) {
    charNum = 50;
}

/**
 * OUTPUT
 * @param {HTMLTextAreaElement} $output
 * @param {string | undefined} output
 */
export function renderOutput($output, output) {
    output = output ?? "";
    if ($output.value === output) {
        return;
    }

    $output.value = output;

    const len = output.length;
    const MAX_ROW = 6;
    const rows = Math.min(MAX_ROW, Math.max(1, Math.ceil(len / charNum)));
    $output.rows = rows;
}
