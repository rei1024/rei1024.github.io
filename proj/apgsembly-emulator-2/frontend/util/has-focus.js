// @ts-check

const interactiveTags = new Set([
    "textarea",
    "input",
    "summary",
    "details",
    "button",
    "audio",
    "video",
    "select",
    "option",
    "a",
    "area",
    "modal",
]);

/**
 * インタラクティブな要素にフォーカスがあるか？
 */
export function hasFocus() {
    const activeElementTagName =
        document.activeElement?.tagName.toLowerCase() ??
            "";

    return interactiveTags.has(activeElementTagName);
}
