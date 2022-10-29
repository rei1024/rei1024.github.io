// @ts-check

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
    const rows = Math.min(MAX_ROW, Math.max(1, Math.ceil(len / 40)));
    $output.rows = rows;
}
