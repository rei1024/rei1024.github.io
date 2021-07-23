// @ts-check
import {
    Command,
    INITIAL_STATE,
    Action,
    HaltOutAction,
    NopAction,
    // U
    URegAction,
    U_INC,
    U_TDEC,
    // B
    BRegAction,
    B_INC,
    B_TDEC,
    B_READ,
    B_SET,
    // B2D
    B2DAction,
    B2D_INC,
    B2D_TDEC,
    B2D_READ,
    B2D_SET,
    B2D_B2DX,
    B2D_B2DY,
    B2D_B2D,
    // ADD
    AddAction,
    ADD_A1,
    ADD_B0,
    ADD_B1,
    // SUB
    SubAction,
    SUB_A1,
    SUB_B0,
    SUB_B1,
    // MUL
    MulAction,
    MUL_0,
    MUL_1,
} from "../apgc_deps.js";

import {
    APGCExpressionStatement,
    APGCProgram,
    APGCStatements,
    APGCStatement,
    IfStatement,
    WhileStatement,
    FunctionCallExpression,
    StringExpression,
    LABEL_FUNCTION_NAME,
    GOTO_FUNCTION_NAME,
    APGCExpression,
} from "../types/apgc_types.js";
import { compileOutput } from "./functions/output.js";
import { compileEmptyArgumentFunction } from "./functions/empty_argument_function.js";
import { compileSingleNumberArgumentFunction } from "./functions/single_number_argument_function.js";

const UNREACHABLE_PREFIX =  "APGC_UNREACHABLE_";

// goto and label
const LABEL_PREFIX = "APGC_LABEL_";

export class APGCCompiler {
    /**
     * 
     * @param {APGCProgram} program 
     */
    constructor(program) {
        /**
         * @readonly
         */
        this.program = program;

        /**
         * @type {Command[]}
         * @private
         */
        this.commands = [];

        this.id = 0;
    }

    /**
     * 
     * @param {Command} command 
     */
    addCommand(command) {
        this.commands.push(command);
    }

    /**
     * @returns {Command[]}
     * @throws
     */
    compile() {
        const initialState = INITIAL_STATE;
        const apgcInitialState = "APGC_INITIAL";
        this.addCommand(new Command({
            state: initialState,
            nextState: apgcInitialState,
            input: "ZZ",
            actions: [new NopAction()]
        }));        
        const outputState = this.compileStatements(apgcInitialState, this.program.apgcStatements);
        this.addCommand(new Command({
            state: outputState,
            nextState: outputState,
            input: "*",
            actions: [new HaltOutAction()]
        }));
        // 到達不可能な状態を削除
        this.commands = this.commands.filter(x => !x.state.startsWith(UNREACHABLE_PREFIX));
        return this.commands;
    }

    /**
     * @param {string} inputState
     * @param {APGCStatements} apgcStatements 
     * @returns {string} outputState
     * @throws
     */
    compileStatements(inputState, apgcStatements) {
        for (const statement of apgcStatements.statements) {
            inputState = this.compileStatement(inputState, statement)
        }
        return inputState;
    }

    /**
     * 
     * @returns {string}
     */
    generateState() {
        this.id++;
        return "STATE_" + this.id;
    }

    /**
     * 
     * @param {string} inputState 
     * @param {APGCExpression} expr
     * @param {string} [msg]
     * @returns {string} outputState
     */
    compileAPGCExpression(inputState, expr, msg = undefined) {
        if (expr instanceof FunctionCallExpression) {
            return this.compileFunctionCallExpression(inputState, expr);
        } else {
            if (msg === undefined) {
                throw Error('expression cannot compile');
            } else {
                throw Error(msg);
            }
        }
    }

