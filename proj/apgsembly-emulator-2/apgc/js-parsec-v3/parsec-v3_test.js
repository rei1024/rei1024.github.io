import { Parser, ParseState, ParseStateWithResult, parseWithErrorLine, Result, stringLiteralParser } from './parsec-v3.js';
import { assertEquals, assertThrows, test } from "../../test/deps.js";

test('Parser regexp simple', () => {
    const str = "abc";
    const parser = Parser.regexp(/^abc/);
    assertEquals(parser.parseToResult(str), Result.ok('abc'));
});

test('Parser regexp fail', () => {
    const str = "ab";
    const parser = Parser.regexp(/^abc/);
    assertEquals(parser.parseToResult(str), Result.err("regexp: /^abc/"));
});

test('Parser regexp state', () => {
    const str = "abcdef";
    const parser = Parser.regexp(/^abc/);
    assertEquals(parser.parseToParseStateWithResult(str), ParseStateWithResult.makeOk(new ParseState('def', 3), 'abc'));
});

test('Parser then', () => {
    const str = "abcdef";
    const parser1 = Parser.regexp(/^abc/);
    const parser2 = Parser.regexp(/^def/);
    assertEquals(parser1.then(x => parser2.map(y => x + y)).parseToResult(str), Result.ok('abcdef'));
});

test('Parser or 1', () => {
    const str = "abc";
    const parser1 = Parser.regexp(/^abc/);
    const parser2 = Parser.regexp(/^def/);
    assertEquals(parser1.or(parser2).parseToResult(str), Result.ok('abc'));
});

test('Parser or 2', () => {
    const str = "def";
    const parser1 = Parser.regexp(/^abc/);
    const parser2 = Parser.regexp(/^def/);
    assertEquals(parser1.or(parser2).parseToResult(str), Result.ok('def'));
});

test('Parser pure', () => {
    assertEquals(Parser.pure(3).parseToResult(''), Result.ok(3));
});

test('Parser fail', () => {
    assertEquals(Parser.fail('error').parseToResult(''), Result.err('error'));
});

test('Parser string', () => {
    assertEquals(Parser.string('abc').parseToResult('abc'), Result.ok('abc'));
});

test('Parser string fail', () => {
    assertEquals(Parser.string('abc').parseToResult('abd'), Result.err('expect "abc"'));
});

test('Parser string state', () => {
    assertEquals(Parser.string('abc').parseToParseStateWithResult('abcdef').parseState, new ParseState('def', 3));
});

test('Parser eof', () => {
    assertEquals(Parser.eof().parseToResult(''), Result.ok(undefined));
});

test('Parser eof fail', () => {
    assertEquals(Parser.eof().parseToResult('abcdef'), Result.err("expect end of file"));
});

test('Parser satisfyChar', () => {
    const parser = Parser.satisfyChar(c => c === 'a');
    assertEquals(parser.parseToResult('abcdef'), Result.ok("a"));
});

test('Parser satisfyChar fail', () => {
    const parser = Parser.satisfyChar(c => c === 'a');
    assertEquals(parser.parseToResult('x'), Result.err("satisfyChar failed: condition is not satisfied"));
});

test('Parser satisfyChar many', () => {
    const parser = Parser.satisfyChar(c => c === 'a');
    assertEquals(parser.many().parseToResult('aabb'), Result.ok(["a", "a"]));
});

test('Parser satisfyChar many empty', () => {
    const parser = Parser.satisfyChar(c => c === 'a');
    assertEquals(parser.many().parseToResult('bb'), Result.ok([]));
});

test('Parser sepBy', () => {
    const parser = Parser.satisfyChar(c => c === 'a').sepBy(Parser.string(','));
    assertEquals(parser.parseToResult('a,a,a'), Result.ok(["a", "a", "a"]));
});

test('Parser seq', () => {
    assertEquals(Parser.seq(Parser.string('a'), Parser.string('b')).parseToResult('ab'), Result.ok(['a', 'b']));
});

test('Parser seq fail', () => {
    assertEquals(Parser.seq(Parser.string('a'), Parser.string('b')).parseToResult('a'), Result.err('expect "b"'));
});

test('Parser string', () => {
    assertEquals(Parser.string('abcde').parseToParseStateWithResult('abcde'), ParseStateWithResult.makeOk(ParseState.unsafeMakeParseState("", 5), 'abcde'));
});

test('Parser string literal', () => {
    assertEquals(stringLiteralParser.parseToParseStateWithResult('"abc"'), ParseStateWithResult.makeOk(ParseState.unsafeMakeParseState("", 5), 'abc'));
});

test('Parser string literal 2', () => {
    assertEquals(stringLiteralParser.parseToParseStateWithResult('"abc"def'), ParseStateWithResult.makeOk(ParseState.unsafeMakeParseState("def", 5), 'abc'));
});

test('Parser string literal escape', () => {
    assertEquals(stringLiteralParser.parseToParseStateWithResult('"a\\"bc"'), ParseStateWithResult.makeOk(ParseState.unsafeMakeParseState("", 7), 'a"bc'));
});

test('Parser parseWithErrorLine', () => {
    const parser = Parser.satisfyChar(c => c === "a").many().then(_ => Parser.string('\n')).then(_ => Parser.satisfyChar(c => c === 'b')).then(_ => Parser.satisfyChar(c => c === 'c'));
    assertEquals(parseWithErrorLine(parser, "aa\nbb\naaa"), Result.err({ error: "satisfyChar failed: condition is not satisfied", line: 'bb' }));
});

test('Parser many prevent infinite loop', () => {
    const parser = Parser.pure(3).many();
    assertThrows(() => {
        parser.parseToResult('aaa');
    });
});
