// @ts-check

/**
 * <link rel="prefetch" href="second.html">
 * @param {string | URL} url
 */
export function prefetch(url) {
    if (url instanceof URL) {
        url = url.href;
    }
    const link = document.createElement('link');
    link.rel = "prefetch";
    link.href = url;
    document.head.append(link);
}
