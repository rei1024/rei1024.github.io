// @ts-check
/**
 * https://wiki.bbchallenge.org/wiki/Turing_machine#Standard_text_format
 */

/**
 * @typedef {{ writtenSymbol: string; direction: 'L' | 'R'; nextState: string } | null} Next
 */

/**
 * @param {string} src
 * @returns {Map<string, Map<string, Next>>} state and symbol to next transition
 */
export function parseStdFormat(src) {
    const array = src.split("_").map((x) => {
        if (x.length % 3 !== 0) {
            throw new SyntaxError(`invalid std format: "${src}"`);
        }
        /**
         * @type {Next[]}
         */
        const res = [];
        for (let i = 0; i < x.length; i += 3) {
            if (x.slice(i, i + 3) === "---") {
                res.push(null);
                continue;
            }
            const dir = x[i + 1];
            if (dir !== "L" && dir !== "R") {
                throw new SyntaxError(`invalid std format: "${src}"`);
            }
            /** @type {Next} */
            const item = {
                writtenSymbol: x[i] ?? internalError(),
                direction: dir,
                nextState: x[i + 2] ?? internalError(),
            };
            res.push(item);
        }

        return res;
    });

    // Zもエラー
    if (array.length >= 26) {
        throw new Error("too many states");
    }

    const ZERO = "0".codePointAt(0) ?? internalError();
    const A = "A".codePointAt(0) ?? internalError();
    return new Map(array.map((nextList, i) => {
        const state = String.fromCodePoint(A + i);
        return [
            state,
            new Map(nextList.map((next, j) => {
                return [String.fromCodePoint(ZERO + j), next];
            })),
        ];
    }));
}

/**
 * @returns {never}
 */
const internalError = () => {
    throw Error("internal error");
};
