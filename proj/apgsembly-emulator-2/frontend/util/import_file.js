// @ts-check

/**
 *
 * @param {HTMLInputElement} $file
 * @param {(_: string) => void} callback
 */
export function importFileAsText($file, callback) {
    $file.addEventListener('input', (e) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const result = e.target?.result;
            if (typeof result !== "string") {
                throw Error('import: internal error');
            }
            callback(result);
        };

        /** @type {File} */
        // @ts-ignore
        const file = e.target?.files[0];

        if (file !== undefined) {
            reader.readAsText(file);
        }
    });
}
