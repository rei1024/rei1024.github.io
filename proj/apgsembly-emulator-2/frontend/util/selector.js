// @ts-check

/**
 * @type {(selector: string) => Element}
 * @throws {Error}
 */
 export function $(selector) {
    if (typeof selector === 'undefined') {
        throw TypeError('selector is not a string');
    }
    const el = document.querySelector(selector);

    if (el == null) {
        throw Error(`can't found a element for "${selector}"`);
    }
    return el;
}

/**
 * @type {<T extends Element>(selector: string, klass: new () => T) => T}
 * @throws {Error}
 */
export function $type(selector, klass) {
    if (typeof selector === 'undefined') {
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

/**
 *
 * @type {(selector: string) => Element[]}
 */
export function $$(selector) {
    if (typeof selector === 'undefined') {
        throw TypeError('selector is not a string');
    }
    // @ts-ignore
    return [...document.querySelectorAll(selector)];
}

/**
 *
 * @type {<T extends Element>(selector: string, klass: new () => T) => T[]}
 */
 export function $$type(selector, klass) {
    if (typeof selector === 'undefined') {
        throw TypeError('selector is not a string');
    }

    /** @type {unknown[]} */
    const array = []
    document.querySelectorAll(selector).forEach(element => {
        if (element instanceof klass) {
            array.push(element);
        }
    });
    // @ts-ignore
    return array;
}
