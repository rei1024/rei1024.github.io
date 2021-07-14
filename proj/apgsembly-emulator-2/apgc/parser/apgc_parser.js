// @ts-check

import {
    APGCExpression,
    APGCExpressionStatement,
    APGCProgram,
    APGCStatement,
    APGCStatements,
    FunctionCallExpression,
    IfStatement,
    ifZeroKeyword,
    ifNonZeroKeyword,
    WhileStatement,
    whileZeroKeyword,
    whileNonZeroKeyword,
    NumberExpression,
    StringExpression
} from "../types/apgc_types.js";
import { Parser, parseWithErrorLine, stringLiteralParser } from "../js-parsec-v3/parsec-v3.js";

/**
 * 識別子の正規表現
 */
const identifierRexExp = /^[a-zA-Z_][a-zA-Z_0-9]*/;

/**
 * 識別子
 * @type {Parser<string, string>} 
 */
export const identifierParser = Parser.regexp(identifierRexExp).withError('expect identifier');

// .は通常は改行文字と一致しない
const whitespaceRegExp = /^(\s*\/\/.*(\r\n|\n|\r|$))*\s*/m;

class Whitespace {}

/**
 * 0文字以上の空白か行コメント
 * コメントが最終行の場合も考慮する
 */
const whitespaceParser = Parser.regexp(whitespaceRegExp).map(_ => new Whitespace());

class Paren {}

/**
 * "("
 */
const leftParen = Parser.string('(').map(_ => new Paren());

/**
 * ")"
 */
const rightParen = Parser.string(')').map(_ => new Paren());

/**
 * @returns {Parser<APGCExpression, string>}
 */
 function apgcExpressionParser() {
    return numberExpressionParser.or(stringExpressionParser).or(functionCallExpressionParser());
}

/**
 * @type {Parser<NumberExpression, string>}
 */
export const numberExpressionParser = Parser.regexp(/^[0-9]+/).then(str => {
    const n = parseInt(str, 10);
    if (Number.isInteger(n)) {
        return Parser.pure(new NumberExpression(n));
    } else {
        return Parser.fail('expect a number');
    }
});

/** @type {Parser<StringExpression, string>} */
export const stringExpressionParser = stringLiteralParser.map(x => new StringExpression(x));

/**
 * @type {(_: string) => APGCProgram}
 * @throws
 */
export function apgcProgramParser(str) {
    const lines = str.split(/\r\n|\n|\r/);
    /** @type {string[]} */
    const outputLines = [];
    /**
     * @type {string[]}
     */
    const headers = [];
    for (const line of lines) {
        if (line.startsWith('#REGISTERS') || line.startsWith('#COMPONENTS')) {
            headers.push(line);
        } else {
            outputLines.push(line);
        }
    }

    const allParser = apgcStatementsParser().skip(whitespaceParser).skip(Parser.eof());
    const result = parseWithErrorLine(allParser, outputLines.join('\n'));
    return result.fold(statements => {
        return new APGCProgram(statements, headers);
    }, err => {
        throw Error(`Parse Error: ${err.error} at line "${err.line}"`);
    });
}

class SemicolonWithWhitespace {}

const semicolonWithWhitespace = whitespaceParser.skip(Parser.string(';')).skip(whitespaceParser).map(_ => new Whitespace()).map(_ => new SemicolonWithWhitespace());

/**
 * @returns {Parser<APGCStatements, string>}
 */
function apgcStatementsParser() {
    return apgcStatementParser().many().map(array => new APGCStatements(array));
}

/**
 * @returns {Parser<APGCStatement, string>}
 */
function apgcStatementParser() {
    return Parser.or(
        apgcExpressionStatementParser(),
        ifStatementParser(),
        whileStatementParser()
    );
}

/**
 * @returns {Parser<APGCExpressionStatement, string>}
 */
function apgcExpressionStatementParser() {
    return functionCallExpressionParser().skip(semicolonWithWhitespace).map(expr => new APGCExpressionStatement(expr));
}

