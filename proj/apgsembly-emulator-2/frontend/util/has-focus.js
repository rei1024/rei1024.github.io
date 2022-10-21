// @ts-check

const interactiveTags = new Set([
    "textarea", "input", "summary", "details", "button", "audio", "video",
    "select", "option", "a", "area"
]);

export function hasFocus() {
    const activeElementTagName =
        document.activeElement?.tagName.toLowerCase() ?? "";

    return interactiveTags.has(activeElementTagName);
}
