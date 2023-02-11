// @ts-check

/**
 * @template T
 * @param {T[]} arr
 * @returns {T | undefined}
 */
export function extractSingle(arr) {
    if (arr.length !== 1) {
        return undefined;
    }

    const x = arr[0];

    return x;
}

/**
 * @template T, U
 * @param {T[]} array
 * @param {(_: T) => U} func
 * @returns {Map<U, T[]>}
 */
export function group(array, func) {
    /**
     * @type {Map<U, T[]>}
     */
    const map = new Map();
    for (const x of array) {
        const y = func(x);

        const a = map.get(y);
        if (a === undefined) {
            map.set(y, [x]);
        } else {
            a.push(x);
        }
    }

    return map;
}

/**
 * @template T, U, V
 * @param {Map<T, U>} map
 * @param {(_: U) => V} f
 * @returns {Map<T, V>}
 */
export function mapValue(map, f) {
    return new Map([...map].map(([k, v]) => [k, f(v)]));
}

/**
 * @template T, U
 */
export class MapValueMaybeError extends Error {
    /**
     * @param {T} key
     * @param {U} value
     */
    constructor(key, value) {
        super();

        this.key = key;
        this.value = value;
    }
}

/**
 * @template T, U, V
 * @param {Map<T, U>} map
 * @param {(_: U) => V | undefined} f
 * @returns {Map<T, V> | MapValueMaybeError<T, U>} fが一回でもundefinedを返した場合はundefinedを返す
 */
export function mapValueMaybe(map, f) {
    /**
     * @type {Map<T, V>}
     */
    const newMap = new Map();

    for (const [key, value] of map) {
        const newValue = f(value);
        if (newValue === undefined) {
            return new MapValueMaybeError(key, value);
        }
        newMap.set(key, newValue);
    }

    return newMap;
}
