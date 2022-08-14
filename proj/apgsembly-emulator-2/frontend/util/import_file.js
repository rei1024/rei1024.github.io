// @ts-check

/**
 * @param {HTMLInputElement} $file
 * @param {(_: string) => void} callback
 */
export function importFileAsText($file, callback) {
    $file.addEventListener('input', () => {
        const file = $file.files === null ? undefined : $file.files[0];
        if (file === undefined) {
            return;
        }
        file.text().then(callback);
    });
}
