// @ts-check

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
     * アクションに含まれるスライディングレジスタのレジスタ番号を返す。
     * @returns {number[]}
     */
    extractUnaryRegisterNumbers() {
        return [];
    }

    /**
     * アクションに含まれるバイナリレジスタのレジスタ番号を返す。
     * @returns {number[]}
     */
    extractBinaryRegisterNumbers() {
        return [];
    }

    /**
     * アクションに含まれるTレジスタのレジスタ番号を返す。
     * @returns {number[]}
     */
    extractLegacyTRegisterNumbers() {
        return [];
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
