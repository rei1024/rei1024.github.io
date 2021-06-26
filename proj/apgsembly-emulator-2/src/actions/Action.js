// @ts-check

/**
 * @abstract
 */
export class Action {
    /**
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
