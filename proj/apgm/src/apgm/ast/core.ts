/**
 * Expression of APGM language
 */
export abstract class APGMExpr {
    constructor() {
    }

    abstract transform(f: (_: APGMExpr) => APGMExpr): APGMExpr;
}
