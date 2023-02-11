// @ts-check

/**
 * @param {HTMLInputElement} $file
 * @param {(_: string) => void} callback
 */
export function importFileAsText($file, callback) {
    $file.addEventListener("input", () => {
        const file = $file.files?.item(0);
        if (file == undefined) {
            return;
        }
        file.text().then(callback);
    });
}
