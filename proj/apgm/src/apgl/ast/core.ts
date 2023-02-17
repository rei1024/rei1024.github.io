/**
 * Low level expression
 */
export abstract class APGLExpr {
    constructor() {
    }

    /**
     * Apply recursive transform
     */
    abstract transform(f: (expr: APGLExpr) => APGLExpr): APGLExpr;
}
