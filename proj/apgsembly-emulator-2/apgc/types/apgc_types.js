// @ts-check

/**
 * 文
 * @abstract
 */
export class APGCStatement {

}

/**
 * 文の列
 */
export class APGCStatements {
    /**
     * 
     * @param {APGCStatement[]} statements 
     */
    constructor(statements) {
        /**
         * @readonly
         */
        this.statements = statements;
    }
}

/**
 * 式
 * @abstract
 */
export class APGCExpression {

}
 
/**
 * 数字
 * 42
 */
export class NumberExpression extends APGCExpression {
    /**
     * 
     * @param {number} value 
     */
    constructor(value) {
        super();
        /**
         * @readonly
         */
        this.value = value;
    }
}

/**
 * 文字列
 * "abc"
 * ダブルクォーテーションのみエスケープする
 */
export class StringExpression extends APGCExpression {
    /**
     * 
     * @param {string} str 
     */
    constructor(str) {
        super();
        /**
         * @readonly
         */
        this.string = str;
    }
}

/**
 * 関数呼び出し
 * f(1, 2, 3)
 */
export class FunctionCallExpression extends APGCExpression {
    /**
     * 
     * @param {string} name 関数名
     * @param {APGCExpression[]} args 引数
     */
    constructor(name, args) {
        super();
        /**
         * 関数名
         * @readonly
         */
        this.name = name;
        /**
         * 引数
         * @readonly
         */
        this.args = args;
    }
}

export const LABEL_FUNCTION_NAME = "label";

export const GOTO_FUNCTION_NAME = "goto";

// expression with ;
export class APGCExpressionStatement extends APGCStatement {
    /**
     * 
     * @param {APGCExpression} expr 
     */
    constructor(expr) {
        super();
        /**
         * @readonly
         */
        this.expr = expr;
    }
}

export const ifZeroKeyword = 'if_zero';
export const ifNonZeroKeyword = "if_non_zero";

/**
 * if_zero (expr) { statements }
 * if_zero (expr) { statements } else { statements }
 */
export class IfStatement extends APGCStatement {
    /**
     * @param {"zero" | "non_zero"} zeroOrNonZero
     * @param {APGCExpression} expr 評価される式
     * @param {APGCStatements} zeroStatements Zの場合
     * @param {APGCStatements} nonZeroStatements NZの場合
     */
    constructor(zeroOrNonZero, expr, zeroStatements, nonZeroStatements) {
        super();
        /**
         * @readonly
         */
        this.zeroOrNonZero = zeroOrNonZero;
        /**
         * @readonly
         */
        this.expr = expr;
        /**
         * @readonly
         */
        this.thenStatements = zeroStatements;
        /**
         * @readonly
         */
        this.elseStataments = nonZeroStatements;
    }

    /**
     * 
     * @returns {string}
     */
    keyword() {
        return this.zeroOrNonZero === "zero" ? ifZeroKeyword : ifNonZeroKeyword;
    }
}

export const whileNonZeroKeyword = 'while_non_zero';
export const whileZeroKeyword = 'while_zero';

/**
 * 0でない間繰り替えす
 * while_non_zero (expr) { statements } 
 */
export class WhileStatement extends APGCStatement {
    /**
     * @param {"zero" | "non_zero"} zeroOrNonZero
     * @param {APGCExpression} expr 
     * @param {APGCStatements} statements 
     */
    constructor(zeroOrNonZero, expr, statements) {
        super();
        /**
         * @readonly
         */
        this.zeroOrNonZero = zeroOrNonZero;
        /**
         * @readonly
         */
        this.expr = expr;
        /**
         * @readonly
         */
        this.statements = statements;
    }
    /**
     * 
     * @returns {string}
     */
    keyword() {
        return this.zeroOrNonZero === "zero" ? whileZeroKeyword : whileNonZeroKeyword;
    }
}

/**
 * プログラム全体
 */
export class APGCProgram {
    /**
     * @param {APGCStatements} apgcStatements 
     * @param {string[]} headers
     */
    constructor(apgcStatements, headers = []) {
        /**
         * @readonly
         */
        this.apgcStatements = apgcStatements;

        /**
         * @readonly
         */
        this.headers = headers;
    }
}
