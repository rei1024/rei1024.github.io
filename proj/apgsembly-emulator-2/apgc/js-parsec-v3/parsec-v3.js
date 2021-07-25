// @ts-check

import { Result } from './result.js';

export { Result };

export class ParseState {
    /**
     * @private
     * @param {string} rest 
     * @param {number} offset 
     */
    constructor(rest, offset) {
        /**
         * @readonly
         */
        this.rest = rest;

        /**
         * 現在見ている文字を指す
         * @readonly
         */
        this.offset = offset;
    }

    /**
     * 
     * @param {string} rest 
     * @param {number} offset 
     * @returns {ParseState}
     */
    static unsafeMakeParseState(rest, offset) {
        return new ParseState(rest, offset);
    }

    /**
     * 
     * @param {string} str 
     * @returns {ParseState}
     */
    static init(str) {
        return new ParseState(str, 0);
    }

    /**
     * 
     * @param {number} n
     * @returns {ParseState}
     */
    consume(n) {
        return new ParseState(this.rest.slice(n), this.offset + n);
    }
}

/**
 * @template A, E
 */
export class ParseStateWithResult {
    /**
     * 
     * @param {ParseState} parseState 
     * @param {Result<A, E>} result 
     */
    constructor(parseState, result) {
        /**
         * @readonly
         */
        this.parseState = parseState;
        /**
         * @readonly
         */
        this.result = result;
    }

    /**
     * @template A
     * @param {ParseState} state 
     * @param {A} value 
     * @returns {ParseStateWithResult<A, never>}
     */
    static makeOk(state, value) {
        return new ParseStateWithResult(state, Result.ok(value));
    }

    /**
     * @template E
     * @param {ParseState} state 
     * @param {E} err 
     * @returns {ParseStateWithResult<never, E>}
     */
    static makeError(state, err) {
        return new ParseStateWithResult(state, Result.err(err));
    }

    /**
     * @template B
     * @param {(_: A) => B} f 
     * @returns {ParseStateWithResult<B, E>}
     */
    map(f) {
        return new ParseStateWithResult(this.parseState, this.result.mapOk(f));
    }

    /**
     * @template E2
     * @param {(_: E) => E2} f 
     * @returns {ParseStateWithResult<A, E2>}
     */
    mapErr(f) {
        return new ParseStateWithResult(this.parseState, this.result.mapErr(f));
    }

    // mapBoth()
}

/**
 * 
 * @param {RegExp} regexp 
 * @returns {string}
 */
 function regexpToString(regexp) {
    return `/${regexp.source}/${regexp.flags}`;
}

/**
 * @template A, E
 */
export class Parser {
    /**
     * 
     * @param {(parseState: ParseState) => ParseStateWithResult<A, E>} parse 
     */
    constructor(parse) {
        /**
         * @readonly
         */
        this.parse = parse;
    }

    /**
     * @template A
     * @param {A} x 
     * @returns {Parser<A, never>}
     */
    static pure(x) {
        return new Parser(state => ParseStateWithResult.makeOk(state, x));
    }

    /**
     * @template B, E2
     * @param {(_: A) => Parser<B, E2>} f
     * @returns {Parser<B, E | E2>}
     */
    then(f) {
        return new Parser(state => {
            const resultA = this.parse(state);
            return resultA.result.fold(x => {
                const parserB = f(x);
                if (!(parserB instanceof Parser)) {
                    throw Error('then: does not return a parser');
                }
                return parserB.parse(resultA.parseState);
            }, err => {
                /**
                 * @type {ParseStateWithResult<B, E | E2>}
                 */
                const x = ParseStateWithResult.makeError(state, err);
                return x;
            });
        });
    }

    /**
     * @template E2
     * @param {Parser<unknown, E2>} parser
     * @returns {Parser<A, E | E2>}
     */
    skip(parser) {
        return this.then(x => parser.map(_ => x));
    }

    /**
     * @template B
     * @param {(_: A) => B} f 
     * @returns {Parser<B, E>}
     */
    map(f) {
        return new Parser(state => this.parse(state).map(f));
    }

    /**
     * @template A2, E2
     * @param {Parser<A2, E2>} parser
     * @returns {Parser<A | A2, E2>}
     */
    or(parser) {
        return new Parser(state => {
            const parseStateWithResultA = this.parse(state);
            if (parseStateWithResultA.result.isOk()) {
                // SAFETY: parseStateWithResultA.result is success
                const value = parseStateWithResultA.result.unsafeGetValue();
                return ParseStateWithResult.makeOk(parseStateWithResultA.parseState, value);
            }
            /**
             * @type {ParseStateWithResult<A | A2, E2>}
             */
            const x = parser.parse(state); // backtrack
            return x;
        });
    }

