// @ts-check

/**
 * @param {number | undefined} line
 * @returns {string}
 */
export const lineNumberMessage = (line) =>
    line !== undefined ? ` at line ${line}` : "";
