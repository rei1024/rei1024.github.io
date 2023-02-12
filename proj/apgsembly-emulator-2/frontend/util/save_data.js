// @ts-check

/**
 * undefinedは未実装
 * @returns {boolean | undefined}
 */
export function getSaveData() {
    const connection =
        // @ts-ignore
        navigator.connection ||
        // @ts-ignore
        navigator.mozConnection ||
        // @ts-ignore
        navigator.webkitConnection;

    if (
        connection !== undefined && connection !== null &&
        typeof connection === "object"
    ) {
        /**
         * @type {boolean}
         */
        const saveData = connection.saveData;
        return saveData;
    }
    return undefined;
}
