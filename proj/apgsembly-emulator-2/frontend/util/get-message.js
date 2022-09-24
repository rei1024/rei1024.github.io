// @ts-check

/**
 * @param {unknown} error
 */
export function getMessage(error) {
    if (error instanceof Error) {
        return error.message;
    } else {
        return "Unknown error is occurred.";
    }
}