    /**
     * @param {string} inputState
     * @param {FunctionCallExpression} expr 
     * @returns {string} outputState
     * @throws
     */
    compileFunctionCallExpression(inputState, expr) {
        const __this__ = this;
        /**
         * 
         * @param {(_: number) => Action[]} actions 
         * @returns {string}
         */
        function single(actions) {
            return compileSingleNumberArgumentFunction(__this__, inputState, expr, actions);
        }

        /**
         * 
         * @param {Action[]} actions 
         */
        function empty(actions) {
            return compileEmptyArgumentFunction(__this__, inputState, expr, actions);
        }

        switch (expr.name) {
            case LABEL_FUNCTION_NAME: return compileLabel(this, inputState, expr);
            case GOTO_FUNCTION_NAME: return compileGoto(this, inputState, expr);

            case "output": return compileOutput(this, inputState, expr);
            // U
            case "inc_u": return single(n => [new URegAction(U_INC, n), new NopAction()]);
            case "tdec_u": return single(n => [new URegAction(U_TDEC, n)]);
            // B
            case "inc_b": return single(n => [new BRegAction(B_INC, n), new NopAction()]);
            case "tdec_b": return single(n => [new BRegAction(B_TDEC, n)]);
            case "read_b": return single(n => [new BRegAction(B_READ, n)]);
            case "set_b": return single(n => [new BRegAction(B_SET, n), new NopAction()]);
            // B2D
            case "inc_b2dx": return empty([new B2DAction(B2D_INC, B2D_B2DX), new NopAction()]);
            case "inc_b2dy": return empty([new B2DAction(B2D_INC, B2D_B2DY), new NopAction()]);
            case "tdec_b2dx": return empty([new B2DAction(B2D_TDEC, B2D_B2DX)]);
            case "tdec_b2dy": return empty([new B2DAction(B2D_TDEC, B2D_B2DY)]);
            case "read_b2d": return empty([new B2DAction(B2D_READ, B2D_B2D)]);
            case "set_b2d": return empty([new B2DAction(B2D_SET, B2D_B2D), new NopAction()]);
            // ADD
            case "add_a1": return empty([new AddAction(ADD_A1), new NopAction()]);
            case "add_b0": return empty([new AddAction(ADD_B0)]);
            case "add_b1": return empty([new AddAction(ADD_B1)]);
            // SUB
            case "sub_a1": return empty([new SubAction(SUB_A1), new NopAction()]);
            case "sub_b0": return empty([new SubAction(SUB_B0)]);
            case "sub_b1": return empty([new SubAction(SUB_B1)]);
            // MUL
            case "mul_0": return empty([new MulAction(MUL_0)]);
            case "mul_1": return empty([new MulAction(MUL_1)]);
            // NOP
            case "nop": return empty([new NopAction()]);
            // HALT_OUT
            case "halt_out": return empty([new HaltOutAction()]);
        }
        throw Error(`unknown function "${expr.name}"`);
    }

    /**
     * @param {string} inputState
     * @param {APGCStatement} statement 
     * @returns {string} outputState
     * @throws
     */
    compileStatement(inputState, statement) {
        if (statement instanceof APGCExpressionStatement) {
            const expr = statement.expr;
            if (expr instanceof FunctionCallExpression) {
                return this.compileFunctionCallExpression(inputState, expr);
            } else {
                throw Error('only function call expression can be statement');
            }
        } else if (statement instanceof IfStatement) {
            return compileIfStatement(this, inputState, statement);
        } else if (statement instanceof WhileStatement) {
            return compileWhileStatement(this, inputState, statement);
        } else {
            throw Error('unknown statement ' + statement);
        }
    }
}

/**
 *
 * @param {APGCCompiler} ctx 
 * @param {string} inputState 
 * @param {IfStatement} statement 
 * @returns {string} outputState
 */
function compileIfStatement(ctx, inputState, statement) {
    const expr = statement.expr;
    const ifState = ctx.compileAPGCExpression(inputState, expr, `${statement.keyword()} only accept function call`);

    const ifThenState = ctx.generateState();
    const ifElseState = ctx.generateState();
    const ifCommandZero = new Command({
        state: ifState,
        input: "Z",
        nextState: statement.zeroOrNonZero === 'zero' ? ifThenState : ifElseState,
        actions: [new NopAction()]
    });
    ctx.addCommand(ifCommandZero)
    const ifCommandNonZero = new Command({
        state: ifState,
        input: "NZ",
        nextState: statement.zeroOrNonZero === 'zero' ? ifElseState : ifThenState,
        actions: [new NopAction()]
    });
    ctx.addCommand(ifCommandNonZero);

    const thenCommandOutputState = ctx.compileStatements(ifThenState, statement.thenStatements);
   
    const elseCommandOutputState = ctx.compileStatements(ifElseState, statement.elseStataments);

    const finalState = ctx.generateState();

    const finalCommandThen = new Command({
        state: thenCommandOutputState,
        input: "*",
        nextState: finalState,
        actions: [new NopAction()]
    });
    ctx.addCommand(finalCommandThen);
    const finalCommandElse = new Command({
        state: elseCommandOutputState,
        input: "*",
        nextState: finalState,
        actions: [new NopAction()]
    });
    ctx.addCommand(finalCommandElse);
    return finalState;
}

