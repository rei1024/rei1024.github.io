// @ts-check
/// <reference lib="webworker" />

self.addEventListener("install", function (event) {
    // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting
    event.waitUntil(self.skipWaiting());
});

const CACHE_PREFIX = "apge-";
const CACHE_VERSION = CACHE_PREFIX + "2022-10-28";

self.addEventListener("activate", function (event) {
    const _self = self;
    async function handleCache() {
        try {
            await _self.clients.claim();
        } catch (error) { /* nop */ }

        const oldCacheNames = (await caches.keys()).filter((x) =>
            x !== CACHE_VERSION
        );
        await Promise.all(oldCacheNames.map((name) => caches.delete(name)));

        const cache = await caches.open(CACHE_VERSION);
        // deno eval 'console.log([...Deno.readDirSync("./frontend/data")].map(x => x.name).filter(x => x.endsWith(".apg")).map(x => "./frontend/data/" + x ) )'
        await cache.addAll([
            "./frontend/data/ant2.apg",
            "./frontend/data/koch.apg",
            "./frontend/data/wip_e_calc.apg",
            "./frontend/data/integers.apg",
            "./frontend/data/alien_counter.apg",
            "./frontend/data/rule110.apg",
            "./frontend/data/unary_multiply.apg",
            "./frontend/data/binary_ruler.apg",
            "./frontend/data/pi_calc.apg",
            "./frontend/data/primes.apg",
            "./frontend/data/sqrt_log_t.apg",
            "./frontend/data/rule90.apg",
            "./frontend/data/99.apg",
        ]);
    }

    event.waitUntil(handleCache());
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
    if (url.pathname.endsWith("/index.html")) {
        const cacheResponse = await cache.match(
            new Request(
                { ...request, url: url.href.slice(0, -"index.html".length) },
            ),
        );
        if (cacheResponse) {
            return cacheResponse;
        }
    }

    if (url.pathname.endsWith("/")) {
        const cacheResponse = await cache.match(
            new Request(
                { ...request, url: url.href + "index.html" },
            ),
        );
        if (cacheResponse) {
            return cacheResponse;
        }
    }

    return "not found";
}

self.addEventListener("fetch", function (event) {
    /**
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
            const response = await fetch(request, {
                credentials: "omit",
                mode: "no-cors",
            });
            const url = new URL(request.url);
            const status = response.status;
            const protocol = url.protocol;
            if (
                200 <= status &&
                    status < 400 &&
                    protocol === "https:" || protocol === "http:"
            ) {
                event.waitUntil(cache.put(request, response.clone()));
            }
            return response;
        } catch (e) {
            const cachedResponse = await getCachedResponse(
                cache,
                request.clone(),
            );
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