    /**
     * @template A, E
     * @param {Parser<A, E>} arg
     * @param {...Parser<A, E>} args
     * @returns {Parser<A, E>}
     */
    static or(arg, ...args) {
        return args.reduce((acc, x) => acc.or(x), arg);
    }

    /**
     * sequence
     * @type {<X, Err, B extends unknown[]>(arg: Parser<X, Err>, ...args: {[K in keyof B]: Parser<B[K], Err>}) => Parser<[X, ...B], Err> }
     */
    static seq(arg, ...args) {
        const x = args.reduce((acc, parser) => acc.then(xs => parser.map(x =>
            // @ts-ignore
            xs.concat([x])
        )), arg.map(x => [x]));
        // @ts-ignore
        return x;
    }

    /**
     * @template E
     * @param {E} e 
     * @returns {Parser<never, E>}
     */
    static fail(e) {
        return new Parser(state => ParseStateWithResult.makeError(state, e));
    }

    /**
     * State -> (A x State) + E
     * State -> ((A + E) x State) + never
     * @returns {Parser<Result<A, E>, never>}
     */
    catch() {
        const __this__ = this;
        /**
         * @param {ParseState} state 
         * @returns {ParseStateWithResult<Result<A, E>, never>}
         */
        function temp(state) {
            const parseStateWithResult = __this__.parse(state);
            return ParseStateWithResult.makeOk(parseStateWithResult.parseState, parseStateWithResult.result);
        }
        return new Parser(temp);
    }

    /**
     * @template E2
     * @param {(_: E) => E2} f
     * @returns {Parser<A, E2>}
     */
    mapError(f) {
        return new Parser(str => this.parse(str).mapErr(f));
    }

    /**
     * @template E2
     * @param {E2} e 
     * @returns {Parser<A, E2>}
     */
    withError(e) {
        return this.mapError(_ => e);
    }

    /**
     * ^を先頭に付けること。$は付けないこと。
     * @param {RegExp} regexp
     * @param {number} [index=0] 正規表現の結果の添字
     * @returns {Parser<string, string>}
     */
    static regexp(regexp, index = 0) {
        if (regexp.source[0] !== '^') {
            throw Error('Parser.regexp: RegExp must start with ^');
        }
        return new Parser(state => {
            const result = regexp.exec(state.rest);
            if (result === null) {
                return ParseStateWithResult.makeError(state, `regexp: ${regexpToString(regexp)}`);
            }
            const match = result[index];
            if (match === undefined) {
                return ParseStateWithResult.makeError(state, `regexp: ${regexpToString(regexp)}, index: ${index}`);
            }
            return ParseStateWithResult.makeOk(state.consume(match.length), match);
        });
    }

    /**
     * 文字列
     * @param {string} string
     * @returns {Parser<string, string>}
     */
    static string(string) {
        return new Parser(state => {
            if (state.rest.startsWith(string)) {
                return ParseStateWithResult.makeOk(state.consume(string.length), string);
            } else {
                return ParseStateWithResult.makeError(state, `expect "${string}"`);
            }
        });
    }

    /**
     * Enf of file
     * @returns {Parser<undefined, string>}
     */
    static eof() {
        return new Parser(state => {
            if (state.rest.length === 0) {
                return ParseStateWithResult.makeOk(state, undefined);
            }
            return ParseStateWithResult.makeError(state, 'expect end of file');
        });
    }

    /**
     * 
     * @param {string} str
     * @returns {Result<A, E>}
     */
    parseToResult(str) {
        return this.parse(ParseState.init(str)).result;
    }

    /**
     * 
     * @param {string} str 
     * @returns {ParseStateWithResult<A, E>}
     */
    parseToParseStateWithResult(str) {
        return this.parse(ParseState.init(str));
    }

    /**
     * 
     * @param {string} str
     * @returns {A | undefined}
     */
    parseToValueOrUndefined(str) {
        return this.parseToResult(str).fold(x => x, _ => undefined);
    }

