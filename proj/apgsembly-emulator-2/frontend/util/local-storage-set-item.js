/**
 * Cookieを許可しない場合例外が発生する
 */
export function localStorageSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (_) {
        // do nothing
    }
}
