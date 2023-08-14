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
export const hasFocus = () => {
    const activeElementTagName =
        document.activeElement?.tagName.toLowerCase() ??
            "";

    return interactiveTags.has(activeElementTagName);
};
