// @ts-check

/**
 * @type {<T extends Element>(selector: string, klass: new () => T) => T}
 * @throws {Error}
 */
export function $type(selector, klass) {
    if (typeof selector !== 'string') {
        throw TypeError('selector is not a string');
    }
    const el = document.querySelector(selector);

    if (el == null) {
        throw Error(`can't found a element for "${selector}"`);
    }

    if (el instanceof klass) {
        return el;
    }

    throw Error(`"${selector}" is not a ${klass.name}`);
}
