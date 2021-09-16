// @ts-check

/**
 *
 * @param {HTMLInputElement} $file
 * @param {(_: string) => void} callback
 */
export function importFileAsText($file, callback) {
    $file.addEventListener('input', (e) => {
        /** @type {File} */
        // @ts-ignore
        const file = e.target?.files[0];
        if (file === undefined) {
            return;
        }
        file.arrayBuffer().then(buffer => {
            callback(new TextDecoder().decode(buffer));
        });
    });
}
