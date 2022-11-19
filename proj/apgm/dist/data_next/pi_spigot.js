// @ts-check
// deno-lint-ignore-file

// Unbounded Spigot Algorithms for the Digits of Pi - Jeremy Gibbons
// https://www.cs.ox.ac.uk/people/jeremy.gibbons/publications/spigot.pdf

/**
 * @param {bigint} a
 * @param {bigint} b
 * @returns {bigint}
 */
function div(a, b) {
    return a / b;
}

// > pi = g(1,0,1,1,3,3) where
// >   g(q,r,t,k,n,l) = if 4*q+r-t<n*t
// >     then n : g(10*q,10*(r-n*t),t,k,div(10*(3*q+r))t-10*n,l)
// >     else g(q*k,(2*q+r)*l,t*l,k+1,div(q*(7*k+2)+r*l)(t*l),l+2)
/**
 * @returns {Generator<bigint, void, unknown>}
 */
export function* piSpigot() {
    // can be negative
    let q = 1n;
    let r = 0n;
    let t = 1n;
    let k = 1n;
    let n = 3n;
    let l = 3n;

    while (true) {
        if (4n * q + r - t < n * t) {
            yield n;
            [q, r, t, k, n, l] = [
                10n * q,
                10n * (r - n * t),
                t,
                k,
                div(10n * (3n * q + r), t) - 10n * n,
                l,
            ];
        } else {
            [q, r, t, k, n, l] = [
                q * k,
                (2n * q + r) * l,
                t * l,
                k + 1n,
                div(q * (7n * k + 2n) + r * l, t * l),
                l + 2n,
            ];
        }
    }
}

let i = 0;
for (const x of piSpigot()) {
    console.log(x);
    i++;
    if (i >= 10) {
        break;
    }
}
