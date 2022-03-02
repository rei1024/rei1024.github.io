/**
 * @param {string} url
 * @param {string} fileName
 * @param {number} timeout
 * @param {(url: string) => void} callback
 */
export function downloadURL(
    url,
    fileName = "",
    timeout = 1000,
    callback = (url) => {},
) {
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        callback(url);
    }, timeout);
}

/**
 * @param {Blob} blob
 * @param {string} fileName
 * @param {number} timeout
 */
export function downloadBlob(blob, fileName = "", timeout = 1000) {
    if (typeof URL === "undefined") {
        return;
    }
    const url = URL.createObjectURL(blob);
    downloadURL(url, fileName, timeout, (url) => {
        URL.revokeObjectURL(url);
    });
}
