// @ts-check

/**
 * エラーからメッセージを取得する
 * @param {unknown} error
 */
export function getMessageFromError(error) {
    if (error instanceof Error) {
        return error.message;
    } else {
        return "Unknown error is occurred.";
    }
}
