// @ts-check

import { Line } from "./Line.js";
import { TM } from "./TM.js";
import { group, mapValueMaybe, MapValueMaybeError } from "./util.js";

/**
 * @template T
 * @param {T[]} arr
 * @returns {T | undefined}
 */
function extractSingle(arr) {
    if (arr.length !== 1) {
        return undefined;
    }

    const x = arr[0];
    if (x === undefined) {
        return undefined;
    }

    return x;
}

export class TMMap {
    /**
     *
     * @param {Map<string, Map<string, Line | undefined>>} map
     * @param {string[]} states
     * @param {string[]} symbols
     */
    constructor(map, states, symbols) {
        /**
         * @type {Map<string, Map<string, Line | undefined>>}
         * @readonly
         */
        this.map = map;

        /**
         * @type {string[]}
         * @readonly
         */
        this.states = states;

        /**
         * @type {string[]}
         * @readonly
         */
        this.symbols = symbols;
    }

    /**
     * @returns {Generator<{ currentState: string, currentSymbol: string, line: Line | undefined }>}
     */
    *entries() {
        for (const [state, m] of this.map) {
            for (const [symbol, line] of m) {
                yield {
                    currentState: state,
                    currentSymbol: symbol,
                    line: line,
                };
            }
        }
    }

    /**
     *
     * @param {string} state
     * @param {string} symbol
     * @returns {Line | undefined}
     */
    getLine(state, symbol) {
        return this.map.get(state)?.get(symbol);
    }

    /**
     *
     * @param {TM} tm
     * @returns {TMMap | Error}
     */
    static fromTM(tm) {
        const knownSymbolLines = tm.lines.filter(x => x.currentSymbol !== undefined);
        const unknownSymbolLines = tm.lines.filter(x => x.currentSymbol === undefined);

        /**
         * @type {MapValueMaybeError<string | undefined, Line[]> | Map<string | undefined, Map<string | undefined, Line>>}
         */
        const knownSymbolMapOrError = mapValueMaybe(group(knownSymbolLines, x => x.currentState), lines => {
            const map = group(lines, x => x.currentSymbol);
            const e = mapValueMaybe(map, extractSingle);
            if (e instanceof MapValueMaybeError) {
                return undefined;
            }
            return e;
        });

        if (knownSymbolMapOrError instanceof MapValueMaybeError) {
            return Error(`duplicate transition for state "${ knownSymbolMapOrError.key }"`);
        }

        const unknownSymbolMapOrError = mapValueMaybe(group(unknownSymbolLines, x => x.currentState), extractSingle);

        if (unknownSymbolMapOrError instanceof MapValueMaybeError) {
            return Error(`duplicate transition for state "${ unknownSymbolMapOrError.key }"`);
        }

        const knownSymbolMap = knownSymbolMapOrError;
        const unknownSymbolMap = unknownSymbolMapOrError;

        /**
         *
         * @param {string} state
         * @param {string} symbol
         * @returns {Line | Error}
         */
        function getLineBy(state, symbol) {
            const frist = knownSymbolMap.get(state);
            if (frist !== undefined) {
                const x = frist.get(symbol);
                if (x !== undefined) {
                    return x;
                }
            }

            const second = unknownSymbolMap.get(state);
            if (second !== undefined) {
                return second;
            }

            const third = frist?.get(undefined);
            if (third !== undefined) {
                return third;
            }

            const fourth = unknownSymbolMap.get(undefined);
            if (fourth !== undefined) {
                return fourth;
            }

            return Error('transition is incomplete');
        }

        const states = tm.getStates();
        const symbols = tm.getSymbols();

        const map = new Map(
            states.map(
                state => [
                    state,
                    new Map(symbols.map(
                        symbol => {
                            const line = getLineBy(state, symbol);
                            return [symbol, (line instanceof Error) ? undefined : line];
                        }
                    ))
                ]
            )
        );

        return new TMMap(map, states, symbols);
    }
}
