// @ts-check

/**
 * パーサーコンビネーター
 * Parser combinator
 * @template A
 */
export class Parser {
    /**
     *
     * @param {(_: string) => ({ rest: string, value: A } | undefined)} parse
     */
    constructor(parse) {
        /**
         * @readonly
         */
        this.parse = parse;
    }

    /**
     * Parse a string
     * @param {string} str
     * @returns {A | undefined}
     */
    parseValue(str) {
        const result = this.parse(str);
        if (result === undefined) {
            return undefined;
        }
        return result.value;
    }

    /**
     * @template A
     * @param {A} value
     * @returns {Parser<A>}
     */
    static pure(value) {
        return new Parser(str => ({ rest: str, value: value }));
    }

    /**
     * @returns {Parser<never>}
     */
    static fail() {
        return new Parser(_ => undefined);
    }

    /**
     * ^を先頭に付けること。$は付けないこと。
     * @param {RegExp} regexp
     * @param {number} [index=0] 正規表現の結果の添字
     * @returns {Parser<string>}
     */
    static regexp(regexp, index = 0) {
        return new Parser(str => {
            const result = regexp.exec(str);
            if (result === null) {
                return undefined;
            }
            const match = result[index];
            if (match === undefined) {
                return undefined;
            }
            return {
                rest: str.slice(match.length),
                value: match
            };
        });
    }

    /**
     * single character
     * @param {(char: string) => boolean} condition
     * @returns {Parser<string>}
     */
    static satisfy(condition) {
        return new Parser(str => {
            const char = str[0];
            if (char === undefined) {
                return undefined;
            }
            if (condition(char)) {
                return {
                    rest: str.slice(1),
                    value: char
                };
            } else {
                return undefined;
            }
        });
    }

    /**
     * single character
     * @param {string} char
     * @returns {Parser<string>}
     */
    static char(char) {
        if (char.length !== 1) {
            throw Error('length of char is not 1');
        }
        return Parser.satisfy(c => c === char);
    }

    /**
     *
     * @param {string} string
     */
    static string(string) {
        return new Parser(str => {
            if (str.startsWith(string)) {
                return {
                    rest: str.slice(string.length),
                    value: string
                };
            } else {
                return undefined;
            }
        });
    }

    /**
     * Enf of file
     * @returns {Parser<undefined>}
     */
    static eof() {
        return new Parser(str => {
            if (str.length === 0) {
                return {
                    rest: str,
                    value: undefined
                };
            }
            return undefined;
        });
    }

    /**
     * >>=
     * @template B
     * @param {(_: A) => Parser<B>} parser
     * @returns {Parser<B>}
     */
    andThen(parser) {
        return new Parser(str => {
            const resultA = this.parse(str);
            if (resultA === undefined) {
                return undefined;
            }
            return parser(resultA.value).parse(resultA.rest);
        });
    }

    /**
     * @param {Parser<unknown>} parser
     * @returns {Parser<A>}
     */
    andFirst(parser) {
        return this.andThen(x => parser.map(_ => x));
    }

    /**
     * @template B
     * @param {Parser<B>} parser
     * @returns {Parser<B>}
     */
    andSecond(parser) {
        return this.andThen(_ => parser);
    }

    /**
     * @template B
     * @param {(_: A) => B} f
     * @returns {Parser<B>}
     */
    map(f) {
        return this.andThen(x => Parser.pure(f(x)));
    }

    /**
     * @template B
     * @param {Parser<B>} parser
     * @returns {Parser<A | B>}
     */
    or(parser) {
        const parse = this.parse;
        /**
         *
         * @param {string} str
         * @returns {{ rest: string, value: A | B } | undefined}
         */
        function temp(str) {
            const resultA = parse(str);
            if (resultA !== undefined) {
                return resultA;
            }
            return parser.parse(str);
        }
        return new Parser(temp);
    }

    /**
     *
     * @param {Parser<A>[]} array
     * @returns {Parser<A>}
     */
    orArray(array) {
        return array.reduce((acc, x) => acc.or(x), this);
    }

    /**
     * @returns {Parser<A[]>}
     */
    many() {
        return new Parser(str => {
            let rest = str;
            /** @type {A[]} */
            const array = [];
            while (true) {
                const result = this.parse(rest);
                if (result === undefined) {
                    return {
                        rest: rest,
                        value: array
                    };
                } else {
                    rest = result.rest;
                    array.push(result.value);
                }
            }
        });
    }

    /**
     *
     * @param {(char: string) => boolean} condition
     * @returns {Parser<string>}
     */
    static takeWhile(condition) {
        return new Parser(str => {
            const len = str.length;
            for (let i = 0; i < len; i++) {
                const char = str[i];
                if (char === undefined) {
                    throw Error("takeWhile: internal error");
                }
                if (!condition(char)) {
                    return {
                        rest: str.slice(i),
                        value: str.slice(0, i)
                    };
                }
            }
            return {
                rest: "",
                value: str
            };
        });
    }

    /**
     *
     * @param {Parser<unknown>} separatorParser
     * @returns {Parser<A[]>}
     */
    sepBy(separatorParser) {
        return new Parser(str => {
            let rest = str;
            /** @type {A[]} */
            const array = [];
            while (true) {
                const result = this.parse(rest);
                if (result === undefined) {
                    return {
                        rest: rest,
                        value: array
                    };
                } else {
                    rest = result.rest;
                    array.push(result.value);
                    // read separator
                    const sepResult = separatorParser.parse(rest);
                    if (sepResult === undefined) {
                        return {
                            rest: rest,
                            value: array
                        };
                    } else {
                        rest = sepResult.rest;
                    }
                }
            }
        });
    }
}
