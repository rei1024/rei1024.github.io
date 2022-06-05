// @ts-check

/**
 * OUTPUT
 * @param {HTMLTextAreaElement} $output
 * @param {string | undefined} output
 */
export function renderOutput($output, output) {
    output = output ?? "";
    $output.value = output;

    const len = output.length;

    if (len >= 36 * 3) {
        $output.rows = 4;
    } else if (len >= 36 * 2) {
        $output.rows = 3;
    } else if (len >= 36) {
        $output.rows = 2;
    } else {
        $output.rows = 1;
    }
}
