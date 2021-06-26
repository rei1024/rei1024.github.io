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
}
