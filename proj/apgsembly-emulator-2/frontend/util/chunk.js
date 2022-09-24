// @ts-check

/**
 * @template A
 * @param {Iterable<A>} iterable
 * @param {number} size
 * @param {{ exact?: boolean }} param2
 * @returns
 */
 export function* chunk(
    iterable,
    size,
    { exact = false } = {}
) {
    if (!Number.isInteger(size)) {
        throw RangeError("size is not an integer");
    }
    if (size <= 0) {
        throw RangeError("size is less than 1");
    }

    let temp = [];
    for (const x of iterable) {
        temp.push(x);
        if (size <= temp.length) {
            yield temp;
            temp = [];
        }
    }

    if (exact && temp.length !== size) {
        return;
    }

    if (temp.length !== 0) {
        yield temp;
    }
}
