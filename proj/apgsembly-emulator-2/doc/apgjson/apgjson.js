// @ts-check

/**
 * @param {number} n
 * @returns
 */
function num(n) {
    return { kind: "number", value: n };
}

/**
 * @param {number} n
 */
function output(n) {
    return { kind: "function", name: "output", args: [num(n)] };
}

function main() {
    return [
        ifZero(tdec_u(0), [], []),
        output(3),
        tdec_u(1),
    ];
}

/**
 * @typedef { { kind: 'function', name: string, args: Expr[] } } CallExpr
 */

/**
 * @typedef { { kind: 'sequence', exprs: Expr[] } } SeqExpr
 */

/**
 * @typedef { { kind: 'string', value: string } } StrExpr
 */

/**
 * @typedef { { kind: 'number', value: number } } NumExpr
 */

/**
 * @typedef {CallExpr | SeqExpr | StrExpr | NumExpr} Expr
 */

/**
 * @typedef {string} StateName
 */

class Emitter {
    constructor() {
    }

    /**
     * @param {StateName} input
     * @param {Expr} expr
     * @returns {StateName}
     */
    emitExpr(input, expr) {
        switch (expr.kind) {
            case "function":
                return this.emitFunction(input, expr);
        }
    }

    /**
     * @param {StateName} input
     * @param {CallExpr} expr
     * @returns {StateName}
     */
    emitFunction(input, expr) {
        switch (expr.name) {
        }
    }
}

export {};
