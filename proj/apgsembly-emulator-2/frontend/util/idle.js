// @ts-check

/**
 * アイドル状態の場合に実行
 */
export const idle = window.requestIdleCallback ?? (c => {
    setTimeout(() => {
        c({
            didTimeout: false,
            timeRemaining() {
                return 0;
            }
        });
    }, 0);
});
