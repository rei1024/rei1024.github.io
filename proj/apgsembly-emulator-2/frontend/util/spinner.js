// @ts-check

/**
 * 
 * @returns {HTMLElement}
 */
export function makeSpinner() {
    const spinner = document.createElement('span');
    spinner.classList.add('spinner-border', 'spinner-border-sm');
    spinner.setAttribute('role', 'status');
    spinner.setAttribute('aria-hidden', 'true');
    return spinner;
}
