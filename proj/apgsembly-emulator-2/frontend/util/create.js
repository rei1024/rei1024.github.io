/**
 * @type {<K extends keyof HTMLElementTagNameMap>(tagName: K, fn: (_: HTMLElementTagNameMap[K]) => void) => HTMLElementTagNameMap[K]}
 */
export function create(tag, fn = undefined) {
    const e = document.createElement(tag);

    if (fn != undefined) {
        fn(e);
    }

    return e;
}
