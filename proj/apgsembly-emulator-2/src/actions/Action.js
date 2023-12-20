// @ts-check

/**
 * アクション
 * @abstract
 */
export class Action {
    /**
     * Convert to string
     * 文字列化する
     * @abstract
     * @returns {string}
     */
    pretty() {
        return ``;
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
