// @ts-check

/**
 * 例外を握りつぶす
 *
 * Cookieを許可しない場合例外が発生する
 * @param {string} key
 * @param {string} value
 */
export function localStorageSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (_) {
        // do nothing
    }
}

/**
 * 例外を握りつぶす
 *
 * Cookieを許可しない場合例外が発生する
 * @param {string} key
 */
export function localStorageRemoveItem(key) {
    try {
        localStorage.removeItem(key);
    } catch (_) {
        // do nothing
    }
}

/**
 * 例外を握りつぶす
 *
 * Cookieを許可しない場合例外が発生する
 * @param {string} key
 * @returns {string | null}
 */
export function localStorageGetItem(key) {
    try {
        return localStorage.getItem(key);
    } catch (_) {
        return null;
    }
}
