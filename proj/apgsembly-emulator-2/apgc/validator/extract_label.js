// @ts-check
import {
    APGCProgram,
    APGCStatements,
    APGCStatement,
    APGCExpressionStatement,
    FunctionCallExpression,
    LABEL_FUNCTION_NAME,
    StringExpression,
    APGCExpression,
    IfStatement,
    WhileStatement,
    GOTO_FUNCTION_NAME
} from "../types/apgc_types.js";

/**
 * @param {APGCProgram} program
 * @returns {APGCExpression[]}
 */
export function extractExpressionFromAPGCProgram(program) {
    return extractExpressionFromAPGCStatements(program.apgcStatements);
}

/**
 *
 * @param {APGCStatements} stmts
 * @returns {APGCExpression[]}
 */
function extractExpressionFromAPGCStatements(stmts) {
    return stmts.statements.flatMap(x => extractExpressionFromAPGCStatement(x));
}

/**
 *
 * @param {APGCStatement} stmt
 * @returns {APGCExpression[]}
 */
 function extractExpressionFromAPGCStatement(stmt) {
    if (stmt instanceof APGCExpressionStatement) {
        return [stmt.expr];
    } else if (stmt instanceof IfStatement) {
        return [stmt.expr].concat(
            extractExpressionFromAPGCStatements(stmt.thenStatements),
            extractExpressionFromAPGCStatements(stmt.elseStataments)
        );
    } else if (stmt instanceof WhileStatement) {
        return [stmt.expr].concat(
            extractExpressionFromAPGCStatements(stmt.statements)
        );
    }
    return [];
}

// LABEL

/**
 * labelのラベルを抽出する
 * @param {APGCProgram} program
 * @returns {string[]}
 */
export function extractLabelFromAPGCProgram(program) {
    const exprs = extractExpressionFromAPGCProgram(program);
    const labels = exprs.flatMap(expr => {
        if (expr instanceof FunctionCallExpression) {
            if (expr.name === LABEL_FUNCTION_NAME) {
                const arg = expr.args[0];
                if (!(arg instanceof StringExpression)) {
                    throw Error('label argument is not a string');
                }
                return [arg.string];
            }
        }
        return [];
    });
    return labels;
}

/**
 * gotoのラベルを抽出する
 * @param {APGCProgram} program
 * @returns {string[]}
 */
 export function extractGotoLabelFromAPGCProgram(program) {
    const exprs = extractExpressionFromAPGCProgram(program);
    const labels = exprs.flatMap(expr => {
        if (expr instanceof FunctionCallExpression) {
            if (expr.name === GOTO_FUNCTION_NAME) {
                const arg = expr.args[0];
                if (!(arg instanceof StringExpression)) {
                    throw Error('label argument is not a string');
                }
                return [arg.string];
            }
        }
        return [];
    });
    return labels;
}