const commaAndWhitespace = whitespaceParser.skip(Parser.string(',')).skip(whitespaceParser);

/**
 * @template A, E
 * @param {Parser<A, E>} parser 
 * @param {string} openChar
 * @param {string} closeChar
 * @returns {Parser<A, E | string>}
 */
function paren(parser, openChar, closeChar) {
    // sp ( sp parser sp ) sp
    return whitespaceParser.then( _ => Parser.string(openChar)).then(_ => whitespaceParser.then(_ => parser)).skip(whitespaceParser.skip(Parser.string(closeChar))).skip(whitespaceParser);
}

/**
 * ;は消費しない
 * @returns {Parser<FunctionCallExpression, string>}
 */
export function functionCallExpressionParser() {
    return whitespaceParser.then(_ =>
        identifierParser.then(identifier => {
            return whitespaceParser.then(_ => leftParen.then(_ => whitespaceParser).then(_ =>
                apgcExpressionParser().sepBy(commaAndWhitespace).then(exprs => {
                    return whitespaceParser.then(_ => rightParen.map(_ => {
                        return new FunctionCallExpression(identifier, exprs);
                    }));
                })
            ));
        })
    );
}

/**
 * @template A
 * @param {Parser<string, string>} keywordParser
 * @param {(keyword: string, expr: APGCExpression, stmts1: APGCStatements, stmts2: APGCStatements) => A} makeStatement 
 * @returns {Parser<A, string>}
 */
function makeIfParser(keywordParser, makeStatement) {
    return whitespaceParser.then(_ =>
        keywordParser.then(keyword =>
            paren(apgcExpressionParser(), "(", ")").then(expr => {
                return paren(apgcStatementsParser(), "{", "}").then(statements => {
                    return Parser.string('else').then(_ =>
                        paren(apgcStatementsParser(), "{", "}").map(nonZeroStatements => {
                            return makeStatement(keyword, expr, statements, nonZeroStatements);
                        })
                    ).or(Parser.pure(
                        makeStatement(keyword, expr, statements, new APGCStatements([]))
                    ))
                });
            })
        )
    )
}

/**
 * if_zero (tdec_u(0)) { statemtns } else { statements }
 * if_zero (tdec_u(0)) { statemtns }
 * @returns {Parser<IfStatement, string>}
 */
export function ifStatementParser() {
    return makeIfParser(Parser.string(ifZeroKeyword).or(Parser.string(ifNonZeroKeyword)), (keyword, expr, zeroStatements, nonZeroStatements) => {
        switch (keyword) {
            case ifZeroKeyword: return new IfStatement("zero", expr, zeroStatements, nonZeroStatements);
            case ifNonZeroKeyword: return new IfStatement("non_zero", expr, zeroStatements, nonZeroStatements);
            default: throw new Error('ifStatementParser internal error');
        }
    });
}

/**
 * @template A
 * @param {Parser<string, string>} keywordParser
 * @param {(keyword: string, expr: APGCExpression, statemtns: APGCStatements) => A} makeWhileStatement 
 * @returns {Parser<A, string>}
 */
function makeWhileParser(keywordParser, makeWhileStatement) {
    return whitespaceParser.then(_ =>
        keywordParser.then(keyword =>
            paren(apgcExpressionParser(), "(", ")").then(expr => {
                return paren(apgcStatementsParser(), "{", "}").then(statements => {
                    return (Parser.pure(
                        makeWhileStatement(keyword, expr, statements)
                    ))
                });
            })
        )
    )
}

/**
 * @returns {Parser<WhileStatement, string>}
 */
export function whileStatementParser() {
    return makeWhileParser(Parser.string(whileNonZeroKeyword).or(Parser.string(whileZeroKeyword)), (keyword, expr, stmts) => {
        switch (keyword) {
            case whileNonZeroKeyword: return new WhileStatement("non_zero", expr, stmts);
            case whileZeroKeyword: return new WhileStatement("zero", expr, stmts);
            default: throw Error('whileStatementParser: internal error');
        }
    });
}
