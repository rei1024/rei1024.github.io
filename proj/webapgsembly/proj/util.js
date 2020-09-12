/**
 * `Map`でグループ分けを行う
 * @template T
 * @template U
 * @param {Array<T>} array
 * @param {(_: T) => U} func
 * @returns {Map<U, Array<T>>}
 */
export function groupMapBy(array, func) {
    /** @type Map<U, Array<T>> */
    let m = new Map()
    for (const e of array) {
        let r = func(e)
        if (m.has(r)) {
            m.set(r, m.get(r).concat([e]))
        } else {
            m.set(r, [ e ])
        }
    }
    return m
}

/**
 * 配列を生成する
 * @template T
 * @param {number} n - 配列の長さ
 * @param {(_:number) => T} func - 添字から要素への関数
 * @returns {Array<T>} 長さnの配列
 * @throws {TypeError} when n is not a number
 */
export function generateArray(n, func) {
    if (typeof n !== "number") { throw TypeError("first argment must be a number"); }
    if (n < 0) { return []; }
    let arr = new Array(n)
    for (let i = 0; i < n; i++) {
        arr[i] = func(i);
    }
    return arr;
}
