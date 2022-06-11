// @ts-check

self.addEventListener("install", function () {

});

const CACHE_VERSION = "2022-06-10";

self.addEventListener('activate', function (event) {
    async function deleteCache() {
        const oldCacheNames = (await caches.keys()).filter(x => x !== CACHE_VERSION);
        return Promise.all(oldCacheNames.map(name => caches.delete(name)));
    }

    event.waitUntil(deleteCache());
});

/**
 * @param {Cache} cache
 * @param {Request} request
 * @returns {Promise<Response | "not found">}
 */
async function getCachedResponse(cache, request) {
    const cacheResponse = await cache.match(request);
    if (cacheResponse) {
        return cacheResponse;
    }

    const url = new URL(request.url);
    if (url.pathname.endsWith('/index.html')) {
        const cacheResponse =
            await cache.match(new Request(
                { ...request, url: url.href.slice(0, -"index.html".length) }
            ));
        if (cacheResponse) {
            return cacheResponse;
        }
    }

    if (url.pathname.endsWith('/')) {
        const cacheResponse =
            await cache.match(new Request(
                { ...request, url: url.href + "index.html" }
            ));
        if (cacheResponse) {
            return cacheResponse;
        }
    }

    return "not found";
}

self.addEventListener('fetch', function (event) {
    /**
     *
     * @returns {Promise<Response>}
     */
    async function getResponse() {
        /**
         * @type {Request}
         */
        const request = event.request;
        const cache = await caches.open(CACHE_VERSION);

        const cachedResponse = await getCachedResponse(cache, request);
        if (cachedResponse !== "not found") {
            return cachedResponse;
        }

        try {
            const response = await fetch(request.clone());
            const url = new URL(request.url);
            if (200 < response.status &&
                response.status < 400 &&
                url.protocol !== 'chrome-extension') {
                cache.put(request, response.clone());
            }
            return response;
        } catch (e) {
            "network error";
            throw e;
        }
    }

    // 同期的に実行する必要がある
    event.respondWith(getResponse());
});
