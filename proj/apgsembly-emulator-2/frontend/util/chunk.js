// @ts-check

/**
 * sizeごとに配列にする。余りも出力する。
 * @template A
 * @param {Iterable<A>} iterable
 * @param {number} size
 * @returns {Generator<A[], void, unknown>}
 */
export function* chunk(
    iterable,
    size,
) {
    if (!Number.isInteger(size)) {
        throw RangeError("size is not an integer");
    }

    let temp = [];
    for (const x of iterable) {
        temp.push(x);
        if (size <= temp.length) {
            yield temp;
            temp = [];
        }
    }

    if (temp.length !== 0) {
        yield temp;
    }
}