/**
 * 
 * @param {APGCCompiler} ctx 
 * @param {string} inputState 
 * @param {WhileStatement} statement 
 * @returns {string} outputState
 */
function compileWhileStatement(ctx, inputState, statement) {
    const expr = statement.expr;
    const whileState = ctx.compileAPGCExpression(inputState, expr, `${statement.keyword()} only accept function call`);

    const continueState = ctx.generateState();
    const finalState = ctx.generateState();

    const ifCommandZero = new Command({
        state: whileState,
        input: "Z",
        nextState: statement.zeroOrNonZero === "non_zero" ? finalState : continueState,
        actions: [new NopAction()]
    });
    ctx.addCommand(ifCommandZero)
    const ifCommandNonZero = new Command({
        state: whileState,
        input: "NZ",
        nextState: statement.zeroOrNonZero === "non_zero" ? continueState : finalState,
        actions: [new NopAction()]
    });
    ctx.addCommand(ifCommandNonZero);

    const statementsOutputState = ctx.compileStatements(continueState, statement.statements);

    const continueCommand = new Command({
        state: statementsOutputState,
        input: "*",
        nextState: inputState,
        actions: [new NopAction()]
    });
    ctx.addCommand(continueCommand);
    return finalState;
}

/**
 * @param {APGCCompiler} ctx 
 * @param {string} inputState 
 * @param {FunctionCallExpression} expr 
 * @returns {string} outputState
 */
function compileLabel(ctx, inputState, expr) {
    if (expr.args.length !== 1) {
        throw Error(`${LABEL_FUNCTION_NAME} arguments length is not 1`);
    }
    const arg = expr.args[0];
    if (!(arg instanceof StringExpression)) {
        throw Error(`${LABEL_FUNCTION_NAME} arguments accepts only strings`);
    }
    if (arg.string.includes(';')) {
        throw Error(`${LABEL_FUNCTION_NAME} arguments should not contain semicolon: ${LABEL_FUNCTION_NAME}("${arg.string}")`);
    }
    if (arg.string.includes(' ')) {
        throw Error(`${LABEL_FUNCTION_NAME} arguments should not contain whitespace: ${LABEL_FUNCTION_NAME}("${arg.string}")`);
    }
    const labelState = LABEL_PREFIX + arg.string;
    const nextState = ctx.generateState();
    ctx.addCommand(new Command({
        state: inputState,
        input: "*",
        nextState: nextState,
        actions: [new NopAction()]
    }));
    ctx.addCommand(new Command({
        state: labelState,
        input: "*",
        nextState: nextState,
        actions: [new NopAction()]
    }));
    return nextState;
}

/**
 * @param {APGCCompiler} ctx 
 * @param {string} inputState 
 * @param {FunctionCallExpression} expr 
 * @returns {string} unreachable state
 */
function compileGoto(ctx, inputState, expr) {
    if (expr.args.length !== 1) {
        throw Error(`${GOTO_FUNCTION_NAME} arguments length is not 1`);
    }
    const arg = expr.args[0];
    if (!(arg instanceof StringExpression)) {
        throw Error(`${GOTO_FUNCTION_NAME} arguments accepts only strings`);
    }
    const nextState = LABEL_PREFIX + arg.string;
    ctx.addCommand(new Command({
        state: inputState,
        input: "*",
        nextState: nextState,
        actions: [new NopAction()]
    }));
    return UNREACHABLE_PREFIX + ctx.generateState();
}
