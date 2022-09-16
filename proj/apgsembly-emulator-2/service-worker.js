// @ts-check

self.addEventListener("install", function (event) {
    // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting
    event.waitUntil(self.skipWaiting());
});

const CACHE_VERSION = "2022-09-14";

self.addEventListener('activate', function (event) {
    const _self = self;
    async function deleteCache() {
        try {
            await _self.clients.claim();
        } catch (error) { /* nop */ }

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

        // network first
        // FIXME: no-corsの場合SRIが通らない no-corsでないとcross-originをキャッシュから取り出せない
        try {
            const response = await fetch(request, { credentials: "omit", mode: 'no-cors' });
            const url = new URL(request.url);
            if (200 <= response.status &&
                response.status < 400 &&
                url.protocol !== 'chrome-extension') {
                event.waitUntil(cache.put(request, response.clone()));
            }
            return response;
        } catch (e) {
            const cachedResponse = await getCachedResponse(cache, request.clone());
            if (cachedResponse !== "not found") {
                return cachedResponse;
            }
            throw e;
        }
    }

    // 同期的に実行する必要がある
    // 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css'
    // の読み込みに失敗しました。
    // ServiceWorker が ‘cors’ FetchEvent のハンドル中に
    // opaque Response を FetchEvent.respondWith() へ渡しました
    // opaque Response オブジェクトは RequestMode が ‘no-cors’ である時のみ有効です。
    event.respondWith(getResponse());
});
