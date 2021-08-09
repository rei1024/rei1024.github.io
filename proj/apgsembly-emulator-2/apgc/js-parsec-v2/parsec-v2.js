// @ts-check

import { Result } from "../js-parsec-v3/result.js";

/**
 * @template A
 */
export class ValueWithRest {
    /**
     *
     * @param {A} value
     * @param {string} rest
     */
    constructor(value, rest) {
        /**
         * @readonly
         */
        this.value = value;

        /**
         * @readonly
         */
        this.rest = rest;
    }

    /**
     * @template B
     * @param {(_: A) => B} f
     * @returns {ValueWithRest<B>}
     */
    mapValue(f) {
        return new ValueWithRest(f(this.value), this.rest);
    }
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
 * パーサーコンビネーター
 * Parser combinator
 * @template A, E
 */
export class Parser {
    /**
     * @param {(str: string) => Result<ValueWithRest<A>, E>} parse
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
        return new Parser(str => Result.ok(new ValueWithRest(x, str)));
    }

    /**
     * `>>=`
     * @template B, E2
     * @param {(_: A) => Parser<B, E2>} parser
     * @returns {Parser<B, E | E2>}
     */
    then(parser) {
        return new Parser(str => {
            const resultA = this.parse(str);
            return resultA.fold(x => {
                /**
                 * @type {Result<ValueWithRest<B>, E | E2>}
                 */
                const resultB = parser(x.value).parse(x.rest);
                return resultB;
            }, e => Result.err(e));
        });
    }

    /**
     * @template B
     * @param {(_: A) => B} f
     * @returns {Parser<B, E>}
     */
    map(f) {
        return new Parser(str => this.parse(str).mapOk(x => x.mapValue(f)));
    }

    /**
     * @template A2, E2
     * @param {Parser<A2, E2>} parser
     * @returns {Parser<A | A2, E2>}
     */
    or(parser) {
        const __this__ = this;
        /**
         * @param {string} str
         * @returns {Result<ValueWithRest<A | A2>, E2>}
         */
        function temp(str) {
            const resultA = __this__.parse(str);
            if (resultA.isOk()) {
                // SAFETY: resultA is success
                return Result.ok(resultA.unsafeGetValue());
            }
            return parser.parse(str);
        }
        return new Parser(temp);
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
     * @type {<X, Err, B extends unknown[]>(arg: Parser<X, Err>, ...args: {[K in keyof B]: Parser<B[K], Err>}) => Parser<[X, ...B], Err> }
     */
    static and(arg, ...args) {
        // @ts-ignore
        return args.reduce((acc, parser) => acc.then(xs => parser.map(x => xs.concat([x]))), arg.map(x => [x]));
    }

    /**
     * @template E
     * @param {E} e
     * @returns {Parser<never, E>}
     */
    static fail(e) {
        return new Parser(_ => Result.err(e));
    }

    /**
     * String -> (A x String) + E
     * String -> ((A + E) x String) + never
     * @returns {Parser<Result<A, E>, never>}
     */
    catch() {
        const __this__ = this;
        /**
         *
         * @param {string} str
         * @returns {Result<ValueWithRest<Result<A, E>>, never>}
         */
        function temp(str) {
            const result = __this__.parse(str);
            return result.fold(
                valueWithRest => Result.ok(valueWithRest.mapValue(x => Result.ok(x))),
                err => Result.ok(new ValueWithRest(Result.err(err), str))
            );
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
        return new Parser(str => {
            const result = regexp.exec(str);
            if (result === null) {
                return Result.err(`regexp: ${regexpToString(regexp)}`);
            }
            const match = result[index];
            if (match === undefined) {
                return Result.err(`regexp: ${regexpToString(regexp)}, index: ${index}`);
            }
            return Result.ok(new ValueWithRest(match, str.slice(match.length)));
        });
    }

    /**
     * 文字列
     * @param {string} string
     * @returns {Parser<string, string>}
     */
    static string(string) {
        return new Parser(str => {
            if (str.startsWith(string)) {
                return Result.ok(new ValueWithRest(string, str.slice(string.length)));
            } else {
                return Result.err(`expect "${string}"`);
            }
        });
    }

    /**
     * Enf of file
     * @returns {Parser<undefined, string>}
     */
    static eof() {
        return new Parser(str => {
            if (str.length === 0) {
                return Result.ok(new ValueWithRest(undefined, str));
            }
            return Result.err('expect end of file');
        });
    }

    /**
     * single character
     * @param {(char: string) => boolean} condition
     * @returns {Parser<string, string>}
     */
    static satisfyChar(condition) {
        return new Parser(str => {
            const char = str[0];
            if (char === undefined) {
                return Result.err(`satisfyChar failed: input is empty`);
            }
            if (condition(char)) {
                return Result.ok(new ValueWithRest(char, str.slice(1)));
            } else {
                return Result.err(`satisfyChar failed: condition is not satisfied`);
            }
        });
    }

    /**
     * @returns {Parser<A[], never>}
     */
    many() {
        return new Parser(str => {
            let rest = str;
            /** @type {A[]} */
            const array = [];
            while (true) {
                const result = this.parse(rest);
                if (result.isOk()) {
                    // SAFETY result is ok
                    const valueWithRest = result.unsafeGetValue();
                    array.push(valueWithRest.value);
                    rest = valueWithRest.rest;
                } else {
                    return Result.ok(new ValueWithRest(array, rest));
                }
            }
        });
    }

    /**
     * @param {Parser<unknown, unknown>} separatorParser
     * @returns {Parser<A[], never>}
     */
    sepBy(separatorParser) {
        return new Parser(str => {
            let rest = str;
            /** @type {A[]} */
            const array = [];
            while (true) {
                const result = this.parse(rest);
                if (result.isOk()) {
                    // SAFETY: result is ok
                    const valueWithRest = result.unsafeGetValue();
                    rest = valueWithRest.rest;
                    array.push(valueWithRest.value);
                    const sepResult = separatorParser.parse(rest);
                    if (sepResult.isOk()) {
                        // SAFETY: sepResult is ok
                        const sepValueWithRest = sepResult.unsafeGetValue();
                        rest = sepValueWithRest.rest;
                    } else {
                        return Result.ok(new ValueWithRest(array, rest));
                    }
                } else {
                    return Result.ok(new ValueWithRest(array, rest));
                }
            }
        });
    }

    /**
     * @template E2
     * @param {Parser<unknown ,E2>} parser
     * @returns {Parser<A, E | E2>}
     */
    followedBy(parser) {
        return this.then(x => parser.map(_ => x));
    }

    /**
     * @template B, E2
     * @param {Parser<B, E2>} parser
     * @returns {Parser<B, E | E2>}
     */
    isPrefixOf(parser) {
        return this.then(_ => parser);
    }
}
