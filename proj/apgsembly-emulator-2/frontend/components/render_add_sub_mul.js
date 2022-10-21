// @ts-check

/**
 *
 * @param {{ add: { toStringDetail(): string }, sub: { toStringDetail(): string }, mul: { toString(): string } } | undefined} actionExecutor
 * @returns {string}
 */
export function renderAddSubMul(actionExecutor) {
    if (!actionExecutor) {
        return '';
    }

    return `
    ADD = ${actionExecutor.add.toStringDetail()},
    SUB = ${actionExecutor.sub.toStringDetail()},
    MUL = ${actionExecutor.mul.toString()}
    `;
}
