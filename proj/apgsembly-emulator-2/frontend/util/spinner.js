// @ts-check

/**
 * Create spinner
 * @returns {HTMLElement}
 */
export const makeSpinner = () => {
    const spinner = document.createElement("span");
    spinner.classList.add("spinner-border", "spinner-border-sm");
    spinner.setAttribute("role", "status");
    spinner.setAttribute("aria-hidden", "true");
    return spinner;
};