    /**
     * single character
     * @param {(char: string) => boolean} condition 
     * @returns {Parser<string, string>}
     */
    static satisfyChar(condition) {
        return new Parser(state => {
            const char = state.rest[0];
            if (char === undefined) {
                return ParseStateWithResult.makeError(state, `satisfyChar failed: input is empty`);
            }
            if (condition(char)) {
                return ParseStateWithResult.makeOk(state.consume(1), char);
            } else {
                return ParseStateWithResult.makeError(state, `satisfyChar failed: condition is not satisfied`);
            }
        });
    }

    /**
     * @returns {Parser<A[], never>}
     */
    many() {
        return new Parser(origState => {
            let state = origState;
            let prevState = state;
            /** @type {A[]} */
            const array = [];
            while (true) {
                const parseStateWithResult = this.parse(state);
                state = parseStateWithResult.parseState;
                if (parseStateWithResult.result.isOk()) {
                    // prevent infinite loop
                    if (prevState.offset === state.offset) {
                        throw Error('many: infinite loop');
                    }

                    // SAFETY: parseStateWithResult.result is ok
                    const value = parseStateWithResult.result.unsafeGetValue();
                    array.push(value);
                } else {
                    return ParseStateWithResult.makeOk(state, array);
                }
                prevState = state;
            }
        });
    }

    /**
     * @param {Parser<unknown, unknown>} separatorParser 
     * @returns {Parser<A[], never>}
     */
    sepBy(separatorParser) {
        return new Parser(origState => {
            let state = origState;
            /** @type {A[]} */
            const array = [];
            while (true) {
                const parseStateWithResult = this.parse(state);
                state = parseStateWithResult.parseState;
                if (parseStateWithResult.result.isOk()) {
                    // SAFETY: parseStateWithResult.result is ok
                    const value = parseStateWithResult.result.unsafeGetValue();
                    array.push(value);
                    const sepParseStateWithResult = separatorParser.parse(state);
                    if (sepParseStateWithResult.result.isOk()) {
                        state = sepParseStateWithResult.parseState;
                    } else {
                        return ParseStateWithResult.makeOk(state, array);
                    }
                } else {
                    return ParseStateWithResult.makeOk(state, array);
                }
            }
        });
    }
}

/**
 * @template A, E
 * @param {Parser<A, E>} parser 
 * @param {string} str
 * @returns {Result<A, { error: E, line: string } >}
 */
export function parseWithErrorLine(parser, str) {
    const parseStateWithResult = parser.parseToParseStateWithResult(str);
    return parseStateWithResult.result.mapErr(e => ({ error: e, line: extractLine(str, parseStateWithResult.parseState.offset) }));
}

/**
 *
 * @param {string} str 
 * @param {number} offset 
 * @returns {string} line
 */
export function extractLine(str, offset) {
    const array = lines(str);
    const line = array.find(o => (o.start <= offset && offset <= o.end) || (o.start >= offset));
    return line?.line ?? "";
}

/**
 * str.slice(start, end) = line
 * @param {string} str
 * @returns {{ start: number, end: number, line: string }[]}
 */
export function lines(str) {
    let start = 0;
    const matches = [...str.matchAll(/\r\n|\n|\r/g)];

    /** @type {{ start: number, end: number, line: string }[]} */
    const objs = [];
    for (const match of matches) {
        /** @type {number} */
        // @ts-ignore
        const index = match.index;
        objs.push({ start: start, end: index, line: str.slice(start, index) });
        if (match[0] === '\r\n') {
            start = index + 2;
        } else {
            start = index + 1;
        }
    }
    if (start !== str.length - 1) {
        objs.push({ start: start, end: str.length, line: str.slice(start, str.length) });
    }
    return objs;
}

/**
 * @type {Parser<string, string>}
 */
export const stringLiteralParser = new Parser(state => {
    const first = state.rest[0];
    if (first !== `"`) {
        return ParseStateWithResult.makeError(state, 'string literal: expect "');
    }
    let i = 1;
    const rest = state.rest;
    const len = rest.length;
    while (i < len) {
        const char = rest[i];
        if (char === undefined) { throw Error('stringExpressionParser: internal error'); }
        if (char === `"`) {
            if (rest[i - 1] !== '\\') {
                const x = ParseState.unsafeMakeParseState(rest.slice(i + 1), state.offset + i + 1);

                return new ParseStateWithResult(x, Result.ok(rest.slice(1, i).
                    // @ts-ignore
                    replaceAll("\\\"", "\""))
                );
            }
        }
        i++;
    }
    return ParseStateWithResult.makeError(state, 'string literal: expect "');
});
