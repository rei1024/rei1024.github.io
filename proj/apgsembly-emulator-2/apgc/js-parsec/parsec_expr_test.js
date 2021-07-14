import { Parser } from "./parsec.js";
import { assertEquals } from "../../test/deps.js";

/**
 * 
 * @param {string} name 
 * @param {() => void} fn 
 */
function test(name, fn) {
    Deno.test(name, fn);
}

const numberParser = Parser.regexp(/^[0-9]+/);

const leftParen = Parser.satisfy(c => c === '(');
const rightParen = Parser.satisfy(c => c === ')');
const plus = Parser.satisfy(c => c === "+");

/**
 * 
 * @returns {Parser<unknown>}
 */
function exprParser() {
    const add = leftParen.andThen(_ => {
        return exprParser().andThen(e1 => {
            return plus.andThen(_ => {
                return exprParser().andThen(e2 => {
                    return rightParen.map(_ => ({ op: "+", e1: e1, e2: e2 }));
                });
            });
        });
    });
    return numberParser.or(add);
}

test('exprParser 1', () => {
    const str = "1";
    assertEquals(exprParser().parseValue(str), "1");
});

test('exprParser (1+2)', () => {
    const str = "(1+2)";
    assertEquals(exprParser().parseValue(str), { op: "+", e1: "1", e2: "2" });
});

test('exprParser (1+(2+3))', () => {
    const str = "(1+(2+3))";
    assertEquals(exprParser().parseValue(str), { op: "+", e1: "1", e2: { op: "+", e1: "2", e2: "3" } });
});

test('exprParser ((1+2)+(3+4))', () => {
    const str = "((1+2)+(3+4))";
    assertEquals(exprParser().parseValue(str), { op: "+", e1: { op: "+", e1: "1", e2: "2" }, e2: { op: "+", e1: "3", e2: "4" } });
});
