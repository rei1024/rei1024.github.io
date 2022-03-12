// @ts-check

/**
 * @param {string} url
 * @param {string} [fileName]
 */
export function downloadURL(
    url,
    fileName = "",
) {
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
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
    downloadURL(url, fileName);
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, timeout);
}
