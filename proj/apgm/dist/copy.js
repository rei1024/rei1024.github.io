// @ts-check

/**
 * @param {HTMLElement} $copy
 * @param {() => string} fn
 */
export function setupCopy($copy, fn) {
    $copy.addEventListener("click", () => {
        navigator.clipboard.writeText(fn()).then(() => {
            $copy.textContent = "Copied";
            $copy.classList.add("btn-success");
            $copy.classList.remove("btn-primary");
            setTimeout(() => {
                $copy.textContent = "Copy";
                $copy.classList.remove("btn-success");
                $copy.classList.add("btn-primary");
            }, 1000);
        });
    });
}
