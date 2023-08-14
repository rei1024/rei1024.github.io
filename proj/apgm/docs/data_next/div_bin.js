// @ts-check

// https://en.wikipedia.org/wiki/Division_algorithm#Integer_division_(unsigned)_with_remainder

/**
 * @param {bigint} n
 * @param {bigint} i
 * @returns {bigint} 0n | 1n
 */
function at(n, i) {
    return (n & (1n << i)) >> i;
}

/**
 * @param {bigint} n
 * @param {bigint} i
 * @returns {bigint}
 */
function set(n, i) {
    return n | (1n << i);
}

/**
 * integer division
 * @param {bigint} n
 * @param {bigint} d
 */
function div(n, d) {
    if (d === 0n) {
        throw new Error("divide by zero");
    }
    let q = 0n;
    let r = 0n;
    for (let i = n.toString(2).length - 1; i >= 0; i--) {
        r = r << 1n;
        r = r | at(n, BigInt(i));
        if (r >= d) {
            r = r - d;
            q = set(q, BigInt(i));
        }
    }

    return { q, r };
}

// deno run docs/data_next/div_bin.js
for (let i = 0n; i <= 100n; i++) {
    for (let j = 1n; j <= 100n; j++) {
        const { q, r } = div(i, j);
        console.log(i, j, q, r, i / j, i % j);
        if (q !== i / j) {
            throw new Error(`${i} / ${j}`);
        }

        if (r !== i % j) {
            throw new Error(`${i} / ${j}`);
        }
    }
}

export {};
