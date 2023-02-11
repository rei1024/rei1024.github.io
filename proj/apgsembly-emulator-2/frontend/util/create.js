// @ts-check

/**
 * @template {keyof HTMLElementTagNameMap} T
 * @typedef {{
 * fn?: ((_: HTMLElementTagNameMap[T]) => void) | undefined;
 * text?: string;
 * classes?: string[];
 * children?: Element[];
 * style?: Record<string, string>;
 * }} CreateOptions<T>
 */

/**
 * 要素を作成する
 * @type {<K extends keyof HTMLElementTagNameMap>(tagName: K, textOrOptions?: (string | CreateOptions<K>)) => HTMLElementTagNameMap[K]}
 */
export function create(tag, textOrOptions) {
    const e = document.createElement(tag);

    if (typeof textOrOptions === "string") {
        e.textContent = textOrOptions;
    } else if (
        textOrOptions !== undefined && textOrOptions !== null &&
        typeof textOrOptions === "object"
    ) {
        if (textOrOptions.text) {
            e.textContent = textOrOptions.text;
        }
        if (textOrOptions.classes) {
            e.classList.add(...textOrOptions.classes);
        }
        if (textOrOptions.fn) {
            textOrOptions.fn(e);
            textOrOptions.fn = undefined;
        }
        if (textOrOptions.children) {
            e.append(...textOrOptions.children);
        }
        if (textOrOptions.style) {
            for (const [key, value] of Object.entries(textOrOptions.style)) {
                if (key in e.style) {
                    // @ts-ignore
                    e.style.key = value;
                } else {
                    e.style.setProperty(key, value);
                }
            }
        }
    }

    return e;
}
