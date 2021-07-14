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

test('Parser pure', () => {
    const str = "abc";
    const parser = Parser.pure(3);
    assertEquals(parser.parseValue(str), 3);
});

test('Parser satisfy true', () => {
    const str = "a";
    const parser = Parser.satisfy(c => c === "a");
    assertEquals(parser.parseValue(str), "a");
});

test('Parser satisfy false', () => {
    const str = "b";
    const parser = Parser.satisfy(c => c === "a");
    assertEquals(parser.parseValue(str), undefined);
});

test('Parser satisfy empty', () => {
    const str = "";
    const parser = Parser.satisfy(c => true);
    assertEquals(parser.parseValue(str), undefined);
});

test('Parser andThen map', () => {
    const str = "ab";
    const parser = Parser.satisfy(c => c === "a").andThen(c1 => {
        return Parser.satisfy(c2 => c2 === "b").map(c2 => c1 + c2);
    });

    assertEquals(parser.parseValue(str), "ab");
});

test('Parser or', () => {
    const str = "a";
    const parser = Parser.satisfy(c => c === "a").or(Parser.satisfy(c => c === "b"));

    assertEquals(parser.parseValue(str), "a");
});

test('Parser or 2', () => {
    const str = "b";
    const parser = Parser.satisfy(c => c === "a").or(Parser.satisfy(c => c === "b"));

    assertEquals(parser.parseValue(str), "b");
});

test('Parser or 3', () => {
    const str = "c";
    const parser = Parser.satisfy(c => c === "a").or(Parser.satisfy(c => c === "b"));

    assertEquals(parser.parseValue(str), undefined);
});

test('Parser many', () => {
    const str = "123abc";
    const parser = Parser.satisfy(c => "0" <= c && c <= "9").many();

    assertEquals(parser.parseValue(str), ["1", "2", "3"]);
});

test('Parser takeWhile', () => {
    const str = "123abc";
    const parser = Parser.takeWhile(c => "0" <= c && c <= "9");

    assertEquals(parser.parseValue(str), "123");
});

test('Parser sepBy', () => {
    const str = "1,2,3a";
    const parser = Parser.satisfy(c => "0" <= c && c <= "9").sepBy(Parser.satisfy(c => c === ','));

    assertEquals(parser.parseValue(str), ["1", "2", "3"]);
});

test('Parser string', () => {
    const str = "123abc";
    const parser = Parser.string('abc');
    assertEquals(parser.parseValue(str), undefined);
});

test('Parser string', () => {
    const str = "123abc";
    const parser = Parser.string('123');
    assertEquals(parser.parseValue(str), '123');
});
