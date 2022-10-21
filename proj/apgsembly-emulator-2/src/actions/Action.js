// @ts-check

/**
 * @returns {never}
 */
export function internalError() {
    throw Error('internal error');
}

/**
 * アクション
 * @abstract
 */
export class Action {
    /**
     * Convert to string
     * 文字列化する
     * @returns {string}
     */
    pretty() {
        return "unimplemented";
    }

    /**
     * Does this action return a value?
     * 値を返すかどうか
     * @returns {boolean} 値を返す場合true
     */
    doesReturnValue() {
        return false;
    }

    /**
     * 同じコンポーネントのアクションであればtrueを返す
     * @param {Action} _action
     * @returns {boolean}
     */
    isSameComponent(_action) {
        return true;
    }
}
