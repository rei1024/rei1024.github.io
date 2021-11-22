import { ActionAPGLExpr } from "./ast/mod.ts";

/**
 * Actions
 */
export class A {
    static incU(n: number) {
        return A.nonReturn(`INC U${n}`);
    }

    static incUMulti(...args: number[]) {
        return new ActionAPGLExpr([...args.map((x) => `INC U${x}`), "NOP"]);
    }

    static tdecU(n: number) {
        return A.single(`TDEC U${n}`);
    }

    // ADD
    static addA1() {
        return A.nonReturn(`ADD A1`);
    }

    static addB0() {
        return A.single("ADD B0");
    }

    static addB1() {
        return A.single("ADD B1");
    }

    // B2D
    static incB2DX() {
        return A.nonReturn("INC B2DX");
    }

    static tdecB2DX() {
        return A.single("TDEC B2DX");
    }

    static incB2DY() {
        return A.nonReturn("INC B2DY");
    }

    static tdecB2DY() {
        return A.single("TDEC B2DY");
    }

    static readB2D() {
        return A.single("READ B2D");
    }

    static setB2D() {
        return A.nonReturn("SET B2D");
    }

    // B
    static incB(n: number) {
        return A.nonReturn(`INC B${n}`);
    }

    static tdecB(n: number) {
        return A.single(`TDEC B${n}`);
    }

    static readB(n: number) {
        return A.single(`READ B${n}`);
    }

    static setB(n: number) {
        return A.nonReturn(`SET B${n}`);
    }

    static haltOUT() {
        return A.single("HALT_OUT");
    }

    // MUL
    static mul0() {
        return A.single("MUL 0");
    }

    static mul1() {
        return A.single("MUL 1");
    }

    // NOP
    static nop() {
        return A.single("NOP");
    }

    static output(c: string) {
        return A.nonReturn(`OUTPUT ${c}`);
    }

    static subA1() {
        return A.nonReturn(`SUB A1`);
    }

    static subB0() {
        return A.single(`SUB B0`);
    }

    static subB1() {
        return A.single(`SUB B1`);
    }

    private static nonReturn(act: string) {
        return new ActionAPGLExpr([act, "NOP"]);
    }

    private static single(act: string) {
        return new ActionAPGLExpr([act]);
    }
}
