class Parser {
    constructor(action){
        this.action = action;
    }
    parse(input) {
        const location2 = {
            index: 0,
            line: 1,
            column: 1
        };
        const context = new Context({
            input,
            location: location2
        });
        const result = this.skip(eof).action(context);
        if (result.type === "ActionOK") {
            return {
                type: "ParseOK",
                value: result.value
            };
        }
        return {
            type: "ParseFail",
            location: result.furthest,
            expected: result.expected
        };
    }
    tryParse(input) {
        const result = this.parse(input);
        if (result.type === "ParseOK") {
            return result.value;
        }
        const { expected , location: location2  } = result;
        const { line , column  } = location2;
        const message = `parse error at line ${line} column ${column}: expected ${expected.join(", ")}`;
        throw new Error(message);
    }
    and(parserB) {
        return new Parser((context)=>{
            const a = this.action(context);
            if (a.type === "ActionFail") {
                return a;
            }
            context = context.moveTo(a.location);
            const b = context.merge(a, parserB.action(context));
            if (b.type === "ActionOK") {
                const value = [
                    a.value,
                    b.value
                ];
                return context.merge(b, context.ok(b.location.index, value));
            }
            return b;
        });
    }
    skip(parserB) {
        return this.and(parserB).map(([a])=>a);
    }
    next(parserB) {
        return this.and(parserB).map(([, b])=>b);
    }
    or(parserB) {
        return new Parser((context)=>{
            const a = this.action(context);
            if (a.type === "ActionOK") {
                return a;
            }
            return context.merge(a, parserB.action(context));
        });
    }
    chain(fn) {
        return new Parser((context)=>{
            const a = this.action(context);
            if (a.type === "ActionFail") {
                return a;
            }
            const parserB = fn(a.value);
            context = context.moveTo(a.location);
            return context.merge(a, parserB.action(context));
        });
    }
    map(fn) {
        return this.chain((a)=>{
            return ok(fn(a));
        });
    }
    thru(fn) {
        return fn(this);
    }
    desc(expected) {
        return new Parser((context)=>{
            const result = this.action(context);
            if (result.type === "ActionOK") {
                return result;
            }
            return {
                type: "ActionFail",
                furthest: result.furthest,
                expected
            };
        });
    }
    wrap(before, after) {
        return before.next(this).skip(after);
    }
    trim(beforeAndAfter) {
        return this.wrap(beforeAndAfter, beforeAndAfter);
    }
    repeat(min = 0, max = Infinity) {
        if (!isRangeValid(min, max)) {
            throw new Error(`repeat: bad range (${min} to ${max})`);
        }
        if (min === 0) {
            return this.repeat(1, max).or(ok([]));
        }
        return new Parser((context)=>{
            const items = [];
            let result = this.action(context);
            if (result.type === "ActionFail") {
                return result;
            }
            while(result.type === "ActionOK" && items.length < max){
                items.push(result.value);
                if (result.location.index === context.location.index) {
                    throw new Error("infinite loop detected; don't call .repeat() with parsers that can accept zero characters");
                }
                context = context.moveTo(result.location);
                result = context.merge(result, this.action(context));
            }
            if (result.type === "ActionFail" && items.length < min) {
                return result;
            }
            return context.merge(result, context.ok(context.location.index, items));
        });
    }
    sepBy(separator, min = 0, max = Infinity) {
        if (!isRangeValid(min, max)) {
            throw new Error(`sepBy: bad range (${min} to ${max})`);
        }
        if (min === 0) {
            return this.sepBy(separator, 1, max).or(ok([]));
        }
        if (max === 1) {
            return this.map((x)=>[
                    x
                ]);
        }
        return this.chain((first)=>{
            return separator.next(this).repeat(min - 1, max - 1).map((rest)=>{
                return [
                    first,
                    ...rest
                ];
            });
        });
    }
    node(name) {
        return all(location, this, location).map(([start, value, end])=>{
            const type = "ParseNode";
            return {
                type,
                name,
                value,
                start,
                end
            };
        });
    }
}
function isRangeValid(min, max) {
    return min <= max && min >= 0 && max >= 0 && Number.isInteger(min) && min !== Infinity && (Number.isInteger(max) || max === Infinity);
}
const location = new Parser((context)=>{
    return context.ok(context.location.index, context.location);
});
function ok(value) {
    return new Parser((context)=>{
        return context.ok(context.location.index, value);
    });
}
function fail(expected) {
    return new Parser((context)=>{
        return context.fail(context.location.index, expected);
    });
}
const eof = new Parser((context)=>{
    if (context.location.index < context.input.length) {
        return context.fail(context.location.index, [
            "<EOF>"
        ]);
    }
    return context.ok(context.location.index, "<EOF>");
});
function text(string) {
    return new Parser((context)=>{
        const start = context.location.index;
        const end = start + string.length;
        if (context.input.slice(start, end) === string) {
            return context.ok(end, string);
        }
        return context.fail(start, [
            string
        ]);
    });
}
function match(regexp) {
    for (const flag of regexp.flags){
        switch(flag){
            case "i":
            case "s":
            case "m":
            case "u":
                continue;
            default:
                throw new Error("only the regexp flags 'imsu' are supported");
        }
    }
    const sticky = new RegExp(regexp.source, regexp.flags + "y");
    return new Parser((context)=>{
        const start = context.location.index;
        sticky.lastIndex = start;
        const match2 = context.input.match(sticky);
        if (match2) {
            const end = start + match2[0].length;
            const string = context.input.slice(start, end);
            return context.ok(end, string);
        }
        return context.fail(start, [
            String(regexp)
        ]);
    });
}
function all(...parsers) {
    return parsers.reduce((acc, p)=>{
        return acc.chain((array)=>{
            return p.map((value)=>{
                return [
                    ...array,
                    value
                ];
            });
        });
    }, ok([]));
}
function choice(...parsers) {
    return parsers.reduce((acc, p)=>{
        return acc.or(p);
    });
}
function lazy(fn) {
    const parser = new Parser((context)=>{
        parser.action = fn().action;
        return parser.action(context);
    });
    return parser;
}
function union(a, b) {
    return [
        ...new Set([
            ...a,
            ...b
        ])
    ];
}
class Context {
    constructor(options){
        this.input = options.input;
        this.location = options.location;
    }
    moveTo(location2) {
        return new Context({
            input: this.input,
            location: location2
        });
    }
    _internal_move(index) {
        if (index === this.location.index) {
            return this.location;
        }
        const start = this.location.index;
        const end = index;
        const chunk = this.input.slice(start, end);
        let { line , column  } = this.location;
        for (const ch of chunk){
            if (ch === "\n") {
                line++;
                column = 1;
            } else {
                column++;
            }
        }
        return {
            index,
            line,
            column
        };
    }
    ok(index, value) {
        return {
            type: "ActionOK",
            value,
            location: this._internal_move(index),
            furthest: {
                index: -1,
                line: -1,
                column: -1
            },
            expected: []
        };
    }
    fail(index, expected) {
        return {
            type: "ActionFail",
            furthest: this._internal_move(index),
            expected
        };
    }
    merge(a, b) {
        if (b.furthest.index > a.furthest.index) {
            return b;
        }
        const expected = b.furthest.index === a.furthest.index ? union(a.expected, b.expected) : a.expected;
        if (b.type === "ActionOK") {
            return {
                type: "ActionOK",
                location: b.location,
                value: b.value,
                furthest: a.furthest,
                expected
            };
        }
        return {
            type: "ActionFail",
            furthest: a.furthest,
            expected
        };
    }
}
const mod = function() {
    return {
        default: null,
        Parser,
        all,
        choice,
        eof,
        fail,
        lazy,
        location,
        match,
        ok,
        text
    };
}();
class Action {
    pretty() {
        return "unimplemented";
    }
    extractUnaryRegisterNumbers() {
        return [];
    }
    extractBinaryRegisterNumbers() {
        return [];
    }
    extractLegacyTRegisterNumbers() {
        return [];
    }
    doesReturnValue() {
        return false;
    }
    isSameComponent(_action) {
        return true;
    }
}
const ADD_A1_STRING = "A1";
const ADD_B0_STRING = "B0";
const ADD_B1_STRING = "B1";
const ADD_STRING = "ADD";
function prettyOp(op) {
    switch(op){
        case 0:
            return ADD_A1_STRING;
        case 1:
            return ADD_B0_STRING;
        case 2:
            return ADD_B1_STRING;
    }
}
function parseOp(op) {
    switch(op){
        case ADD_A1_STRING:
            return 0;
        case ADD_B0_STRING:
            return 1;
        case ADD_B1_STRING:
            return 2;
    }
}
class AddAction extends Action {
    constructor(op){
        super();
        this.op = op;
    }
    pretty() {
        return `${ADD_STRING} ${prettyOp(this.op)}`;
    }
    static parse(str) {
        const array = str.trim().split(/\s+/u);
        if (array.length !== 2) {
            return undefined;
        }
        const [add, reg] = array;
        if (add !== ADD_STRING) {
            return undefined;
        }
        if (reg === ADD_A1_STRING || reg === ADD_B0_STRING || reg === ADD_B1_STRING) {
            return new AddAction(parseOp(reg));
        }
        return undefined;
    }
    doesReturnValue() {
        switch(this.op){
            case 0:
                return false;
            case 1:
                return true;
            case 2:
                return true;
        }
    }
    isSameComponent(action) {
        return action instanceof AddAction;
    }
}
const B2D_INC_STRING = "INC";
const B2D_TDEC_STRING = "TDEC";
const B2D_READ_STRING = "READ";
const B2D_SET_STRING = "SET";
const B2D_B2DX_STRING = "B2DX";
const B2D_B2DY_STRING = "B2DY";
const B2D_B2D_STRING = "B2D";
const B2D_LEGACY_TDEC_STRING = "DEC";
const B2D_LEGACY_B2DX_STRING = "SQX";
const B2D_LEGACY_B2DY_STRING = "SQY";
const B2D_LEGACY_B2D_STRING = "SQ";
function parseOp1(op) {
    switch(op){
        case B2D_INC_STRING:
            return 0;
        case B2D_TDEC_STRING:
            return 1;
        case B2D_READ_STRING:
            return 2;
        case B2D_SET_STRING:
            return 3;
    }
}
function prettyOp1(op) {
    switch(op){
        case 0:
            return B2D_INC_STRING;
        case 1:
            return B2D_TDEC_STRING;
        case 2:
            return B2D_READ_STRING;
        case 3:
            return B2D_SET_STRING;
    }
}
function parseAxis(op) {
    switch(op){
        case B2D_B2DX_STRING:
            return 4;
        case B2D_B2DY_STRING:
            return 5;
        case B2D_B2D_STRING:
            return 6;
    }
}
function prettyAxis(op) {
    switch(op){
        case 4:
            return B2D_B2DX_STRING;
        case 5:
            return B2D_B2DY_STRING;
        case 6:
            return B2D_B2D_STRING;
    }
}
class B2DAction extends Action {
    constructor(op, axis){
        super();
        this.op = op;
        this.axis = axis;
    }
    pretty() {
        return `${prettyOp1(this.op)} ${prettyAxis(this.axis)}`;
    }
    static parse(str) {
        const array = str.trim().split(/\s+/u);
        if (array.length !== 2) {
            return undefined;
        }
        const [op, axis] = array;
        if (op === undefined || axis === undefined) {
            return undefined;
        }
        if (op === B2D_INC_STRING || op === B2D_TDEC_STRING) {
            if (axis === B2D_B2DX_STRING || axis === B2D_B2DY_STRING) {
                return new B2DAction(parseOp1(op), parseAxis(axis));
            }
        } else if (op === B2D_READ_STRING || op === B2D_SET_STRING) {
            if (axis === B2D_B2D_STRING) {
                return new B2DAction(parseOp1(op), parseAxis(axis));
            }
        }
        switch(op){
            case B2D_INC_STRING:
                {
                    switch(axis){
                        case B2D_LEGACY_B2DX_STRING:
                            return new B2DAction(0, 4);
                        case B2D_LEGACY_B2DY_STRING:
                            return new B2DAction(0, 5);
                        default:
                            return undefined;
                    }
                }
            case B2D_LEGACY_TDEC_STRING:
                {
                    switch(axis){
                        case B2D_LEGACY_B2DX_STRING:
                            return new B2DAction(1, 4);
                        case B2D_LEGACY_B2DY_STRING:
                            return new B2DAction(1, 5);
                        default:
                            return undefined;
                    }
                }
            case B2D_READ_STRING:
                {
                    switch(axis){
                        case B2D_LEGACY_B2D_STRING:
                            return new B2DAction(2, 6);
                        default:
                            return undefined;
                    }
                }
            case B2D_SET_STRING:
                {
                    switch(axis){
                        case B2D_LEGACY_B2D_STRING:
                            return new B2DAction(3, 6);
                        default:
                            return undefined;
                    }
                }
        }
        return undefined;
    }
    doesReturnValue() {
        switch(this.op){
            case 0:
                return false;
            case 1:
                return true;
            case 2:
                return true;
            case 3:
                return false;
        }
    }
    isSameComponent(action) {
        if (action instanceof B2DAction) {
            if (this.axis === 4 && action.axis === 5) {
                return false;
            } else if (this.axis === 5 && action.axis === 4) {
                return false;
            }
            return true;
        }
        return false;
    }
}
const B_INC_STRING = "INC";
const B_TDEC_STRING = "TDEC";
const B_READ_STRING = "READ";
const B_SET_STRING = "SET";
const B_STRING = "B";
function prettyOp2(op) {
    switch(op){
        case 0:
            return B_INC_STRING;
        case 1:
            return B_TDEC_STRING;
        case 2:
            return B_READ_STRING;
        case 3:
            return B_SET_STRING;
    }
}
function parseOp2(op) {
    switch(op){
        case B_INC_STRING:
            return 0;
        case B_TDEC_STRING:
            return 1;
        case B_READ_STRING:
            return 2;
        case B_SET_STRING:
            return 3;
    }
}
class BRegAction extends Action {
    constructor(op, regNumber){
        super();
        this.op = op;
        this.regNumber = regNumber;
    }
    extractBinaryRegisterNumbers() {
        return [
            this.regNumber
        ];
    }
    pretty() {
        return `${prettyOp2(this.op)} ${B_STRING}${this.regNumber}`;
    }
    static parse(str) {
        const array = str.trim().split(/\s+/u);
        if (array.length !== 2) {
            return undefined;
        }
        const [op, reg] = array;
        if (op === undefined || reg === undefined) {
            return undefined;
        }
        if (op === B_INC_STRING || op === B_TDEC_STRING || op === B_READ_STRING || op === B_SET_STRING) {
            if (reg.startsWith(B_STRING)) {
                const str1 = reg.slice(1);
                if (/^[0-9]+$/u.test(str1)) {
                    return new BRegAction(parseOp2(op), parseInt(str1, 10));
                }
            }
        }
        return undefined;
    }
    doesReturnValue() {
        switch(this.op){
            case 0:
                return false;
            case 1:
                return true;
            case 2:
                return true;
            case 3:
                return false;
        }
    }
    isSameComponent(action) {
        if (action instanceof BRegAction) {
            return this.regNumber === action.regNumber;
        } else {
            return false;
        }
    }
}
const MUL_0_STRING = "0";
const MUL_1_STRING = "1";
const MUL_STRING = "MUL";
function parseOp3(op) {
    switch(op){
        case MUL_0_STRING:
            return 0;
        case MUL_1_STRING:
            return 1;
    }
}
function prettyOp3(op) {
    switch(op){
        case 0:
            return MUL_0_STRING;
        case 1:
            return MUL_1_STRING;
    }
}
class MulAction extends Action {
    constructor(op){
        super();
        this.op = op;
    }
    pretty() {
        return `${MUL_STRING} ${prettyOp3(this.op)}`;
    }
    static parse(str) {
        const array = str.trim().split(/\s+/u);
        if (array.length !== 2) {
            return undefined;
        }
        const [mul, op] = array;
        if (mul !== MUL_STRING) {
            return undefined;
        }
        if (op === MUL_0_STRING || op === MUL_1_STRING) {
            return new MulAction(parseOp3(op));
        }
        return undefined;
    }
    doesReturnValue() {
        return true;
    }
    isSameComponent(action) {
        return action instanceof MulAction;
    }
}
const OUTPUT_STRING = "OUTPUT";
class OutputAction extends Action {
    constructor(digit){
        super();
        this.digit = digit;
    }
    pretty() {
        return `${OUTPUT_STRING} ${this.digit}`;
    }
    static parse(str) {
        const array = str.trim().split(/\s+/u);
        if (array.length !== 2) {
            return undefined;
        }
        const [output, digit] = array;
        if (output !== OUTPUT_STRING) {
            return undefined;
        }
        if (digit === undefined) {
            return undefined;
        }
        return new OutputAction(digit);
    }
    doesReturnValue() {
        return false;
    }
    isSameComponent(action) {
        return action instanceof OutputAction;
    }
}
const SUB_A1_STRING = "A1";
const SUB_B0_STRING = "B0";
const SUB_B1_STRING = "B1";
const SUB_STRING = "SUB";
function prettyOp4(op) {
    switch(op){
        case 0:
            return SUB_A1_STRING;
        case 1:
            return SUB_B0_STRING;
        case 2:
            return SUB_B1_STRING;
    }
}
function parseOp4(op) {
    switch(op){
        case SUB_A1_STRING:
            return 0;
        case SUB_B0_STRING:
            return 1;
        case SUB_B1_STRING:
            return 2;
    }
}
class SubAction extends Action {
    constructor(op){
        super();
        this.op = op;
    }
    pretty() {
        return `${SUB_STRING} ${prettyOp4(this.op)}`;
    }
    static parse(str) {
        const array = str.trim().split(/\s+/u);
        if (array.length !== 2) {
            return undefined;
        }
        const [sub, reg] = array;
        if (sub !== SUB_STRING) {
            return undefined;
        }
        if (reg === SUB_A1_STRING || reg === SUB_B0_STRING || reg === SUB_B1_STRING) {
            return new SubAction(parseOp4(reg));
        }
        return undefined;
    }
    doesReturnValue() {
        switch(this.op){
            case 0:
                return false;
            case 1:
                return true;
            case 2:
                return true;
        }
    }
    isSameComponent(action) {
        return action instanceof SubAction;
    }
}
const U_INC_STRING = "INC";
const U_TDEC_STRING = "TDEC";
const U_STRING = "U";
const R_STRING = "R";
function prettyOp5(op) {
    switch(op){
        case 0:
            return U_INC_STRING;
        case 1:
            return U_TDEC_STRING;
    }
}
function parseOp5(op) {
    switch(op){
        case U_INC_STRING:
            return 0;
        case U_TDEC_STRING:
            return 1;
    }
}
class URegAction extends Action {
    constructor(op, regNumber){
        super();
        this.op = op;
        this.regNumber = regNumber;
    }
    extractUnaryRegisterNumbers() {
        return [
            this.regNumber
        ];
    }
    pretty() {
        return `${prettyOp5(this.op)} ${U_STRING}${this.regNumber}`;
    }
    static parse(str) {
        const array = str.trim().split(/\s+/u);
        if (array.length !== 2) {
            return undefined;
        }
        const [op, reg] = array;
        if (op === undefined || reg === undefined) {
            return undefined;
        }
        if (op === U_INC_STRING || op === U_TDEC_STRING) {
            if (reg.startsWith(U_STRING) || reg.startsWith(R_STRING)) {
                const str1 = reg.slice(1);
                if (/^[0-9]+$/u.test(str1)) {
                    return new URegAction(parseOp5(op), parseInt(str1, 10));
                }
            }
        }
        return undefined;
    }
    doesReturnValue() {
        switch(this.op){
            case 0:
                return false;
            case 1:
                return true;
        }
    }
    isSameComponent(action) {
        if (action instanceof URegAction) {
            return this.regNumber === action.regNumber;
        } else {
            return false;
        }
    }
}
const T_INC_STRING = "INC";
const T_DEC_STRING = "DEC";
const T_READ_STRING = "READ";
const T_SET_STRING = "SET";
const T_RESET_STRING = "RESET";
function prettyOp6(op) {
    switch(op){
        case 0:
            return T_INC_STRING;
        case 1:
            return T_DEC_STRING;
        case 2:
            return T_READ_STRING;
        case 3:
            return T_SET_STRING;
        case 4:
            return T_RESET_STRING;
    }
}
function parseOp6(op) {
    switch(op){
        case T_INC_STRING:
            return 0;
        case T_DEC_STRING:
            return 1;
        case T_READ_STRING:
            return 2;
        case T_SET_STRING:
            return 3;
        case T_RESET_STRING:
            return 4;
    }
}
class LegacyTRegAction extends Action {
    constructor(op, regNumber){
        super();
        this.op = op;
        this.regNumber = regNumber;
    }
    extractLegacyTRegisterNumbers() {
        return [
            this.regNumber
        ];
    }
    pretty() {
        return `${prettyOp6(this.op)} T${this.regNumber}`;
    }
    static parse(str) {
        const array = str.trim().split(/\s+/u);
        if (array.length !== 2) {
            return undefined;
        }
        const [op, reg] = array;
        if (op === undefined || reg === undefined) {
            return undefined;
        }
        if (op === T_INC_STRING || op === T_DEC_STRING || op === T_READ_STRING || op === T_SET_STRING || op === T_RESET_STRING) {
            if (reg.startsWith("T")) {
                const str1 = reg.slice(1);
                if (/^[0-9]+$/u.test(str1)) {
                    return new LegacyTRegAction(parseOp6(op), parseInt(str1, 10));
                }
            }
        }
        return undefined;
    }
    doesReturnValue() {
        switch(this.op){
            case 0:
                return true;
            case 1:
                return true;
            case 2:
                return true;
            case 3:
                return false;
            case 4:
                return false;
        }
    }
    isSameComponent(action) {
        if (action instanceof LegacyTRegAction) {
            return this.regNumber === action.regNumber;
        } else {
            return false;
        }
    }
}
typeof BigInt !== 'undefined';
const HALT_OUT_STRING = `HALT_OUT`;
class HaltOutAction extends Action {
    constructor(){
        super();
    }
    pretty() {
        return HALT_OUT_STRING;
    }
    static parse(str) {
        const array = str.trim().split(/\s+/u);
        if (array.length !== 1) {
            return undefined;
        }
        const [haltOut] = array;
        if (haltOut !== HALT_OUT_STRING) {
            return undefined;
        }
        return new HaltOutAction();
    }
    doesReturnValue() {
        return false;
    }
    isSameComponent(action) {
        return action instanceof HaltOutAction;
    }
}
function validateActionReturnOnceCommand(command) {
    if (command.actions.some((x)=>x instanceof HaltOutAction)) {
        return undefined;
    }
    const valueReturnActions = command.actions.filter((x)=>x.doesReturnValue());
    if (valueReturnActions.length === 1) {
        return undefined;
    } else if (valueReturnActions.length === 0) {
        return `Does not produce the return value in "${command.pretty()}"`;
    } else {
        return `Does not contain exactly one action that produces a return value in "${command.pretty()}": Actions that produce value are ${valueReturnActions.map((x)=>`"${x.pretty()}"`).join(', ')}`;
    }
}
function validateActionReturnOnce(commands) {
    const errors = [];
    for (const command of commands){
        const err = validateActionReturnOnceCommand(command);
        if (typeof err === 'string') {
            errors.push(err);
        }
    }
    if (errors.length > 0) {
        return errors;
    }
    return undefined;
}
class NopAction extends Action {
    constructor(){
        super();
    }
    pretty() {
        return `NOP`;
    }
    static parse(str) {
        const array = str.trim().split(/\s+/u);
        if (array.length !== 1) {
            return undefined;
        }
        const [nop] = array;
        if (nop !== "NOP") {
            return undefined;
        }
        return new NopAction();
    }
    doesReturnValue() {
        return true;
    }
    isSameComponent(action) {
        return action instanceof NopAction;
    }
}
function parseAction(str) {
    const parsers = [
        BRegAction.parse,
        URegAction.parse,
        B2DAction.parse,
        NopAction.parse,
        AddAction.parse,
        MulAction.parse,
        SubAction.parse,
        OutputAction.parse,
        HaltOutAction.parse,
        LegacyTRegAction.parse, 
    ];
    for (const parser of parsers){
        const result = parser(str);
        if (result !== undefined) {
            return result;
        }
    }
    return undefined;
}
const INITIAL_STATE = "INITIAL";
class ProgramLine {
    pretty() {
        return `unimplemented`;
    }
}
class ComponentsHeader extends ProgramLine {
    constructor(content){
        super();
        this.content = content;
    }
    static get key() {
        return "#COMPONENTS";
    }
    pretty() {
        return ComponentsHeader.key + " " + this.content;
    }
}
class RegistersHeader extends ProgramLine {
    constructor(content){
        super();
        this.content = content;
    }
    static get key() {
        return "#REGISTERS";
    }
    pretty() {
        return RegistersHeader.key + " " + this.content;
    }
}
class Comment extends ProgramLine {
    constructor(str){
        super();
        this.str = str;
    }
    getString() {
        return this.str;
    }
    pretty() {
        return this.getString();
    }
}
class EmptyLine extends ProgramLine {
    constructor(){
        super();
    }
    pretty() {
        return "";
    }
}
function parseInput(inputStr) {
    switch(inputStr){
        case "Z":
            return inputStr;
        case "NZ":
            return inputStr;
        case "ZZ":
            return inputStr;
        case "*":
            return inputStr;
        default:
            return undefined;
    }
}
class Command extends ProgramLine {
    constructor({ state , input , nextState , actions  }){
        super();
        this.state = state;
        this.input = input;
        this.nextState = nextState;
        this.actions = actions;
        this._string = `${this.state}; ${this.input}; ${this.nextState}; ${this.actions.map((a)=>a.pretty()).join(", ")}`;
    }
    static parse(str) {
        if (typeof str !== 'string') {
            throw TypeError('str is not a string');
        }
        const trimmedStr = str.trim();
        if (trimmedStr === "") {
            return new EmptyLine();
        }
        if (trimmedStr.startsWith("#")) {
            if (trimmedStr.startsWith(ComponentsHeader.key)) {
                return new ComponentsHeader(trimmedStr.slice(ComponentsHeader.key.length).trim());
            } else if (trimmedStr.startsWith(RegistersHeader.key)) {
                return new RegistersHeader(trimmedStr.slice(RegistersHeader.key.length).trim());
            }
            return new Comment(str);
        }
        const array = trimmedStr.split(/\s*;\s*/u);
        if (array.length < 4) {
            return `Invalid line "${str}"`;
        }
        if (array.length > 4) {
            if (array[4] === "") {
                return `Extraneous semicolon "${str}"`;
            }
            return `Invalid line "${str}"`;
        }
        const state = array[0] ?? this.error();
        const inputStr = array[1] ?? this.error();
        const nextState = array[2] ?? this.error();
        const actionsStr = array[3] ?? this.error();
        const actionStrs = actionsStr.trim().split(/\s*,\s*/u).filter((x)=>x !== "");
        const actions = [];
        for (const actionsStr1 of actionStrs){
            const result = parseAction(actionsStr1);
            if (result === undefined) {
                return `Unknown action "${actionsStr1}" at "${str}"`;
            }
            actions.push(result);
        }
        const input = parseInput(inputStr);
        if (input === undefined) {
            return `Unknown input "${inputStr}" at "${str}". Expect "Z", "NZ", "ZZ", or "*"`;
        }
        return new Command({
            state: state,
            input: input,
            nextState: nextState,
            actions: actions
        });
    }
    static error() {
        throw Error('internal error');
    }
    pretty() {
        return this._string;
    }
}
function validateNextStateIsNotINITIALCommand(command) {
    if (command.nextState === INITIAL_STATE) {
        return `Return to initial state in "${command.pretty()}"`;
    }
    return undefined;
}
function validateNextStateIsNotINITIAL(commands) {
    const errors = [];
    for (const command of commands){
        const err = validateNextStateIsNotINITIALCommand(command);
        if (typeof err === 'string') {
            errors.push(err);
        }
    }
    if (errors.length > 0) {
        return errors;
    }
    return undefined;
}
function validateNoDuplicatedActionCommand(command) {
    if (command.actions.length <= 1) {
        return undefined;
    }
    const actionStrs = command.actions.map((x)=>x.pretty());
    actionStrs.sort();
    for(let i = 0; i < actionStrs.length - 1; i++){
        const act1 = actionStrs[i];
        const act2 = actionStrs[i + 1];
        if (act1 === act2) {
            return `Duplicated actions "${act1}" in "${command.pretty()}"`;
        }
    }
    return undefined;
}
function validateNoDuplicatedAction(commands) {
    const errors = [];
    for (const command of commands){
        const err = validateNoDuplicatedActionCommand(command);
        if (typeof err === 'string') {
            errors.push(err);
        }
    }
    if (errors.length > 0) {
        return errors;
    }
    return undefined;
}
function internalError() {
    throw Error('internal error');
}
function validateNoSameComponentCommand(command) {
    if (command.actions.find((x)=>x instanceof HaltOutAction) !== undefined) {
        return undefined;
    }
    const actions = command.actions;
    const len = actions.length;
    if (len <= 1) {
        return undefined;
    }
    for(let i = 0; i < len; i++){
        for(let j = i + 1; j < len; j++){
            const a = actions[i] ?? internalError();
            const b = actions[j] ?? internalError();
            if (a.isSameComponent(b)) {
                return `Actions "${a.pretty()}" and "${b.pretty()}" use same component in "${command.pretty()}"`;
            }
        }
    }
    return undefined;
}
function validateNoSameComponent(commands) {
    const errors = [];
    for (const command of commands){
        const err = validateNoSameComponentCommand(command);
        if (typeof err === 'string') {
            errors.push(err);
        }
    }
    if (errors.length > 0) {
        return errors;
    }
    return undefined;
}
function internalError1() {
    throw Error('internal error');
}
function validateZAndNZ(commands) {
    const errMsg = (line)=>`Need Z line followed by NZ line at "${line.pretty()}"`;
    for(let i = 0; i < commands.length - 1; i++){
        const a = commands[i] ?? internalError1();
        const b = commands[i + 1] ?? internalError1();
        if (a.input === "Z" && b.input !== 'NZ') {
            return [
                errMsg(a)
            ];
        }
        if (b.input === "NZ" && a.input !== 'Z') {
            return [
                errMsg(b)
            ];
        }
        if (a.input === "Z" && b.input === "NZ" && a.state !== b.state) {
            return [
                errMsg(a)
            ];
        }
    }
    const lastLine = commands[commands.length - 1];
    if (lastLine !== undefined) {
        if (lastLine.input === 'Z') {
            return [
                errMsg(lastLine)
            ];
        }
    }
    return undefined;
}
class ProgramLines {
    constructor(array){
        this.array = array;
    }
    getArray() {
        return this.array;
    }
    pretty() {
        return this.getArray().map((line)=>line.pretty()).join('\n');
    }
    static parse(str) {
        const lines = str.split(/\r\n|\n|\r/u);
        const programLineWithErrorArray = lines.map((line)=>Command.parse(line));
        const errors = programLineWithErrorArray.flatMap((x)=>typeof x === 'string' ? [
                x
            ] : []);
        if (errors.length > 0) {
            return errors.join('\n');
        }
        const programLines = programLineWithErrorArray.flatMap((x)=>typeof x !== 'string' ? [
                x
            ] : []);
        return new ProgramLines(programLines);
    }
}
function validateAll(commands) {
    const validators = [
        validateNoDuplicatedAction,
        validateActionReturnOnce,
        validateNoSameComponent,
        validateNextStateIsNotINITIAL,
        validateZAndNZ
    ];
    let errors = [];
    for (const validator of validators){
        const errorsOrUndefined = validator(commands);
        if (Array.isArray(errorsOrUndefined)) {
            errors = errors.concat(errorsOrUndefined);
        }
    }
    if (errors.length > 0) {
        return errors.join('\n');
    }
    return undefined;
}
class Program {
    constructor({ programLines ,  }){
        this.commands = programLines.getArray().flatMap((x)=>{
            if (x instanceof Command) {
                return [
                    x
                ];
            } else {
                return [];
            }
        });
        this.componentsHeader = undefined;
        for (const x of programLines.getArray()){
            if (x instanceof ComponentsHeader) {
                if (this.componentsHeader !== undefined) {
                    throw Error(`Multiple ${ComponentsHeader.key}`);
                }
                this.componentsHeader = x;
            }
        }
        this.registersHeader = undefined;
        for (const x1 of programLines.getArray()){
            if (x1 instanceof RegistersHeader) {
                if (this.registersHeader !== undefined) {
                    throw new Error(`Multiple ${RegistersHeader.key}`);
                }
                this.registersHeader = x1;
            }
        }
        this.programLines = programLines;
    }
    static parse(str) {
        const programLines = ProgramLines.parse(str);
        if (typeof programLines === 'string') {
            return programLines;
        }
        const commands = [];
        for (const programLine of programLines.getArray()){
            if (programLine instanceof Command) {
                commands.push(programLine);
            }
        }
        if (commands.length === 0) {
            return 'Program is empty';
        }
        const errorOrUndefined = validateAll(commands);
        if (typeof errorOrUndefined === 'string') {
            return errorOrUndefined;
        }
        try {
            return new Program({
                programLines: programLines
            });
        } catch (error) {
            return error.message;
        }
    }
    _actions() {
        return this.commands.flatMap((command)=>command.actions);
    }
    extractUnaryRegisterNumbers() {
        return sortNub(this._actions().flatMap((a)=>a.extractUnaryRegisterNumbers()));
    }
    extractBinaryRegisterNumbers() {
        return sortNub(this._actions().flatMap((a)=>a.extractBinaryRegisterNumbers()));
    }
    extractLegacyTRegisterNumbers() {
        return sortNub(this._actions().flatMap((a)=>a.extractLegacyTRegisterNumbers()));
    }
    pretty() {
        return this.programLines.pretty();
    }
}
function sortNub(array) {
    return [
        ...new Set(array)
    ].sort((a, b)=>a - b);
}
const decimalNaturalParser = mod.match(/[0-9]+/).desc([
    "number"
]).map((x)=>parseInt(x, 10));
const hexadecimalNaturalParser = mod.match(/0x[a-fA-F0-9]+/).desc([
    "hexadecimal number", 
]).map((x)=>parseInt(x, 16));
const naturalNumberParser = hexadecimalNaturalParser.or(decimalNaturalParser).desc([
    "number"
]);
class APGMExpr {
    constructor(){}
}
class ErrorWithLocation extends Error {
    constructor(message, apgmLocation, options){
        super(message, options);
        this.apgmLocation = apgmLocation;
    }
    apgmLocation;
}
function formatLocationAt(location) {
    if (location !== undefined) {
        return ` at line ${location.line} column ${location.column}`;
    } else {
        return "";
    }
}
class IfAPGMExpr extends APGMExpr {
    constructor(modifier, cond, thenBody, elseBody){
        super();
        this.modifier = modifier;
        this.cond = cond;
        this.thenBody = thenBody;
        this.elseBody = elseBody;
    }
    transform(f) {
        return f(new IfAPGMExpr(this.modifier, this.cond.transform(f), this.thenBody.transform(f), this.elseBody !== undefined ? this.elseBody.transform(f) : undefined));
    }
    pretty() {
        const keyword = `if_${this.modifier === "Z" ? "z" : "nz"}`;
        const cond = this.cond.pretty();
        const el = this.elseBody === undefined ? `` : ` else ${this.elseBody.pretty()}`;
        return `${keyword} (${cond}) ${this.thenBody.pretty()}` + el;
    }
    modifier;
    cond;
    thenBody;
    elseBody;
}
class LoopAPGMExpr extends APGMExpr {
    constructor(body){
        super();
        this.body = body;
    }
    transform(f) {
        return f(new LoopAPGMExpr(this.body.transform(f)));
    }
    pretty() {
        return `loop ${this.body.pretty()}`;
    }
    body;
}
class FuncAPGMExpr extends APGMExpr {
    constructor(name, args, location){
        super();
        this.name = name;
        this.args = args;
        this.location = location;
    }
    transform(f) {
        return f(new FuncAPGMExpr(this.name, this.args.map((x)=>x.transform(f)), this.location));
    }
    pretty() {
        return `${this.name}(${this.args.map((x)=>x.pretty()).join(", ")})`;
    }
    name;
    args;
    location;
}
class Macro {
    constructor(name, args, body, location){
        this.name = name;
        this.args = args;
        this.body = body;
        this.location = location;
    }
    pretty() {
        return `macro ${this.name}(${this.args.map((x)=>x.pretty()).join(", ")}) ${this.body.pretty()}`;
    }
    name;
    args;
    body;
    location;
}
class Main {
    constructor(macros, headers, seqExpr){
        this.macros = macros;
        this.headers = headers;
        this.seqExpr = seqExpr;
    }
    pretty() {
        return this.macros.map((m)=>m.pretty()).join("\n") + "\n" + this.headers.map((h)=>h.toString()).join("\n") + "\n" + this.seqExpr.prettyInner();
    }
    macros;
    headers;
    seqExpr;
}
class Header {
    constructor(name, content){
        this.name = name;
        this.content = content;
    }
    toString() {
        const space = this.content.startsWith(" ") ? "" : " ";
        return `#${this.name}${space}${this.content}`;
    }
    name;
    content;
}
class NumberAPGMExpr extends APGMExpr {
    constructor(value, location){
        super();
        this.value = value;
        this.location = location;
    }
    transform(f) {
        return f(this);
    }
    pretty() {
        return this.value.toString();
    }
    value;
    location;
}
class StringAPGMExpr extends APGMExpr {
    constructor(value, location){
        super();
        this.value = value;
        this.location = location;
    }
    transform(f) {
        return f(this);
    }
    pretty() {
        return `"` + this.value + `"`;
    }
    value;
    location;
}
class VarAPGMExpr extends APGMExpr {
    constructor(name, location){
        super();
        this.name = name;
        this.location = location;
    }
    transform(f) {
        return f(this);
    }
    pretty() {
        return this.name;
    }
    name;
    location;
}
class WhileAPGMExpr extends APGMExpr {
    constructor(modifier, cond, body){
        super();
        this.modifier = modifier;
        this.cond = cond;
        this.body = body;
    }
    transform(f) {
        return f(new WhileAPGMExpr(this.modifier, this.cond.transform(f), this.body.transform(f)));
    }
    pretty() {
        return `while_${this.modifier === "Z" ? "z" : "nz"}(${this.cond.pretty()}) ${this.body.pretty()}`;
    }
    modifier;
    cond;
    body;
}
class SeqAPGMExpr extends APGMExpr {
    constructor(exprs){
        super();
        this.exprs = exprs;
    }
    transform(f) {
        return f(new SeqAPGMExpr(this.exprs.map((x)=>x.transform(f))));
    }
    pretty() {
        return `{${this.prettyInner()}}`;
    }
    prettyInner() {
        return this.exprs.map((x)=>{
            if (x instanceof IfAPGMExpr) {
                return x.pretty();
            } else if (x instanceof LoopAPGMExpr) {
                return x.pretty();
            } else if (x instanceof WhileAPGMExpr) {
                return x.pretty();
            } else {
                return x.pretty() + ";";
            }
        }).join("\n");
    }
    exprs;
}
function prettyError(fail, source) {
    const lines = source.split(/\n|\r\n/);
    const above = lines[fail.location.line - 2];
    const errorLine = lines[fail.location.line - 1];
    const below = lines[fail.location.line];
    const arrowLine = " ".repeat(Math.max(0, fail.location.column - 1)) + "^";
    const aboveLines = [
        ...above === undefined ? [] : [
            above
        ],
        errorLine, 
    ];
    const belowLines = [
        ...below === undefined ? [] : [
            below
        ], 
    ];
    const prefix = "| ";
    const errorLines = [
        ...aboveLines.map((x)=>prefix + x),
        " ".repeat(prefix.length) + arrowLine,
        ...belowLines.map((x)=>prefix + x), 
    ];
    return [
        `parse error at line ${fail.location.line} column ${fail.location.column}:`,
        `  expected ${fail.expected.join(", ")}`,
        ``,
        ...errorLines, 
    ].join("\n");
}
function parsePretty(parser, source) {
    const res = parser.parse(source);
    if (res.type === "ParseOK") {
        return res.value;
    }
    throw new ErrorWithLocation(prettyError(res, source), res.location);
}
const comment = mod.match(/\/\*(\*(?!\/)|[^*])*\*\//s).desc([]);
const _ = mod.match(/\s*/).desc([
    "space"
]).sepBy(comment).map(()=>undefined);
const someSpaces = mod.match(/\s+/).desc([
    "space"
]);
const identifierRexExp = /[a-zA-Z_][a-zA-Z_0-9]*/u;
const identifierOnly = mod.match(identifierRexExp).desc([
    "identifier"
]);
const identifier = _.next(identifierOnly).skip(_);
const identifierWithLocation = _.chain(()=>{
    return mod.location.chain((loc)=>{
        return identifierOnly.skip(_).map((ident)=>{
            return [
                ident,
                loc
            ];
        });
    });
});
const macroIdentifierRegExp = /[a-zA-Z_][a-zA-Z_0-9]*!/u;
const macroIdentifier = _.next(mod.match(macroIdentifierRegExp)).skip(_).desc([
    "macro name"
]);
function token(s) {
    return _.next(mod.text(s)).skip(_);
}
const comma = token(",").desc([
    "`,`"
]);
const leftParen = token("(").desc([
    "`(`"
]);
const rightParen = token(")").desc([
    "`)`"
]);
const semicolon = token(";").desc([
    "`;`"
]);
const curlyLeft = token("{").desc([
    "`{`"
]);
const curlyRight = token("}").desc([
    "`}`"
]);
const varAPGMExpr = identifierWithLocation.map(([ident, loc])=>new VarAPGMExpr(ident, loc));
function argExprs(arg) {
    return mod.lazy(()=>arg()).sepBy(comma).wrap(leftParen, rightParen);
}
function funcAPGMExpr() {
    return _.next(mod.location).chain((location)=>{
        return mod.choice(macroIdentifier, identifier).chain((ident)=>{
            return argExprs(()=>apgmExpr()).map((args)=>{
                return new FuncAPGMExpr(ident, args, location);
            });
        });
    });
}
const numberAPGMExpr = _.next(mod.location.chain((loc)=>{
    return naturalNumberParser.map((x)=>new NumberAPGMExpr(x, loc));
})).skip(_);
const stringLit = _.next(mod.text(`"`)).next(mod.match(/[^"]*/)).skip(mod.text(`"`)).skip(_).desc([
    "string"
]);
const stringAPGMExpr = stringLit.map((x)=>new StringAPGMExpr(x));
function seqAPGMExprRaw() {
    return mod.lazy(()=>statement()).repeat();
}
function seqAPGMExpr() {
    return seqAPGMExprRaw().wrap(curlyLeft, curlyRight).map((x)=>new SeqAPGMExpr(x));
}
const whileKeyword = mod.choice(token("while_z"), token("while_nz")).map((x)=>x === "while_z" ? "Z" : "NZ");
const exprWithParen = mod.lazy(()=>apgmExpr()).wrap(leftParen, rightParen);
function whileAPGMExpr() {
    return whileKeyword.chain((mod1)=>{
        return exprWithParen.chain((cond)=>{
            return mod.lazy(()=>apgmExpr()).map((body)=>new WhileAPGMExpr(mod1, cond, body));
        });
    });
}
function loopAPGMExpr() {
    return token("loop").next(mod.lazy(()=>apgmExpr())).map((x)=>new LoopAPGMExpr(x));
}
const ifKeyword = mod.choice(token("if_z"), token("if_nz")).map((x)=>x === "if_z" ? "Z" : "NZ");
function ifAPGMExpr() {
    return ifKeyword.chain((mod1)=>{
        return exprWithParen.chain((cond)=>{
            return mod.lazy(()=>apgmExpr()).chain((body)=>{
                return mod.choice(token("else").next(mod.lazy(()=>apgmExpr())), mod.ok(undefined)).map((elseBody)=>{
                    return new IfAPGMExpr(mod1, cond, body, elseBody);
                });
            });
        });
    });
}
function macroHead() {
    const macroKeyword = _.chain((_)=>{
        return mod.location.chain((location)=>{
            return mod.text("macro").next(someSpaces).map((_)=>location);
        });
    });
    return macroKeyword.and(macroIdentifier).chain(([location, ident])=>{
        return argExprs(()=>varAPGMExpr).map((args)=>{
            return {
                loc: location,
                name: ident,
                args: args
            };
        });
    });
}
function macro() {
    return macroHead().chain(({ loc , name , args  })=>{
        return mod.lazy(()=>apgmExpr()).map((body)=>{
            return new Macro(name, args, body, loc);
        });
    });
}
const anythingLine = mod.match(/.*/);
const header = mod.text("#").next(mod.match(/REGISTERS|COMPONENTS/)).desc([
    "#REGISTERS",
    "#COMPONENTS"
]).chain((x)=>anythingLine.map((c)=>new Header(x, c)));
const headers = _.next(header).skip(_).repeat();
function main() {
    return macro().repeat().chain((macros)=>{
        return headers.chain((h)=>{
            return _.next(seqAPGMExprRaw()).skip(_).map((x)=>{
                return new Main(macros, h, new SeqAPGMExpr(x));
            });
        });
    });
}
function parseMain(str) {
    return parsePretty(main(), str);
}
function apgmExpr() {
    return mod.choice(loopAPGMExpr(), whileAPGMExpr(), ifAPGMExpr(), funcAPGMExpr(), seqAPGMExpr(), varAPGMExpr, numberAPGMExpr, stringAPGMExpr);
}
function statement() {
    return mod.choice(loopAPGMExpr(), whileAPGMExpr(), ifAPGMExpr(), apgmExpr().skip(semicolon));
}
class APGLExpr {
    constructor(){}
}
class ActionAPGLExpr extends APGLExpr {
    constructor(actions){
        super();
        this.actions = actions;
    }
    transform(f) {
        return f(this);
    }
    actions;
}
class SeqAPGLExpr extends APGLExpr {
    constructor(exprs){
        super();
        this.exprs = exprs;
    }
    transform(f) {
        return f(new SeqAPGLExpr(this.exprs.map((x)=>x.transform(f))));
    }
    exprs;
}
function isEmptyExpr(expr) {
    return expr instanceof SeqAPGLExpr && expr.exprs.every((e)=>isEmptyExpr(e));
}
class IfAPGLExpr extends APGLExpr {
    constructor(cond, thenBody, elseBody){
        super();
        this.cond = cond;
        this.thenBody = thenBody;
        this.elseBody = elseBody;
    }
    transform(f) {
        return f(new IfAPGLExpr(this.cond.transform(f), this.thenBody.transform(f), this.elseBody.transform(f)));
    }
    cond;
    thenBody;
    elseBody;
}
class LoopAPGLExpr extends APGLExpr {
    kind;
    constructor(body){
        super();
        this.body = body;
        this.kind = "loop";
    }
    transform(f) {
        return f(new LoopAPGLExpr(this.body.transform(f)));
    }
    body;
}
class WhileAPGLExpr extends APGLExpr {
    constructor(modifier, cond, body){
        super();
        this.modifier = modifier;
        this.cond = cond;
        this.body = body;
    }
    transform(f) {
        return f(new WhileAPGLExpr(this.modifier, this.cond.transform(f), this.body.transform(f)));
    }
    modifier;
    cond;
    body;
}
class BreakAPGLExpr extends APGLExpr {
    kind;
    constructor(level){
        super();
        this.level = level;
        this.kind = "break";
    }
    transform(f) {
        return f(this);
    }
    level;
}
class A {
    static incU(n) {
        return A.nonReturn(`INC U${n}`);
    }
    static incUMulti(...args) {
        return new ActionAPGLExpr([
            ...args.map((x)=>`INC U${x}`),
            "NOP"
        ]);
    }
    static tdecU(n) {
        return A.single(`TDEC U${n}`);
    }
    static addA1() {
        return A.nonReturn(`ADD A1`);
    }
    static addB0() {
        return A.single("ADD B0");
    }
    static addB1() {
        return A.single("ADD B1");
    }
    static incB2DX() {
        return A.nonReturn("INC B2DX");
    }
    static tdecB2DX() {
        return A.single("TDEC B2DX");
    }
    static incB2DY() {
        return A.nonReturn("INC B2DY");
    }
    static tdecB2DY() {
        return A.single("TDEC B2DY");
    }
    static readB2D() {
        return A.single("READ B2D");
    }
    static setB2D() {
        return A.nonReturn("SET B2D");
    }
    static incB(n) {
        return A.nonReturn(`INC B${n}`);
    }
    static tdecB(n) {
        return A.single(`TDEC B${n}`);
    }
    static readB(n) {
        return A.single(`READ B${n}`);
    }
    static setB(n) {
        return A.nonReturn(`SET B${n}`);
    }
    static haltOUT() {
        return A.single("HALT_OUT");
    }
    static mul0() {
        return A.single("MUL 0");
    }
    static mul1() {
        return A.single("MUL 1");
    }
    static nop() {
        return A.single("NOP");
    }
    static output(c) {
        return A.nonReturn(`OUTPUT ${c}`);
    }
    static subA1() {
        return A.nonReturn(`SUB A1`);
    }
    static subB0() {
        return A.single(`SUB B0`);
    }
    static subB1() {
        return A.single(`SUB B1`);
    }
    static nonReturn(act) {
        return new ActionAPGLExpr([
            act,
            "NOP"
        ]);
    }
    static single(act) {
        return new ActionAPGLExpr([
            act
        ]);
    }
}
function transpileEmptyArgFunc(funcExpr, expr) {
    if (funcExpr.args.length !== 0) {
        throw new ErrorWithLocation(`argument given to "${funcExpr.name}"${formatLocationAt(funcExpr.location)}`, funcExpr.location);
    }
    return expr;
}
function transpileNumArgFunc(funcExpr, expr) {
    if (funcExpr.args.length !== 1) {
        throw new ErrorWithLocation(`number of arguments is not 1: "${funcExpr.name}"${formatLocationAt(funcExpr.location)}`, funcExpr.location);
    }
    const arg = funcExpr.args[0];
    if (!(arg instanceof NumberAPGMExpr)) {
        throw new ErrorWithLocation(`argument is not a number: "${funcExpr.name}"${formatLocationAt(funcExpr.location)}`, funcExpr.location);
    }
    return expr(arg.value);
}
function transpileStringArgFunc(funcExpr, expr) {
    if (funcExpr.args.length !== 1) {
        throw new ErrorWithLocation(`number of arguments is not 1: "${funcExpr.name}"${formatLocationAt(funcExpr.location)}`, funcExpr.location);
    }
    const arg = funcExpr.args[0];
    if (!(arg instanceof StringAPGMExpr)) {
        throw new ErrorWithLocation(`argument is not a string: "${funcExpr.name}"${formatLocationAt(funcExpr.location)}`, funcExpr.location);
    }
    return expr(arg.value);
}
const emptyArgFuncs = new Map([
    [
        "nop",
        A.nop()
    ],
    [
        "inc_b2dx",
        A.incB2DX()
    ],
    [
        "inc_b2dy",
        A.incB2DY()
    ],
    [
        "tdec_b2dx",
        A.tdecB2DX()
    ],
    [
        "tdec_b2dy",
        A.tdecB2DY()
    ],
    [
        "read_b2d",
        A.readB2D()
    ],
    [
        "set_b2d",
        A.setB2D()
    ],
    [
        "add_a1",
        A.addA1()
    ],
    [
        "add_b0",
        A.addB0()
    ],
    [
        "add_b1",
        A.addB1()
    ],
    [
        "sub_a1",
        A.subA1()
    ],
    [
        "sub_b0",
        A.subB0()
    ],
    [
        "sub_b1",
        A.subB1()
    ],
    [
        "mul_0",
        A.mul0()
    ],
    [
        "mul_1",
        A.mul1()
    ],
    [
        "halt_out",
        A.haltOUT()
    ], 
]);
const numArgFuncs = new Map([
    [
        "inc_u",
        A.incU
    ],
    [
        "tdec_u",
        A.tdecU
    ],
    [
        "inc_b",
        A.incB
    ],
    [
        "tdec_b",
        A.tdecB
    ],
    [
        "read_b",
        A.readB
    ],
    [
        "set_b",
        A.setB
    ], 
]);
const strArgFuncs = new Map([
    [
        "output",
        A.output
    ], 
]);
function transpileFuncAPGMExpr(funcExpr) {
    const emptyOrUndefined = emptyArgFuncs.get(funcExpr.name);
    if (emptyOrUndefined !== undefined) {
        return transpileEmptyArgFunc(funcExpr, emptyOrUndefined);
    }
    const numArgOrUndefined = numArgFuncs.get(funcExpr.name);
    if (numArgOrUndefined !== undefined) {
        return transpileNumArgFunc(funcExpr, numArgOrUndefined);
    }
    const strArgOrUndefined = strArgFuncs.get(funcExpr.name);
    if (strArgOrUndefined !== undefined) {
        return transpileStringArgFunc(funcExpr, strArgOrUndefined);
    }
    switch(funcExpr.name){
        case "break":
            {
                if (funcExpr.args.length === 0) {
                    return new BreakAPGLExpr(undefined);
                } else {
                    return transpileNumArgFunc(funcExpr, (x)=>new BreakAPGLExpr(x));
                }
            }
        case "repeat":
            {
                if (funcExpr.args.length !== 2) {
                    throw new ErrorWithLocation(`"repeat" takes two arguments${formatLocationAt(funcExpr.location)}`, funcExpr.location);
                }
                const n = funcExpr.args[0];
                if (!(n instanceof NumberAPGMExpr)) {
                    throw new ErrorWithLocation(`first argument of "repeat" must be a number${formatLocationAt(funcExpr.location)}`, funcExpr.location);
                }
                const expr = funcExpr.args[1];
                const apgl = transpileAPGMExpr(expr);
                return new SeqAPGLExpr(Array(n.value).fill(0).map(()=>apgl));
            }
    }
    throw new ErrorWithLocation(`Unknown function: "${funcExpr.name}"${formatLocationAt(funcExpr.location)}`, funcExpr.location);
}
function transpileAPGMExpr(e) {
    const t = transpileAPGMExpr;
    if (e instanceof FuncAPGMExpr) {
        return transpileFuncAPGMExpr(e);
    } else if (e instanceof IfAPGMExpr) {
        if (e.modifier === "Z") {
            return new IfAPGLExpr(t(e.cond), t(e.thenBody), e.elseBody === undefined ? new SeqAPGLExpr([]) : t(e.elseBody));
        } else {
            return new IfAPGLExpr(t(e.cond), e.elseBody === undefined ? new SeqAPGLExpr([]) : t(e.elseBody), t(e.thenBody));
        }
    } else if (e instanceof LoopAPGMExpr) {
        return new LoopAPGLExpr(t(e.body));
    } else if (e instanceof NumberAPGMExpr) {
        throw new ErrorWithLocation(`number is not allowed: ${e.value}${formatLocationAt(e.location)}`, e.location);
    } else if (e instanceof SeqAPGMExpr) {
        return new SeqAPGLExpr(e.exprs.map((x)=>t(x)));
    } else if (e instanceof StringAPGMExpr) {
        throw Error(`string is not allowed: ${e.pretty()}`);
    } else if (e instanceof VarAPGMExpr) {
        throw new ErrorWithLocation(`macro variable is not allowed: variable "${e.name}"${formatLocationAt(e.location)}`, e.location);
    } else if (e instanceof WhileAPGMExpr) {
        return new WhileAPGLExpr(e.modifier, t(e.cond), t(e.body));
    }
    throw Error("internal error");
}
class Context1 {
    constructor(input, output, inputZNZ){
        this.input = input;
        this.output = output;
        this.inputZNZ = inputZNZ;
    }
    input;
    output;
    inputZNZ;
}
class Transpiler {
    id = 0;
    loopFinalStates = [];
    prefix;
    constructor(options = {}){
        this.prefix = options.prefix ?? "STATE_";
    }
    getFreshName() {
        this.id++;
        return `${this.prefix}${this.id}`;
    }
    emitLine({ currentState , prevOutput , nextState , actions  }) {
        if (actions.length === 0) {
            throw Error("action must be nonempty");
        }
        return [
            `${currentState}; ${prevOutput}; ${nextState}; ${actions.join(", ")}`, 
        ];
    }
    emitTransition(current, next, inputZNZ = "*") {
        return this.emitLine({
            currentState: current,
            prevOutput: inputZNZ,
            nextState: next,
            actions: [
                "NOP"
            ]
        });
    }
    transpile(expr) {
        const initialState = "INITIAL";
        const secondState = this.getFreshName() + "_INITIAL";
        const initial = this.emitTransition(initialState, secondState);
        const endState = this.prefix + "END";
        const body = this.transpileExpr(new Context1(secondState, endState, "*"), expr);
        const end = this.emitLine({
            currentState: endState,
            prevOutput: "*",
            nextState: endState,
            actions: [
                "HALT_OUT"
            ]
        });
        return [
            ...initial,
            ...body,
            ...end
        ];
    }
    transpileExpr(ctx, expr) {
        if (expr instanceof ActionAPGLExpr) {
            return this.transpileActionAPGLExpr(ctx, expr);
        } else if (expr instanceof SeqAPGLExpr) {
            return this.transpileSeqAPGLExpr(ctx, expr);
        } else if (expr instanceof IfAPGLExpr) {
            return this.transpileIfAPGLExpr(ctx, expr);
        } else if (expr instanceof LoopAPGLExpr) {
            return this.transpileLoopAPGLExpr(ctx, expr);
        } else if (expr instanceof WhileAPGLExpr) {
            return this.transpileWhileAPGLExpr(ctx, expr);
        } else if (expr instanceof BreakAPGLExpr) {
            return this.transpileBreakAPGLExpr(ctx, expr);
        } else {
            throw Error("unknown expr");
        }
    }
    transpileActionAPGLExpr(ctx, actionExpr) {
        return this.emitLine({
            currentState: ctx.input,
            prevOutput: ctx.inputZNZ,
            nextState: ctx.output,
            actions: actionExpr.actions
        });
    }
    transpileSeqAPGLExpr(ctx, seqExpr) {
        if (isEmptyExpr(seqExpr)) {
            return this.emitTransition(ctx.input, ctx.output, ctx.inputZNZ);
        }
        if (seqExpr.exprs.length === 1) {
            const expr = seqExpr.exprs[0];
            return this.transpileExpr(ctx, expr);
        }
        let seq = [];
        let state = ctx.input;
        for (const [i, expr1] of seqExpr.exprs.entries()){
            if (i === 0) {
                const outputState = this.getFreshName();
                seq = seq.concat(this.transpileExpr(new Context1(state, outputState, ctx.inputZNZ), expr1));
                state = outputState;
            } else if (i === seqExpr.exprs.length - 1) {
                seq = seq.concat(this.transpileExpr(new Context1(state, ctx.output, "*"), expr1));
            } else {
                const outputState1 = this.getFreshName();
                seq = seq.concat(this.transpileExpr(new Context1(state, outputState1, "*"), expr1));
                state = outputState1;
            }
        }
        return seq;
    }
    transpileIfAPGLExpr(ctx, ifExpr) {
        if (isEmptyExpr(ifExpr.thenBody) && isEmptyExpr(ifExpr.elseBody)) {
            return this.transpileExpr(ctx, ifExpr.cond);
        }
        const condEndState = this.getFreshName();
        const cond = this.transpileExpr(new Context1(ctx.input, condEndState, ctx.inputZNZ), ifExpr.cond);
        const [z, ...then] = this.transpileExpr(new Context1(condEndState, ctx.output, "Z"), ifExpr.thenBody);
        const [nz, ...el] = this.transpileExpr(new Context1(condEndState, ctx.output, "NZ"), ifExpr.elseBody);
        return [
            ...cond,
            z,
            nz,
            ...then,
            ...el
        ];
    }
    transpileLoopAPGLExpr(ctx, loopExpr) {
        const loopState = ctx.inputZNZ === "*" ? ctx.input : this.getFreshName();
        let trans = [];
        if (ctx.inputZNZ !== "*") {
            trans = trans.concat(this.emitTransition(ctx.input, loopState, ctx.inputZNZ));
        }
        this.loopFinalStates.push(ctx.output);
        const body = this.transpileExpr(new Context1(loopState, loopState, "*"), loopExpr.body);
        this.loopFinalStates.pop();
        return [
            ...trans,
            ...body
        ];
    }
    transpileWhileAPGLExprBodyEmpty(ctx, cond, modifier) {
        const condStartState = ctx.inputZNZ === "*" ? ctx.input : this.getFreshName();
        let trans = [];
        if (ctx.inputZNZ !== "*") {
            trans = trans.concat(this.emitTransition(ctx.input, condStartState, ctx.inputZNZ));
        }
        const condEndState = this.getFreshName();
        const condRes = this.transpileExpr(new Context1(condStartState, condEndState, "*"), cond);
        const zRes = this.emitLine({
            currentState: condEndState,
            prevOutput: "Z",
            nextState: modifier === "Z" ? condStartState : ctx.output,
            actions: [
                "NOP"
            ]
        });
        const nzRes = this.emitLine({
            currentState: condEndState,
            prevOutput: "NZ",
            nextState: modifier === "Z" ? ctx.output : condStartState,
            actions: [
                "NOP"
            ]
        });
        return [
            ...trans,
            ...condRes,
            ...zRes,
            ...nzRes
        ];
    }
    transpileWhileAPGLExpr(ctx, whileExpr) {
        if (isEmptyExpr(whileExpr.body)) {
            return this.transpileWhileAPGLExprBodyEmpty(ctx, whileExpr.cond, whileExpr.modifier);
        }
        let cond = [];
        const condStartState = ctx.inputZNZ === "*" ? ctx.input : this.getFreshName();
        if (ctx.inputZNZ !== "*") {
            cond = cond.concat(this.emitTransition(ctx.input, condStartState, ctx.inputZNZ));
        }
        const condEndState = this.getFreshName();
        cond = cond.concat(this.transpileExpr(new Context1(condStartState, condEndState, "*"), whileExpr.cond));
        const bodyStartState = this.getFreshName() + "_WHILE_BODY";
        const zRes = this.emitLine({
            currentState: condEndState,
            prevOutput: "Z",
            nextState: whileExpr.modifier === "Z" ? bodyStartState : ctx.output,
            actions: [
                "NOP"
            ]
        });
        const nzRes = this.emitLine({
            currentState: condEndState,
            prevOutput: "NZ",
            nextState: whileExpr.modifier === "Z" ? ctx.output : bodyStartState,
            actions: [
                "NOP"
            ]
        });
        this.loopFinalStates.push(ctx.output);
        const body = this.transpileExpr(new Context1(bodyStartState, condStartState, "*"), whileExpr.body);
        this.loopFinalStates.pop();
        return [
            ...cond,
            ...zRes,
            ...nzRes,
            ...body
        ];
    }
    transpileBreakAPGLExpr(ctx, breakExpr) {
        const level = breakExpr.level ?? 1;
        if (level < 1) {
            throw Error("break level is less than 1");
        }
        const finalState = this.loopFinalStates[this.loopFinalStates.length - level];
        if (finalState === undefined) {
            if (level === 1) {
                throw Error("break outside while or loop");
            } else {
                throw Error("break level is greater than number of nests of while or loop");
            }
        }
        return this.emitTransition(ctx.input, finalState, ctx.inputZNZ);
    }
}
function transpileAPGL(expr, options = {}) {
    return new Transpiler(options).transpile(expr);
}
function dups(as) {
    const set = new Set();
    const ds = [];
    for (const a of as){
        if (set.has(a)) {
            ds.push(a);
        } else {
            set.add(a);
        }
    }
    return ds;
}
function argumentsMessage(num) {
    return `${num} argument${num === 1 ? "" : "s"}`;
}
function replaceVarInBoby(macro, funcExpr) {
    const exprs = funcExpr.args;
    if (exprs.length !== macro.args.length) {
        throw new ErrorWithLocation(`argument length mismatch: "${macro.name}"` + ` expect ${argumentsMessage(macro.args.length)} but given ${argumentsMessage(exprs.length)}${formatLocationAt(funcExpr.location)}`, funcExpr.location);
    }
    const nameToExpr = new Map(macro.args.map((a, i)=>[
            a.name,
            exprs[i]
        ]));
    return macro.body.transform((x)=>{
        if (x instanceof VarAPGMExpr) {
            const expr = nameToExpr.get(x.name);
            if (expr === undefined) {
                throw new ErrorWithLocation(`scope error: "${x.name}"${formatLocationAt(x.location)}`, x.location);
            }
            return expr;
        } else {
            return x;
        }
    });
}
class MacroExpander {
    macroMap;
    count = 0;
    maxCount = 100000;
    main;
    constructor(main){
        this.main = main;
        this.macroMap = new Map(main.macros.map((m)=>[
                m.name,
                m
            ]));
        if (this.macroMap.size < main.macros.length) {
            const ds = dups(main.macros.map((x)=>x.name));
            const d = ds[0];
            const location = main.macros.slice().reverse().find((x)=>x.name === d)?.location;
            throw new ErrorWithLocation(`There is a macro with the same name: "${d}"` + formatLocationAt(location), location);
        }
    }
    expand() {
        return this.expandExpr(this.main.seqExpr);
    }
    expandExpr(expr) {
        if (this.maxCount < this.count) {
            throw Error("too many macro expansion");
        }
        this.count++;
        return expr.transform((x)=>this.expandOnce(x));
    }
    expandOnce(x) {
        if (x instanceof FuncAPGMExpr) {
            return this.expandFuncAPGMExpr(x);
        } else {
            return x;
        }
    }
    expandFuncAPGMExpr(funcExpr) {
        const macro = this.macroMap.get(funcExpr.name);
        if (macro !== undefined) {
            const expanded = replaceVarInBoby(macro, funcExpr);
            return this.expandExpr(expanded);
        } else {
            return funcExpr;
        }
    }
}
function expand(main) {
    return new MacroExpander(main).expand();
}
function optimize(expr) {
    return expr.transform(optimizeOnce);
}
function optimizeOnce(expr) {
    if (expr instanceof SeqAPGLExpr) {
        return optimizeSeqAPGLExpr(expr);
    }
    return expr;
}
function merge(as, bs) {
    if (as.length === 0) {
        return bs.slice();
    }
    if (bs.length === 0) {
        return as.slice();
    }
    if (as.some((x)=>x instanceof HaltOutAction)) {
        return undefined;
    }
    if (bs.some((x)=>x instanceof HaltOutAction)) {
        return undefined;
    }
    const asWithoutNOP = as.filter((x)=>!(x instanceof NopAction));
    const bsWithoutNOP = bs.filter((x)=>!(x instanceof NopAction));
    const asWithoutNOPNonReturn = asWithoutNOP.every((a)=>!a.doesReturnValue());
    const bsWithoutNOPNonReturn = bsWithoutNOP.every((b)=>!b.doesReturnValue());
    if (!asWithoutNOPNonReturn && !bsWithoutNOPNonReturn) {
        return undefined;
    }
    const distinctComponent = asWithoutNOP.every((a)=>{
        return bsWithoutNOP.every((b)=>{
            return !a.isSameComponent(b);
        });
    });
    if (!distinctComponent) {
        return undefined;
    }
    const merged = asWithoutNOP.concat(bsWithoutNOP);
    if (asWithoutNOPNonReturn && bsWithoutNOPNonReturn) {
        merged.push(new NopAction());
    }
    return merged;
}
function toActions(actionExpr) {
    return actionExpr.actions.flatMap((x)=>{
        const a = parseAction(x);
        return a !== undefined ? [
            a
        ] : [];
    });
}
function optimizeSeqAPGLExpr(seqExpr) {
    const newExprs = [];
    let items = [];
    const putItems = ()=>{
        if (items.length !== 0) {
            newExprs.push(new ActionAPGLExpr(items.map((x)=>x.pretty())));
            items = [];
        }
    };
    for (const expr of seqExpr.exprs){
        if (expr instanceof ActionAPGLExpr) {
            const actions = toActions(expr);
            const merged = merge(items, actions);
            if (merged === undefined) {
                putItems();
                items = actions;
            } else {
                items = merged;
            }
        } else {
            putItems();
            newExprs.push(expr);
        }
    }
    putItems();
    return new SeqAPGLExpr(newExprs);
}
function optimizeSeq(expr) {
    return expr.transform(optimizeOnce1);
}
function optimizeOnce1(expr) {
    if (expr instanceof SeqAPGLExpr) {
        return optimizeSeqAPGLExpr1(expr);
    }
    return expr;
}
function optimizeSeqAPGLExpr1(seqExpr) {
    let newExprs = [];
    for (const expr of seqExpr.exprs){
        if (expr instanceof SeqAPGLExpr) {
            newExprs = newExprs.concat(expr.exprs);
        } else {
            newExprs.push(expr);
        }
    }
    return new SeqAPGLExpr(newExprs);
}
function removeComment(src) {
    let res = "";
    let isComment = false;
    let i = 0;
    while(i < src.length){
        const c = src[i];
        const c2 = src[i + 1];
        if (c === "/" && c2 === "*") {
            i += 2;
            isComment = true;
        } else if (c === "*" && c2 === "/") {
            isComment = false;
            i += 2;
        } else {
            if (!isComment) {
                res += c;
            }
            i++;
        }
    }
    return res;
}
function completionParser(src) {
    const array = [];
    const MACRO_DECL_REGEXP = /(macro\s+([a-zA-Z_][a-zA-Z_0-9]*?!)\s*\(.*?\))/gs;
    const possibleMacroDecls = removeComment(src).matchAll(MACRO_DECL_REGEXP);
    for (const match of possibleMacroDecls){
        const result = macroHead().parse(match[0]);
        if (result.type === "ParseOK") {
            array.push({
                name: result.value.name,
                args: result.value.args.map((x)=>x.name)
            });
        }
    }
    return array;
}
export { emptyArgFuncs as emptyArgFuncs, numArgFuncs as numArgFuncs, strArgFuncs as strArgFuncs };
export { completionParser as completionParser };
function logged(f, x, logMessage = undefined) {
    const y = f(x);
    if (logMessage !== undefined) {
        console.log(logMessage, JSON.stringify(y, null, "  "));
    }
    return y;
}
function integration(str, options = {}, log = false) {
    const apgm = logged(parseMain, str, log ? "apgm" : undefined);
    const expanded = logged(expand, apgm, log ? "apgm expaned" : undefined);
    const apgl = logged(transpileAPGMExpr, expanded, log ? "apgl" : undefined);
    const seqOptimizedAPGL = logged(optimizeSeq, apgl, log ? "optimized apgl seq" : undefined);
    const optimizedAPGL = logged(optimize, seqOptimizedAPGL, log ? "optimized apgl action" : undefined);
    const apgs = transpileAPGL(optimizedAPGL, options);
    const comment = [
        "# State    Input    Next state    Actions",
        "# ---------------------------------------", 
    ];
    const head = apgm.headers.map((x)=>x.toString());
    return head.concat(comment, apgs);
}
export { integration as integration };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vY2RuLnNreXBhY2suZGV2Ly0vYnJlYWQtbi1idXR0ZXJAdjAuNi4wLVVpeVJKZzJFVDNhRXNLcVVRaUZNL2Rpc3Q9ZXMyMDE5LG1vZGU9aW1wb3J0cy9vcHRpbWl6ZWQvYnJlYWQtbi1idXR0ZXIuanMiLCJodHRwczovL2Nkbi5za3lwYWNrLmRldi9icmVhZC1uLWJ1dHRlcj9kdHMiLCJodHRwczovL3JlaTEwMjQuZ2l0aHViLmlvL3Byb2ovYXBnc2VtYmx5LWVtdWxhdG9yLTIvc3JjL2FjdGlvbnMvQWN0aW9uLmpzIiwiaHR0cHM6Ly9yZWkxMDI0LmdpdGh1Yi5pby9wcm9qL2FwZ3NlbWJseS1lbXVsYXRvci0yL3NyYy9hY3Rpb25zL0FkZEFjdGlvbi5qcyIsImh0dHBzOi8vcmVpMTAyNC5naXRodWIuaW8vcHJvai9hcGdzZW1ibHktZW11bGF0b3ItMi9zcmMvYWN0aW9ucy9CMkRBY3Rpb24uanMiLCJodHRwczovL3JlaTEwMjQuZ2l0aHViLmlvL3Byb2ovYXBnc2VtYmx5LWVtdWxhdG9yLTIvc3JjL2FjdGlvbnMvQlJlZ0FjdGlvbi5qcyIsImh0dHBzOi8vcmVpMTAyNC5naXRodWIuaW8vcHJvai9hcGdzZW1ibHktZW11bGF0b3ItMi9zcmMvYWN0aW9ucy9NdWxBY3Rpb24uanMiLCJodHRwczovL3JlaTEwMjQuZ2l0aHViLmlvL3Byb2ovYXBnc2VtYmx5LWVtdWxhdG9yLTIvc3JjL2FjdGlvbnMvT3V0cHV0QWN0aW9uLmpzIiwiaHR0cHM6Ly9yZWkxMDI0LmdpdGh1Yi5pby9wcm9qL2FwZ3NlbWJseS1lbXVsYXRvci0yL3NyYy9hY3Rpb25zL1N1YkFjdGlvbi5qcyIsImh0dHBzOi8vcmVpMTAyNC5naXRodWIuaW8vcHJvai9hcGdzZW1ibHktZW11bGF0b3ItMi9zcmMvYWN0aW9ucy9VUmVnQWN0aW9uLmpzIiwiaHR0cHM6Ly9yZWkxMDI0LmdpdGh1Yi5pby9wcm9qL2FwZ3NlbWJseS1lbXVsYXRvci0yL3NyYy9hY3Rpb25zL0xlZ2FjeVRSZWdBY3Rpb24uanMiLCJodHRwczovL3JlaTEwMjQuZ2l0aHViLmlvL3Byb2ovYXBnc2VtYmx5LWVtdWxhdG9yLTIvc3JjL2NvbXBvbmVudHMvQlJlZy5qcyIsImh0dHBzOi8vcmVpMTAyNC5naXRodWIuaW8vcHJvai9hcGdzZW1ibHktZW11bGF0b3ItMi9zcmMvYWN0aW9ucy9IYWx0T3V0QWN0aW9uLmpzIiwiaHR0cHM6Ly9yZWkxMDI0LmdpdGh1Yi5pby9wcm9qL2FwZ3NlbWJseS1lbXVsYXRvci0yL3NyYy92YWxpZGF0b3JzL2FjdGlvbl9yZXR1cm5fb25jZS5qcyIsImh0dHBzOi8vcmVpMTAyNC5naXRodWIuaW8vcHJvai9hcGdzZW1ibHktZW11bGF0b3ItMi9zcmMvYWN0aW9ucy9Ob3BBY3Rpb24uanMiLCJodHRwczovL3JlaTEwMjQuZ2l0aHViLmlvL3Byb2ovYXBnc2VtYmx5LWVtdWxhdG9yLTIvc3JjL2FjdGlvbnMvcGFyc2UuanMiLCJodHRwczovL3JlaTEwMjQuZ2l0aHViLmlvL3Byb2ovYXBnc2VtYmx5LWVtdWxhdG9yLTIvc3JjL0NvbW1hbmQuanMiLCJodHRwczovL3JlaTEwMjQuZ2l0aHViLmlvL3Byb2ovYXBnc2VtYmx5LWVtdWxhdG9yLTIvc3JjL3ZhbGlkYXRvcnMvbmV4dF9zdGF0ZV9pc19ub3RfaW5pdGlhbC5qcyIsImh0dHBzOi8vcmVpMTAyNC5naXRodWIuaW8vcHJvai9hcGdzZW1ibHktZW11bGF0b3ItMi9zcmMvdmFsaWRhdG9ycy9ub19kdXBfYWN0aW9uLmpzIiwiaHR0cHM6Ly9yZWkxMDI0LmdpdGh1Yi5pby9wcm9qL2FwZ3NlbWJseS1lbXVsYXRvci0yL3NyYy92YWxpZGF0b3JzL25vX3NhbWVfY29tcG9uZW50LmpzIiwiaHR0cHM6Ly9yZWkxMDI0LmdpdGh1Yi5pby9wcm9qL2FwZ3NlbWJseS1lbXVsYXRvci0yL3NyYy92YWxpZGF0b3JzL3pfYW5kX256LmpzIiwiaHR0cHM6Ly9yZWkxMDI0LmdpdGh1Yi5pby9wcm9qL2FwZ3NlbWJseS1lbXVsYXRvci0yL3NyYy9Qcm9ncmFtTGluZXMuanMiLCJodHRwczovL3JlaTEwMjQuZ2l0aHViLmlvL3Byb2ovYXBnc2VtYmx5LWVtdWxhdG9yLTIvc3JjL3ZhbGlkYXRlLmpzIiwiaHR0cHM6Ly9yZWkxMDI0LmdpdGh1Yi5pby9wcm9qL2FwZ3NlbWJseS1lbXVsYXRvci0yL3NyYy9Qcm9ncmFtLmpzIiwiZmlsZTovLy9Vc2Vycy9zYXRvc2hpL2hvYmJ5L2FwZ20vc3JjL2FwZ20vcGFyc2VyL251bWJlci50cyIsImZpbGU6Ly8vVXNlcnMvc2F0b3NoaS9ob2JieS9hcGdtL3NyYy9hcGdtL2FzdC9jb3JlLnRzIiwiZmlsZTovLy9Vc2Vycy9zYXRvc2hpL2hvYmJ5L2FwZ20vc3JjL2FwZ20vYXN0L2lmLnRzIiwiZmlsZTovLy9Vc2Vycy9zYXRvc2hpL2hvYmJ5L2FwZ20vc3JjL2FwZ20vYXN0L2xvb3AudHMiLCJmaWxlOi8vL1VzZXJzL3NhdG9zaGkvaG9iYnkvYXBnbS9zcmMvYXBnbS9hc3QvZnVuYy50cyIsImZpbGU6Ly8vVXNlcnMvc2F0b3NoaS9ob2JieS9hcGdtL3NyYy9hcGdtL2FzdC9tYWNyby50cyIsImZpbGU6Ly8vVXNlcnMvc2F0b3NoaS9ob2JieS9hcGdtL3NyYy9hcGdtL2FzdC9tYWluLnRzIiwiZmlsZTovLy9Vc2Vycy9zYXRvc2hpL2hvYmJ5L2FwZ20vc3JjL2FwZ20vYXN0L2hlYWRlci50cyIsImZpbGU6Ly8vVXNlcnMvc2F0b3NoaS9ob2JieS9hcGdtL3NyYy9hcGdtL2FzdC9udW1iZXIudHMiLCJmaWxlOi8vL1VzZXJzL3NhdG9zaGkvaG9iYnkvYXBnbS9zcmMvYXBnbS9hc3Qvc3RyaW5nLnRzIiwiZmlsZTovLy9Vc2Vycy9zYXRvc2hpL2hvYmJ5L2FwZ20vc3JjL2FwZ20vYXN0L3Zhci50cyIsImZpbGU6Ly8vVXNlcnMvc2F0b3NoaS9ob2JieS9hcGdtL3NyYy9hcGdtL2FzdC93aGlsZS50cyIsImZpbGU6Ly8vVXNlcnMvc2F0b3NoaS9ob2JieS9hcGdtL3NyYy9hcGdtL2FzdC9zZXEudHMiLCJmaWxlOi8vL1VzZXJzL3NhdG9zaGkvaG9iYnkvYXBnbS9zcmMvYXBnbS9wYXJzZXIvcGFyc2VQcmV0dHkudHMiLCJmaWxlOi8vL1VzZXJzL3NhdG9zaGkvaG9iYnkvYXBnbS9zcmMvYXBnbS9wYXJzZXIvbW9kLnRzIiwiZmlsZTovLy9Vc2Vycy9zYXRvc2hpL2hvYmJ5L2FwZ20vc3JjL2FwZ2wvYXN0L2NvcmUudHMiLCJmaWxlOi8vL1VzZXJzL3NhdG9zaGkvaG9iYnkvYXBnbS9zcmMvYXBnbC9hc3QvYWN0aW9uLnRzIiwiZmlsZTovLy9Vc2Vycy9zYXRvc2hpL2hvYmJ5L2FwZ20vc3JjL2FwZ2wvYXN0L3NlcS50cyIsImZpbGU6Ly8vVXNlcnMvc2F0b3NoaS9ob2JieS9hcGdtL3NyYy9hcGdsL2FzdC9pZi50cyIsImZpbGU6Ly8vVXNlcnMvc2F0b3NoaS9ob2JieS9hcGdtL3NyYy9hcGdsL2FzdC9sb29wLnRzIiwiZmlsZTovLy9Vc2Vycy9zYXRvc2hpL2hvYmJ5L2FwZ20vc3JjL2FwZ2wvYXN0L3doaWxlLnRzIiwiZmlsZTovLy9Vc2Vycy9zYXRvc2hpL2hvYmJ5L2FwZ20vc3JjL2FwZ2wvYXN0L2JyZWFrLnRzIiwiZmlsZTovLy9Vc2Vycy9zYXRvc2hpL2hvYmJ5L2FwZ20vc3JjL2FwZ2wvYWN0aW9ucy50cyIsImZpbGU6Ly8vVXNlcnMvc2F0b3NoaS9ob2JieS9hcGdtL3NyYy9hcGdtX3RvX2FwZ2wvdHJhbnNwaWxlci50cyIsImZpbGU6Ly8vVXNlcnMvc2F0b3NoaS9ob2JieS9hcGdtL3NyYy9hcGdsX3RvX2FwZ3NlbWJseS90cmFuc3BpbGVyLnRzIiwiZmlsZTovLy9Vc2Vycy9zYXRvc2hpL2hvYmJ5L2FwZ20vc3JjL2FwZ20vbWFjcm8vX2R1cHMudHMiLCJmaWxlOi8vL1VzZXJzL3NhdG9zaGkvaG9iYnkvYXBnbS9zcmMvYXBnbS9tYWNyby9leHBhbmRlci50cyIsImZpbGU6Ly8vVXNlcnMvc2F0b3NoaS9ob2JieS9hcGdtL3NyYy9hcGdsL2FjdGlvbl9vcHRpbWl6ZXIvbW9kLnRzIiwiZmlsZTovLy9Vc2Vycy9zYXRvc2hpL2hvYmJ5L2FwZ20vc3JjL2FwZ2wvc2VxX29wdGltaXplci9tb2QudHMiLCJmaWxlOi8vL1VzZXJzL3NhdG9zaGkvaG9iYnkvYXBnbS9zcmMvYXBnbS9wYXJzZXIvY29tcGxldGlvbl9wYXJzZXIudHMiLCJmaWxlOi8vL1VzZXJzL3NhdG9zaGkvaG9iYnkvYXBnbS9zcmMvaW50ZWdyYXRpb24vbW9kLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFBhcnNlciB7XG4gIGNvbnN0cnVjdG9yKGFjdGlvbikge1xuICAgIHRoaXMuYWN0aW9uID0gYWN0aW9uO1xuICB9XG4gIHBhcnNlKGlucHV0KSB7XG4gICAgY29uc3QgbG9jYXRpb24yID0ge2luZGV4OiAwLCBsaW5lOiAxLCBjb2x1bW46IDF9O1xuICAgIGNvbnN0IGNvbnRleHQgPSBuZXcgQ29udGV4dCh7aW5wdXQsIGxvY2F0aW9uOiBsb2NhdGlvbjJ9KTtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLnNraXAoZW9mKS5hY3Rpb24oY29udGV4dCk7XG4gICAgaWYgKHJlc3VsdC50eXBlID09PSBcIkFjdGlvbk9LXCIpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IFwiUGFyc2VPS1wiLFxuICAgICAgICB2YWx1ZTogcmVzdWx0LnZhbHVlXG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogXCJQYXJzZUZhaWxcIixcbiAgICAgIGxvY2F0aW9uOiByZXN1bHQuZnVydGhlc3QsXG4gICAgICBleHBlY3RlZDogcmVzdWx0LmV4cGVjdGVkXG4gICAgfTtcbiAgfVxuICB0cnlQYXJzZShpbnB1dCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMucGFyc2UoaW5wdXQpO1xuICAgIGlmIChyZXN1bHQudHlwZSA9PT0gXCJQYXJzZU9LXCIpIHtcbiAgICAgIHJldHVybiByZXN1bHQudmFsdWU7XG4gICAgfVxuICAgIGNvbnN0IHtleHBlY3RlZCwgbG9jYXRpb246IGxvY2F0aW9uMn0gPSByZXN1bHQ7XG4gICAgY29uc3Qge2xpbmUsIGNvbHVtbn0gPSBsb2NhdGlvbjI7XG4gICAgY29uc3QgbWVzc2FnZSA9IGBwYXJzZSBlcnJvciBhdCBsaW5lICR7bGluZX0gY29sdW1uICR7Y29sdW1ufTogZXhwZWN0ZWQgJHtleHBlY3RlZC5qb2luKFwiLCBcIil9YDtcbiAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIH1cbiAgYW5kKHBhcnNlckIpIHtcbiAgICByZXR1cm4gbmV3IFBhcnNlcigoY29udGV4dCkgPT4ge1xuICAgICAgY29uc3QgYSA9IHRoaXMuYWN0aW9uKGNvbnRleHQpO1xuICAgICAgaWYgKGEudHlwZSA9PT0gXCJBY3Rpb25GYWlsXCIpIHtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgICB9XG4gICAgICBjb250ZXh0ID0gY29udGV4dC5tb3ZlVG8oYS5sb2NhdGlvbik7XG4gICAgICBjb25zdCBiID0gY29udGV4dC5tZXJnZShhLCBwYXJzZXJCLmFjdGlvbihjb250ZXh0KSk7XG4gICAgICBpZiAoYi50eXBlID09PSBcIkFjdGlvbk9LXCIpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBbYS52YWx1ZSwgYi52YWx1ZV07XG4gICAgICAgIHJldHVybiBjb250ZXh0Lm1lcmdlKGIsIGNvbnRleHQub2soYi5sb2NhdGlvbi5pbmRleCwgdmFsdWUpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBiO1xuICAgIH0pO1xuICB9XG4gIHNraXAocGFyc2VyQikge1xuICAgIHJldHVybiB0aGlzLmFuZChwYXJzZXJCKS5tYXAoKFthXSkgPT4gYSk7XG4gIH1cbiAgbmV4dChwYXJzZXJCKSB7XG4gICAgcmV0dXJuIHRoaXMuYW5kKHBhcnNlckIpLm1hcCgoWywgYl0pID0+IGIpO1xuICB9XG4gIG9yKHBhcnNlckIpIHtcbiAgICByZXR1cm4gbmV3IFBhcnNlcigoY29udGV4dCkgPT4ge1xuICAgICAgY29uc3QgYSA9IHRoaXMuYWN0aW9uKGNvbnRleHQpO1xuICAgICAgaWYgKGEudHlwZSA9PT0gXCJBY3Rpb25PS1wiKSB7XG4gICAgICAgIHJldHVybiBhO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbnRleHQubWVyZ2UoYSwgcGFyc2VyQi5hY3Rpb24oY29udGV4dCkpO1xuICAgIH0pO1xuICB9XG4gIGNoYWluKGZuKSB7XG4gICAgcmV0dXJuIG5ldyBQYXJzZXIoKGNvbnRleHQpID0+IHtcbiAgICAgIGNvbnN0IGEgPSB0aGlzLmFjdGlvbihjb250ZXh0KTtcbiAgICAgIGlmIChhLnR5cGUgPT09IFwiQWN0aW9uRmFpbFwiKSB7XG4gICAgICAgIHJldHVybiBhO1xuICAgICAgfVxuICAgICAgY29uc3QgcGFyc2VyQiA9IGZuKGEudmFsdWUpO1xuICAgICAgY29udGV4dCA9IGNvbnRleHQubW92ZVRvKGEubG9jYXRpb24pO1xuICAgICAgcmV0dXJuIGNvbnRleHQubWVyZ2UoYSwgcGFyc2VyQi5hY3Rpb24oY29udGV4dCkpO1xuICAgIH0pO1xuICB9XG4gIG1hcChmbikge1xuICAgIHJldHVybiB0aGlzLmNoYWluKChhKSA9PiB7XG4gICAgICByZXR1cm4gb2soZm4oYSkpO1xuICAgIH0pO1xuICB9XG4gIHRocnUoZm4pIHtcbiAgICByZXR1cm4gZm4odGhpcyk7XG4gIH1cbiAgZGVzYyhleHBlY3RlZCkge1xuICAgIHJldHVybiBuZXcgUGFyc2VyKChjb250ZXh0KSA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSB0aGlzLmFjdGlvbihjb250ZXh0KTtcbiAgICAgIGlmIChyZXN1bHQudHlwZSA9PT0gXCJBY3Rpb25PS1wiKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgICByZXR1cm4ge3R5cGU6IFwiQWN0aW9uRmFpbFwiLCBmdXJ0aGVzdDogcmVzdWx0LmZ1cnRoZXN0LCBleHBlY3RlZH07XG4gICAgfSk7XG4gIH1cbiAgd3JhcChiZWZvcmUsIGFmdGVyKSB7XG4gICAgcmV0dXJuIGJlZm9yZS5uZXh0KHRoaXMpLnNraXAoYWZ0ZXIpO1xuICB9XG4gIHRyaW0oYmVmb3JlQW5kQWZ0ZXIpIHtcbiAgICByZXR1cm4gdGhpcy53cmFwKGJlZm9yZUFuZEFmdGVyLCBiZWZvcmVBbmRBZnRlcik7XG4gIH1cbiAgcmVwZWF0KG1pbiA9IDAsIG1heCA9IEluZmluaXR5KSB7XG4gICAgaWYgKCFpc1JhbmdlVmFsaWQobWluLCBtYXgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHJlcGVhdDogYmFkIHJhbmdlICgke21pbn0gdG8gJHttYXh9KWApO1xuICAgIH1cbiAgICBpZiAobWluID09PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZXBlYXQoMSwgbWF4KS5vcihvayhbXSkpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFBhcnNlcigoY29udGV4dCkgPT4ge1xuICAgICAgY29uc3QgaXRlbXMgPSBbXTtcbiAgICAgIGxldCByZXN1bHQgPSB0aGlzLmFjdGlvbihjb250ZXh0KTtcbiAgICAgIGlmIChyZXN1bHQudHlwZSA9PT0gXCJBY3Rpb25GYWlsXCIpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICAgIHdoaWxlIChyZXN1bHQudHlwZSA9PT0gXCJBY3Rpb25PS1wiICYmIGl0ZW1zLmxlbmd0aCA8IG1heCkge1xuICAgICAgICBpdGVtcy5wdXNoKHJlc3VsdC52YWx1ZSk7XG4gICAgICAgIGlmIChyZXN1bHQubG9jYXRpb24uaW5kZXggPT09IGNvbnRleHQubG9jYXRpb24uaW5kZXgpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbmZpbml0ZSBsb29wIGRldGVjdGVkOyBkb24ndCBjYWxsIC5yZXBlYXQoKSB3aXRoIHBhcnNlcnMgdGhhdCBjYW4gYWNjZXB0IHplcm8gY2hhcmFjdGVyc1wiKTtcbiAgICAgICAgfVxuICAgICAgICBjb250ZXh0ID0gY29udGV4dC5tb3ZlVG8ocmVzdWx0LmxvY2F0aW9uKTtcbiAgICAgICAgcmVzdWx0ID0gY29udGV4dC5tZXJnZShyZXN1bHQsIHRoaXMuYWN0aW9uKGNvbnRleHQpKTtcbiAgICAgIH1cbiAgICAgIGlmIChyZXN1bHQudHlwZSA9PT0gXCJBY3Rpb25GYWlsXCIgJiYgaXRlbXMubGVuZ3RoIDwgbWluKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29udGV4dC5tZXJnZShyZXN1bHQsIGNvbnRleHQub2soY29udGV4dC5sb2NhdGlvbi5pbmRleCwgaXRlbXMpKTtcbiAgICB9KTtcbiAgfVxuICBzZXBCeShzZXBhcmF0b3IsIG1pbiA9IDAsIG1heCA9IEluZmluaXR5KSB7XG4gICAgaWYgKCFpc1JhbmdlVmFsaWQobWluLCBtYXgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHNlcEJ5OiBiYWQgcmFuZ2UgKCR7bWlufSB0byAke21heH0pYCk7XG4gICAgfVxuICAgIGlmIChtaW4gPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzLnNlcEJ5KHNlcGFyYXRvciwgMSwgbWF4KS5vcihvayhbXSkpO1xuICAgIH1cbiAgICBpZiAobWF4ID09PSAxKSB7XG4gICAgICByZXR1cm4gdGhpcy5tYXAoKHgpID0+IFt4XSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNoYWluKChmaXJzdCkgPT4ge1xuICAgICAgcmV0dXJuIHNlcGFyYXRvci5uZXh0KHRoaXMpLnJlcGVhdChtaW4gLSAxLCBtYXggLSAxKS5tYXAoKHJlc3QpID0+IHtcbiAgICAgICAgcmV0dXJuIFtmaXJzdCwgLi4ucmVzdF07XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuICBub2RlKG5hbWUpIHtcbiAgICByZXR1cm4gYWxsKGxvY2F0aW9uLCB0aGlzLCBsb2NhdGlvbikubWFwKChbc3RhcnQsIHZhbHVlLCBlbmRdKSA9PiB7XG4gICAgICBjb25zdCB0eXBlID0gXCJQYXJzZU5vZGVcIjtcbiAgICAgIHJldHVybiB7dHlwZSwgbmFtZSwgdmFsdWUsIHN0YXJ0LCBlbmR9O1xuICAgIH0pO1xuICB9XG59XG5mdW5jdGlvbiBpc1JhbmdlVmFsaWQobWluLCBtYXgpIHtcbiAgcmV0dXJuIG1pbiA8PSBtYXggJiYgbWluID49IDAgJiYgbWF4ID49IDAgJiYgTnVtYmVyLmlzSW50ZWdlcihtaW4pICYmIG1pbiAhPT0gSW5maW5pdHkgJiYgKE51bWJlci5pc0ludGVnZXIobWF4KSB8fCBtYXggPT09IEluZmluaXR5KTtcbn1cbmNvbnN0IGxvY2F0aW9uID0gbmV3IFBhcnNlcigoY29udGV4dCkgPT4ge1xuICByZXR1cm4gY29udGV4dC5vayhjb250ZXh0LmxvY2F0aW9uLmluZGV4LCBjb250ZXh0LmxvY2F0aW9uKTtcbn0pO1xuZnVuY3Rpb24gb2sodmFsdWUpIHtcbiAgcmV0dXJuIG5ldyBQYXJzZXIoKGNvbnRleHQpID0+IHtcbiAgICByZXR1cm4gY29udGV4dC5vayhjb250ZXh0LmxvY2F0aW9uLmluZGV4LCB2YWx1ZSk7XG4gIH0pO1xufVxuZnVuY3Rpb24gZmFpbChleHBlY3RlZCkge1xuICByZXR1cm4gbmV3IFBhcnNlcigoY29udGV4dCkgPT4ge1xuICAgIHJldHVybiBjb250ZXh0LmZhaWwoY29udGV4dC5sb2NhdGlvbi5pbmRleCwgZXhwZWN0ZWQpO1xuICB9KTtcbn1cbmNvbnN0IGVvZiA9IG5ldyBQYXJzZXIoKGNvbnRleHQpID0+IHtcbiAgaWYgKGNvbnRleHQubG9jYXRpb24uaW5kZXggPCBjb250ZXh0LmlucHV0Lmxlbmd0aCkge1xuICAgIHJldHVybiBjb250ZXh0LmZhaWwoY29udGV4dC5sb2NhdGlvbi5pbmRleCwgW1wiPEVPRj5cIl0pO1xuICB9XG4gIHJldHVybiBjb250ZXh0Lm9rKGNvbnRleHQubG9jYXRpb24uaW5kZXgsIFwiPEVPRj5cIik7XG59KTtcbmZ1bmN0aW9uIHRleHQoc3RyaW5nKSB7XG4gIHJldHVybiBuZXcgUGFyc2VyKChjb250ZXh0KSA9PiB7XG4gICAgY29uc3Qgc3RhcnQgPSBjb250ZXh0LmxvY2F0aW9uLmluZGV4O1xuICAgIGNvbnN0IGVuZCA9IHN0YXJ0ICsgc3RyaW5nLmxlbmd0aDtcbiAgICBpZiAoY29udGV4dC5pbnB1dC5zbGljZShzdGFydCwgZW5kKSA9PT0gc3RyaW5nKSB7XG4gICAgICByZXR1cm4gY29udGV4dC5vayhlbmQsIHN0cmluZyk7XG4gICAgfVxuICAgIHJldHVybiBjb250ZXh0LmZhaWwoc3RhcnQsIFtzdHJpbmddKTtcbiAgfSk7XG59XG5mdW5jdGlvbiBtYXRjaChyZWdleHApIHtcbiAgZm9yIChjb25zdCBmbGFnIG9mIHJlZ2V4cC5mbGFncykge1xuICAgIHN3aXRjaCAoZmxhZykge1xuICAgICAgY2FzZSBcImlcIjpcbiAgICAgIGNhc2UgXCJzXCI6XG4gICAgICBjYXNlIFwibVwiOlxuICAgICAgY2FzZSBcInVcIjpcbiAgICAgICAgY29udGludWU7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvbmx5IHRoZSByZWdleHAgZmxhZ3MgJ2ltc3UnIGFyZSBzdXBwb3J0ZWRcIik7XG4gICAgfVxuICB9XG4gIGNvbnN0IHN0aWNreSA9IG5ldyBSZWdFeHAocmVnZXhwLnNvdXJjZSwgcmVnZXhwLmZsYWdzICsgXCJ5XCIpO1xuICByZXR1cm4gbmV3IFBhcnNlcigoY29udGV4dCkgPT4ge1xuICAgIGNvbnN0IHN0YXJ0ID0gY29udGV4dC5sb2NhdGlvbi5pbmRleDtcbiAgICBzdGlja3kubGFzdEluZGV4ID0gc3RhcnQ7XG4gICAgY29uc3QgbWF0Y2gyID0gY29udGV4dC5pbnB1dC5tYXRjaChzdGlja3kpO1xuICAgIGlmIChtYXRjaDIpIHtcbiAgICAgIGNvbnN0IGVuZCA9IHN0YXJ0ICsgbWF0Y2gyWzBdLmxlbmd0aDtcbiAgICAgIGNvbnN0IHN0cmluZyA9IGNvbnRleHQuaW5wdXQuc2xpY2Uoc3RhcnQsIGVuZCk7XG4gICAgICByZXR1cm4gY29udGV4dC5vayhlbmQsIHN0cmluZyk7XG4gICAgfVxuICAgIHJldHVybiBjb250ZXh0LmZhaWwoc3RhcnQsIFtTdHJpbmcocmVnZXhwKV0pO1xuICB9KTtcbn1cbmZ1bmN0aW9uIGFsbCguLi5wYXJzZXJzKSB7XG4gIHJldHVybiBwYXJzZXJzLnJlZHVjZSgoYWNjLCBwKSA9PiB7XG4gICAgcmV0dXJuIGFjYy5jaGFpbigoYXJyYXkpID0+IHtcbiAgICAgIHJldHVybiBwLm1hcCgodmFsdWUpID0+IHtcbiAgICAgICAgcmV0dXJuIFsuLi5hcnJheSwgdmFsdWVdO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0sIG9rKFtdKSk7XG59XG5mdW5jdGlvbiBjaG9pY2UoLi4ucGFyc2Vycykge1xuICByZXR1cm4gcGFyc2Vycy5yZWR1Y2UoKGFjYywgcCkgPT4ge1xuICAgIHJldHVybiBhY2Mub3IocCk7XG4gIH0pO1xufVxuZnVuY3Rpb24gbGF6eShmbikge1xuICBjb25zdCBwYXJzZXIgPSBuZXcgUGFyc2VyKChjb250ZXh0KSA9PiB7XG4gICAgcGFyc2VyLmFjdGlvbiA9IGZuKCkuYWN0aW9uO1xuICAgIHJldHVybiBwYXJzZXIuYWN0aW9uKGNvbnRleHQpO1xuICB9KTtcbiAgcmV0dXJuIHBhcnNlcjtcbn1cbmZ1bmN0aW9uIHVuaW9uKGEsIGIpIHtcbiAgcmV0dXJuIFsuLi5uZXcgU2V0KFsuLi5hLCAuLi5iXSldO1xufVxuY2xhc3MgQ29udGV4dCB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB0aGlzLmlucHV0ID0gb3B0aW9ucy5pbnB1dDtcbiAgICB0aGlzLmxvY2F0aW9uID0gb3B0aW9ucy5sb2NhdGlvbjtcbiAgfVxuICBtb3ZlVG8obG9jYXRpb24yKSB7XG4gICAgcmV0dXJuIG5ldyBDb250ZXh0KHtcbiAgICAgIGlucHV0OiB0aGlzLmlucHV0LFxuICAgICAgbG9jYXRpb246IGxvY2F0aW9uMlxuICAgIH0pO1xuICB9XG4gIF9pbnRlcm5hbF9tb3ZlKGluZGV4KSB7XG4gICAgaWYgKGluZGV4ID09PSB0aGlzLmxvY2F0aW9uLmluZGV4KSB7XG4gICAgICByZXR1cm4gdGhpcy5sb2NhdGlvbjtcbiAgICB9XG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLmxvY2F0aW9uLmluZGV4O1xuICAgIGNvbnN0IGVuZCA9IGluZGV4O1xuICAgIGNvbnN0IGNodW5rID0gdGhpcy5pbnB1dC5zbGljZShzdGFydCwgZW5kKTtcbiAgICBsZXQge2xpbmUsIGNvbHVtbn0gPSB0aGlzLmxvY2F0aW9uO1xuICAgIGZvciAoY29uc3QgY2ggb2YgY2h1bmspIHtcbiAgICAgIGlmIChjaCA9PT0gXCJcXG5cIikge1xuICAgICAgICBsaW5lKys7XG4gICAgICAgIGNvbHVtbiA9IDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb2x1bW4rKztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtpbmRleCwgbGluZSwgY29sdW1ufTtcbiAgfVxuICBvayhpbmRleCwgdmFsdWUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogXCJBY3Rpb25PS1wiLFxuICAgICAgdmFsdWUsXG4gICAgICBsb2NhdGlvbjogdGhpcy5faW50ZXJuYWxfbW92ZShpbmRleCksXG4gICAgICBmdXJ0aGVzdDoge2luZGV4OiAtMSwgbGluZTogLTEsIGNvbHVtbjogLTF9LFxuICAgICAgZXhwZWN0ZWQ6IFtdXG4gICAgfTtcbiAgfVxuICBmYWlsKGluZGV4LCBleHBlY3RlZCkge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBcIkFjdGlvbkZhaWxcIixcbiAgICAgIGZ1cnRoZXN0OiB0aGlzLl9pbnRlcm5hbF9tb3ZlKGluZGV4KSxcbiAgICAgIGV4cGVjdGVkXG4gICAgfTtcbiAgfVxuICBtZXJnZShhLCBiKSB7XG4gICAgaWYgKGIuZnVydGhlc3QuaW5kZXggPiBhLmZ1cnRoZXN0LmluZGV4KSB7XG4gICAgICByZXR1cm4gYjtcbiAgICB9XG4gICAgY29uc3QgZXhwZWN0ZWQgPSBiLmZ1cnRoZXN0LmluZGV4ID09PSBhLmZ1cnRoZXN0LmluZGV4ID8gdW5pb24oYS5leHBlY3RlZCwgYi5leHBlY3RlZCkgOiBhLmV4cGVjdGVkO1xuICAgIGlmIChiLnR5cGUgPT09IFwiQWN0aW9uT0tcIikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogXCJBY3Rpb25PS1wiLFxuICAgICAgICBsb2NhdGlvbjogYi5sb2NhdGlvbixcbiAgICAgICAgdmFsdWU6IGIudmFsdWUsXG4gICAgICAgIGZ1cnRoZXN0OiBhLmZ1cnRoZXN0LFxuICAgICAgICBleHBlY3RlZFxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IFwiQWN0aW9uRmFpbFwiLFxuICAgICAgZnVydGhlc3Q6IGEuZnVydGhlc3QsXG4gICAgICBleHBlY3RlZFxuICAgIH07XG4gIH1cbn1cbmV4cG9ydCB7UGFyc2VyLCBhbGwsIGNob2ljZSwgZW9mLCBmYWlsLCBsYXp5LCBsb2NhdGlvbiwgbWF0Y2gsIG9rLCB0ZXh0fTtcbmV4cG9ydCBkZWZhdWx0IG51bGw7XG4iLCIvKlxuICogU2t5cGFjayBDRE4gLSBicmVhZC1uLWJ1dHRlckAwLjYuMFxuICpcbiAqIExlYXJuIG1vcmU6XG4gKiAgIPCfk5kgUGFja2FnZSBEb2N1bWVudGF0aW9uOiBodHRwczovL3d3dy5za3lwYWNrLmRldi92aWV3L2JyZWFkLW4tYnV0dGVyXG4gKiAgIPCfk5ggU2t5cGFjayBEb2N1bWVudGF0aW9uOiBodHRwczovL3d3dy5za3lwYWNrLmRldi9kb2NzXG4gKlxuICogUGlubmVkIFVSTDogKE9wdGltaXplZCBmb3IgUHJvZHVjdGlvbilcbiAqICAg4pa277iPIE5vcm1hbDogaHR0cHM6Ly9jZG4uc2t5cGFjay5kZXYvcGluL2JyZWFkLW4tYnV0dGVyQHYwLjYuMC1VaXlSSmcyRVQzYUVzS3FVUWlGTS9tb2RlPWltcG9ydHMvb3B0aW1pemVkL2JyZWFkLW4tYnV0dGVyLmpzXG4gKiAgIOKPqSBNaW5pZmllZDogaHR0cHM6Ly9jZG4uc2t5cGFjay5kZXYvcGluL2JyZWFkLW4tYnV0dGVyQHYwLjYuMC1VaXlSSmcyRVQzYUVzS3FVUWlGTS9tb2RlPWltcG9ydHMsbWluL29wdGltaXplZC9icmVhZC1uLWJ1dHRlci5qc1xuICpcbiAqL1xuXG4vLyBCcm93c2VyLU9wdGltaXplZCBJbXBvcnRzIChEb24ndCBkaXJlY3RseSBpbXBvcnQgdGhlIFVSTHMgYmVsb3cgaW4geW91ciBhcHBsaWNhdGlvbiEpXG5leHBvcnQgKiBmcm9tICcvLS9icmVhZC1uLWJ1dHRlckB2MC42LjAtVWl5UkpnMkVUM2FFc0txVVFpRk0vZGlzdD1lczIwMTksbW9kZT1pbXBvcnRzL29wdGltaXplZC9icmVhZC1uLWJ1dHRlci5qcyc7XG5leHBvcnQge2RlZmF1bHR9IGZyb20gJy8tL2JyZWFkLW4tYnV0dGVyQHYwLjYuMC1VaXlSSmcyRVQzYUVzS3FVUWlGTS9kaXN0PWVzMjAxOSxtb2RlPWltcG9ydHMvb3B0aW1pemVkL2JyZWFkLW4tYnV0dGVyLmpzJztcbiIsIi8vIEB0cy1jaGVja1xuXG4vKipcbiAqIOOCouOCr+OCt+ODp+ODs1xuICogQGFic3RyYWN0XG4gKi9cbmV4cG9ydCBjbGFzcyBBY3Rpb24ge1xuXG4gICAgLyoqXG4gICAgICogQ29udmVydCB0byBzdHJpbmdcbiAgICAgKiDmloflrZfliJfljJbjgZnjgotcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHByZXR0eSgpIHtcbiAgICAgICAgcmV0dXJuIFwidW5pbXBsZW1lbnRlZFwiO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOOCouOCr+OCt+ODp+ODs+OBq+WQq+OBvuOCjOOCi+OCueODqeOCpOODh+OCo+ODs+OCsOODrOOCuOOCueOCv+OBruODrOOCuOOCueOCv+eVquWPt+OCkui/lOOBmeOAglxuICAgICAqIEByZXR1cm5zIHtudW1iZXJbXX1cbiAgICAgKi9cbiAgICBleHRyYWN0VW5hcnlSZWdpc3Rlck51bWJlcnMoKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDjgqLjgq/jgrfjg6fjg7PjgavlkKvjgb7jgozjgovjg5DjgqTjg4rjg6rjg6zjgrjjgrnjgr/jga7jg6zjgrjjgrnjgr/nlarlj7fjgpLov5TjgZnjgIJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyW119XG4gICAgICovXG4gICAgZXh0cmFjdEJpbmFyeVJlZ2lzdGVyTnVtYmVycygpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOOCouOCr+OCt+ODp+ODs+OBq+WQq+OBvuOCjOOCi1Tjg6zjgrjjgrnjgr/jga7jg6zjgrjjgrnjgr/nlarlj7fjgpLov5TjgZnjgIJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyW119XG4gICAgICovXG4gICAgZXh0cmFjdExlZ2FjeVRSZWdpc3Rlck51bWJlcnMoKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEb2VzIHRoaXMgYWN0aW9uIHJldHVybiBhIHZhbHVlP1xuICAgICAqIOWApOOCkui/lOOBmeOBi+OBqeOBhuOBi1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufSDlgKTjgpLov5TjgZnloLTlkIh0cnVlXG4gICAgICovXG4gICAgZG9lc1JldHVyblZhbHVlKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5ZCM44GY44Kz44Oz44Od44O844ON44Oz44OI44Gu44Ki44Kv44K344On44Oz44Gn44GC44KM44GwdHJ1ZeOCkui/lOOBmVxuICAgICAqIEBwYXJhbSB7QWN0aW9ufSBfYWN0aW9uXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNTYW1lQ29tcG9uZW50KF9hY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuIiwiLy8gQHRzLWNoZWNrXG5cbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuL0FjdGlvbi5qc1wiO1xuXG5leHBvcnQgY29uc3QgQUREX0ExID0gMDtcbmV4cG9ydCBjb25zdCBBRERfQjAgPSAxO1xuZXhwb3J0IGNvbnN0IEFERF9CMSA9IDI7XG5cbmNvbnN0IEFERF9BMV9TVFJJTkcgPSBcIkExXCI7XG5jb25zdCBBRERfQjBfU1RSSU5HID0gXCJCMFwiO1xuY29uc3QgQUREX0IxX1NUUklORyA9IFwiQjFcIjtcblxuY29uc3QgQUREX1NUUklORyA9IFwiQUREXCI7XG5cbi8qKlxuICogQHR5cGVkZWYge0FERF9BMSB8IEFERF9CMCB8IEFERF9CMX0gQWRkT3BcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtBRERfQTFfU1RSSU5HIHwgQUREX0IwX1NUUklORyB8IEFERF9CMV9TVFJJTkd9IEFkZE9wU3RyaW5nXG4gKi9cblxuLyoqXG4gKlxuICogQHBhcmFtIHtBZGRPcH0gb3BcbiAqIEByZXR1cm5zIHtBZGRPcFN0cmluZ31cbiAqL1xuZnVuY3Rpb24gcHJldHR5T3Aob3ApIHtcbiAgICBzd2l0Y2ggKG9wKSB7XG4gICAgICAgIGNhc2UgQUREX0ExOiByZXR1cm4gQUREX0ExX1NUUklORztcbiAgICAgICAgY2FzZSBBRERfQjA6IHJldHVybiBBRERfQjBfU1RSSU5HO1xuICAgICAgICBjYXNlIEFERF9CMTogcmV0dXJuIEFERF9CMV9TVFJJTkc7XG4gICAgfVxufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0ge0FkZE9wU3RyaW5nfSBvcFxuICogQHJldHVybnMge0FkZE9wfVxuICovXG5mdW5jdGlvbiBwYXJzZU9wKG9wKSB7XG4gICAgc3dpdGNoIChvcCkge1xuICAgICAgICBjYXNlIEFERF9BMV9TVFJJTkc6IHJldHVybiBBRERfQTE7XG4gICAgICAgIGNhc2UgQUREX0IwX1NUUklORzogcmV0dXJuIEFERF9CMDtcbiAgICAgICAgY2FzZSBBRERfQjFfU1RSSU5HOiByZXR1cm4gQUREX0IxO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBY3Rpb24gZm9yIGBBRERgXG4gKi9cbmV4cG9ydCBjbGFzcyBBZGRBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHtBZGRPcH0gb3BcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihvcCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7QWRkT3B9XG4gICAgICAgICAqIEByZWFkb25seVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5vcCA9IG9wO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHByZXR0eSgpIHtcbiAgICAgICAgcmV0dXJuIGAke0FERF9TVFJJTkd9ICR7cHJldHR5T3AodGhpcy5vcCl9YDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDmloflrZfliJfjgYvjgonlpInmj5vjgZnjgotcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gICAgICogQHJldHVybnMge0FkZEFjdGlvbiB8IHVuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBzdGF0aWMgcGFyc2Uoc3RyKSB7XG4gICAgICAgIGNvbnN0IGFycmF5ID0gc3RyLnRyaW0oKS5zcGxpdCgvXFxzKy91KTtcbiAgICAgICAgaWYgKGFycmF5Lmxlbmd0aCAhPT0gMikge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBbIGFkZCwgcmVnIF0gPSBhcnJheTtcbiAgICAgICAgaWYgKGFkZCAhPT0gQUREX1NUUklORykge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVnID09PSBBRERfQTFfU1RSSU5HIHx8IHJlZyA9PT0gQUREX0IwX1NUUklORyB8fCByZWcgPT09IEFERF9CMV9TVFJJTkcpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQWRkQWN0aW9uKHBhcnNlT3AocmVnKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBkb2VzUmV0dXJuVmFsdWUoKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5vcCkge1xuICAgICAgICAgICAgY2FzZSBBRERfQTE6IHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGNhc2UgQUREX0IwOiByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGNhc2UgQUREX0IxOiByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQG92ZXJyaWRlXG4gICAgICogQHBhcmFtIHtBY3Rpb259IGFjdGlvblxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzU2FtZUNvbXBvbmVudChhY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIGFjdGlvbiBpbnN0YW5jZW9mIEFkZEFjdGlvbjtcbiAgICB9XG59XG4iLCIvLyBAdHMtY2hlY2tcblxuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4vQWN0aW9uLmpzXCI7XG5cbmV4cG9ydCBjb25zdCBCMkRfSU5DID0gMDtcbmV4cG9ydCBjb25zdCBCMkRfVERFQyA9IDE7XG5leHBvcnQgY29uc3QgQjJEX1JFQUQgPSAyO1xuZXhwb3J0IGNvbnN0IEIyRF9TRVQgPSAzO1xuZXhwb3J0IGNvbnN0IEIyRF9CMkRYID0gNDtcbmV4cG9ydCBjb25zdCBCMkRfQjJEWSA9IDU7XG5leHBvcnQgY29uc3QgQjJEX0IyRCA9IDY7XG5cbi8qKlxuICogQHR5cGVkZWYge0IyRF9JTkMgfCBCMkRfVERFQyB8IEIyRF9SRUFEIHwgQjJEX1NFVH0gQjJET3BcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtCMkRfSU5DX1NUUklORyB8IEIyRF9UREVDX1NUUklORyB8XG4gKiAgICAgICAgICBCMkRfUkVBRF9TVFJJTkcgfCBCMkRfU0VUX1NUUklOR30gQjJET3BTdHJpbmdcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtCMkRfQjJEWCB8IEIyRF9CMkRZIHwgQjJEX0IyRH0gQjJEQXhpc1xuICovXG5cbi8qKlxuICogQHR5cGVkZWYge0IyRF9CMkRYX1NUUklORyB8IEIyRF9CMkRZX1NUUklORyB8IEIyRF9CMkRfU1RSSU5HfSBCMkRBeGlzU3RyaW5nXG4gKi9cblxuY29uc3QgQjJEX0lOQ19TVFJJTkcgPSBcIklOQ1wiO1xuY29uc3QgQjJEX1RERUNfU1RSSU5HID0gXCJUREVDXCI7XG5jb25zdCBCMkRfUkVBRF9TVFJJTkcgPSBcIlJFQURcIjtcbmNvbnN0IEIyRF9TRVRfU1RSSU5HID0gXCJTRVRcIjtcbmNvbnN0IEIyRF9CMkRYX1NUUklORyA9IFwiQjJEWFwiO1xuY29uc3QgQjJEX0IyRFlfU1RSSU5HID0gXCJCMkRZXCI7XG5jb25zdCBCMkRfQjJEX1NUUklORyA9IFwiQjJEXCI7XG5cbmNvbnN0IEIyRF9MRUdBQ1lfVERFQ19TVFJJTkcgPSBcIkRFQ1wiO1xuY29uc3QgQjJEX0xFR0FDWV9CMkRYX1NUUklORyA9IFwiU1FYXCI7XG5jb25zdCBCMkRfTEVHQUNZX0IyRFlfU1RSSU5HID0gXCJTUVlcIjtcbmNvbnN0IEIyRF9MRUdBQ1lfQjJEX1NUUklORyA9IFwiU1FcIjtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtCMkRPcFN0cmluZ30gb3BcbiAqIEByZXR1cm5zIHtCMkRPcH1cbiAqL1xuZnVuY3Rpb24gcGFyc2VPcChvcCkge1xuICAgIHN3aXRjaCAob3ApIHtcbiAgICAgICAgY2FzZSBCMkRfSU5DX1NUUklORzogcmV0dXJuIEIyRF9JTkM7XG4gICAgICAgIGNhc2UgQjJEX1RERUNfU1RSSU5HOiByZXR1cm4gQjJEX1RERUM7XG4gICAgICAgIGNhc2UgQjJEX1JFQURfU1RSSU5HOiByZXR1cm4gQjJEX1JFQUQ7XG4gICAgICAgIGNhc2UgQjJEX1NFVF9TVFJJTkc6IHJldHVybiBCMkRfU0VUO1xuICAgIH1cbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHtCMkRPcH0gb3BcbiAqIEByZXR1cm5zIHtCMkRPcFN0cmluZ31cbiAqL1xuZnVuY3Rpb24gcHJldHR5T3Aob3ApIHtcbiAgICBzd2l0Y2ggKG9wKSB7XG4gICAgICAgIGNhc2UgQjJEX0lOQzogcmV0dXJuIEIyRF9JTkNfU1RSSU5HO1xuICAgICAgICBjYXNlIEIyRF9UREVDOiByZXR1cm4gQjJEX1RERUNfU1RSSU5HO1xuICAgICAgICBjYXNlIEIyRF9SRUFEOiByZXR1cm4gQjJEX1JFQURfU1RSSU5HO1xuICAgICAgICBjYXNlIEIyRF9TRVQ6IHJldHVybiBCMkRfU0VUX1NUUklORztcbiAgICB9XG59XG4vKipcbiAqXG4gKiBAcGFyYW0ge0IyREF4aXNTdHJpbmd9IG9wXG4gKiBAcmV0dXJucyB7QjJEQXhpc31cbiAqL1xuZnVuY3Rpb24gcGFyc2VBeGlzKG9wKSB7XG4gICAgc3dpdGNoIChvcCkge1xuICAgICAgICBjYXNlIEIyRF9CMkRYX1NUUklORzogcmV0dXJuIEIyRF9CMkRYO1xuICAgICAgICBjYXNlIEIyRF9CMkRZX1NUUklORzogcmV0dXJuIEIyRF9CMkRZO1xuICAgICAgICBjYXNlIEIyRF9CMkRfU1RSSU5HOiByZXR1cm4gQjJEX0IyRDtcbiAgICB9XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7QjJEQXhpc30gb3BcbiAqIEByZXR1cm5zIHtCMkRBeGlzU3RyaW5nfVxuICovXG5mdW5jdGlvbiBwcmV0dHlBeGlzKG9wKSB7XG4gICAgc3dpdGNoIChvcCkge1xuICAgICAgICBjYXNlIEIyRF9CMkRYOiByZXR1cm4gQjJEX0IyRFhfU1RSSU5HO1xuICAgICAgICBjYXNlIEIyRF9CMkRZOiByZXR1cm4gQjJEX0IyRFlfU1RSSU5HO1xuICAgICAgICBjYXNlIEIyRF9CMkQ6IHJldHVybiBCMkRfQjJEX1NUUklORztcbiAgICB9XG59XG5cbi8qKlxuICogQWN0aW9uIGZvciBgQjJEYFxuICovXG5leHBvcnQgY2xhc3MgQjJEQWN0aW9uIGV4dGVuZHMgQWN0aW9uIHtcbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7QjJET3B9IG9wXG4gICAgICogQHBhcmFtIHtCMkRBeGlzfSBheGlzXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iob3AsIGF4aXMpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtCMkRPcH1cbiAgICAgICAgICogQHJlYWRvbmx5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm9wID0gb3A7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7QjJEQXhpc31cbiAgICAgICAgICogQHJlYWRvbmx5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmF4aXMgPSBheGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHByZXR0eSgpIHtcbiAgICAgICAgcmV0dXJuIGAke3ByZXR0eU9wKHRoaXMub3ApfSAke3ByZXR0eUF4aXModGhpcy5heGlzKX1gO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0clxuICAgICAqL1xuICAgIHN0YXRpYyBwYXJzZShzdHIpIHtcbiAgICAgICAgY29uc3QgYXJyYXkgPSBzdHIudHJpbSgpLnNwbGl0KC9cXHMrL3UpO1xuICAgICAgICBpZiAoYXJyYXkubGVuZ3RoICE9PSAyKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IFsgb3AsIGF4aXMgXSA9IGFycmF5O1xuICAgICAgICBpZiAob3AgPT09IHVuZGVmaW5lZCB8fCBheGlzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wID09PSBCMkRfSU5DX1NUUklORyB8fCBvcCA9PT0gQjJEX1RERUNfU1RSSU5HKSB7XG4gICAgICAgICAgICBpZiAoYXhpcyA9PT0gQjJEX0IyRFhfU1RSSU5HIHx8IGF4aXMgPT09IEIyRF9CMkRZX1NUUklORykge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQjJEQWN0aW9uKHBhcnNlT3Aob3ApLCBwYXJzZUF4aXMoYXhpcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKG9wID09PSBCMkRfUkVBRF9TVFJJTkcgfHwgb3AgPT09IEIyRF9TRVRfU1RSSU5HKSB7XG4gICAgICAgICAgICBpZiAoYXhpcyA9PT0gQjJEX0IyRF9TVFJJTkcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEIyREFjdGlvbihwYXJzZU9wKG9wKSwgcGFyc2VBeGlzKGF4aXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBBUEdzZW1ibHkgMS4wXG4gICAgICAgIHN3aXRjaCAob3ApIHtcbiAgICAgICAgICAgIGNhc2UgQjJEX0lOQ19TVFJJTkc6IHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGF4aXMpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBCMkRfTEVHQUNZX0IyRFhfU1RSSU5HOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBCMkRBY3Rpb24oQjJEX0lOQywgQjJEX0IyRFgpO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEIyRF9MRUdBQ1lfQjJEWV9TVFJJTkc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEIyREFjdGlvbihCMkRfSU5DLCBCMkRfQjJEWSk7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBCMkRfTEVHQUNZX1RERUNfU1RSSU5HOiB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChheGlzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQjJEX0xFR0FDWV9CMkRYX1NUUklORzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQjJEQWN0aW9uKEIyRF9UREVDLCBCMkRfQjJEWCk7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgQjJEX0xFR0FDWV9CMkRZX1NUUklORzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQjJEQWN0aW9uKEIyRF9UREVDLCBCMkRfQjJEWSk7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBCMkRfUkVBRF9TVFJJTkc6IHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGF4aXMpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBCMkRfTEVHQUNZX0IyRF9TVFJJTkc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEIyREFjdGlvbihCMkRfUkVBRCwgQjJEX0IyRCk7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBCMkRfU0VUX1NUUklORzoge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoYXhpcykge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEIyRF9MRUdBQ1lfQjJEX1NUUklORzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQjJEQWN0aW9uKEIyRF9TRVQsIEIyRF9CMkQpO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIGRvZXNSZXR1cm5WYWx1ZSgpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLm9wKSB7XG4gICAgICAgICAgICBjYXNlIEIyRF9JTkM6IHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGNhc2UgQjJEX1RERUM6IHJldHVybiB0cnVlO1xuICAgICAgICAgICAgY2FzZSBCMkRfUkVBRDogcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBjYXNlIEIyRF9TRVQ6IHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQG92ZXJyaWRlXG4gICAgICogQHBhcmFtIHtBY3Rpb259IGFjdGlvblxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzU2FtZUNvbXBvbmVudChhY3Rpb24pIHtcbiAgICAgICAgaWYgKGFjdGlvbiBpbnN0YW5jZW9mIEIyREFjdGlvbikge1xuICAgICAgICAgICAgaWYgKHRoaXMuYXhpcyA9PT0gQjJEX0IyRFggJiYgYWN0aW9uLmF4aXMgPT09IEIyRF9CMkRZKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmF4aXMgPT09IEIyRF9CMkRZICYmIGFjdGlvbi5heGlzID09PSBCMkRfQjJEWCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4iLCIvLyBAdHMtY2hlY2tcblxuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4vQWN0aW9uLmpzXCI7XG5cbmV4cG9ydCBjb25zdCBCX0lOQyA9IDA7XG5leHBvcnQgY29uc3QgQl9UREVDID0gMTtcbmV4cG9ydCBjb25zdCBCX1JFQUQgPSAyO1xuZXhwb3J0IGNvbnN0IEJfU0VUID0gMztcblxuY29uc3QgQl9JTkNfU1RSSU5HID0gXCJJTkNcIjtcbmNvbnN0IEJfVERFQ19TVFJJTkcgPSBcIlRERUNcIjtcbmNvbnN0IEJfUkVBRF9TVFJJTkcgPSBcIlJFQURcIjtcbmNvbnN0IEJfU0VUX1NUUklORyA9IFwiU0VUXCI7XG5cbmNvbnN0IEJfU1RSSU5HID0gXCJCXCI7XG5cbi8qKlxuICogQHR5cGVkZWYge0JfSU5DIHwgQl9UREVDIHwgQl9SRUFEIHwgQl9TRVR9IEJPcFxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge0JfSU5DX1NUUklORyB8IEJfVERFQ19TVFJJTkcgfFxuICogICAgICAgICAgQl9SRUFEX1NUUklORyB8IEJfU0VUX1NUUklOR30gQk9wU3RyaW5nXG4gKi9cblxuLyoqXG4gKlxuICogQHBhcmFtIHtCT3B9IG9wXG4gKiBAcmV0dXJucyB7Qk9wU3RyaW5nfVxuICovXG5mdW5jdGlvbiBwcmV0dHlPcChvcCkge1xuICAgIHN3aXRjaCAob3ApIHtcbiAgICAgICAgY2FzZSBCX0lOQzogcmV0dXJuIEJfSU5DX1NUUklORztcbiAgICAgICAgY2FzZSBCX1RERUM6IHJldHVybiBCX1RERUNfU1RSSU5HO1xuICAgICAgICBjYXNlIEJfUkVBRDogcmV0dXJuIEJfUkVBRF9TVFJJTkc7XG4gICAgICAgIGNhc2UgQl9TRVQ6IHJldHVybiBCX1NFVF9TVFJJTkc7XG4gICAgfVxufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0ge0JPcFN0cmluZ30gb3BcbiAqIEByZXR1cm5zIHtCT3B9XG4gKi9cbmZ1bmN0aW9uIHBhcnNlT3Aob3ApIHtcbiAgICBzd2l0Y2ggKG9wKSB7XG4gICAgICAgIGNhc2UgQl9JTkNfU1RSSU5HOiByZXR1cm4gQl9JTkM7XG4gICAgICAgIGNhc2UgQl9UREVDX1NUUklORzogcmV0dXJuIEJfVERFQztcbiAgICAgICAgY2FzZSBCX1JFQURfU1RSSU5HOiByZXR1cm4gQl9SRUFEO1xuICAgICAgICBjYXNlIEJfU0VUX1NUUklORzogcmV0dXJuIEJfU0VUO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBY3Rpb24gZm9yIGBCbmBcbiAqL1xuZXhwb3J0IGNsYXNzIEJSZWdBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHtCT3B9IG9wXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHJlZ051bWJlclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG9wLCByZWdOdW1iZXIpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge0JPcH1cbiAgICAgICAgICogQHJlYWRvbmx5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm9wID0gb3A7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZWFkb25seVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yZWdOdW1iZXIgPSByZWdOdW1iZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG92ZXJyaWRlXG4gICAgICogQHJldHVybnMge251bWJlcltdfVxuICAgICAqL1xuICAgIGV4dHJhY3RCaW5hcnlSZWdpc3Rlck51bWJlcnMoKSB7XG4gICAgICAgIHJldHVybiBbdGhpcy5yZWdOdW1iZXJdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHByZXR0eSgpIHtcbiAgICAgICAgcmV0dXJuIGAke3ByZXR0eU9wKHRoaXMub3ApfSAke0JfU1RSSU5HfSR7dGhpcy5yZWdOdW1iZXJ9YDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gICAgICogQHJldHVybnMge0JSZWdBY3Rpb24gfCB1bmRlZmluZWR9XG4gICAgICovXG4gICAgc3RhdGljIHBhcnNlKHN0cikge1xuICAgICAgICBjb25zdCBhcnJheSA9IHN0ci50cmltKCkuc3BsaXQoL1xccysvdSk7XG4gICAgICAgIGlmIChhcnJheS5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgWyBvcCwgcmVnIF0gPSBhcnJheTtcbiAgICAgICAgaWYgKG9wID09PSB1bmRlZmluZWQgfHwgcmVnID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wID09PSBCX0lOQ19TVFJJTkcgfHwgb3AgPT09IEJfVERFQ19TVFJJTkcgfHxcbiAgICAgICAgICAgIG9wID09PSBCX1JFQURfU1RSSU5HIHx8IG9wID09PSBCX1NFVF9TVFJJTkcpIHtcbiAgICAgICAgICAgIGlmIChyZWcuc3RhcnRzV2l0aChCX1NUUklORykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdHIgPSByZWcuc2xpY2UoMSk7XG4gICAgICAgICAgICAgICAgaWYgKC9eWzAtOV0rJC91LnRlc3Qoc3RyKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEJSZWdBY3Rpb24ocGFyc2VPcChvcCksIHBhcnNlSW50KHN0ciwgMTApKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBkb2VzUmV0dXJuVmFsdWUoKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5vcCkge1xuICAgICAgICAgICAgY2FzZSBCX0lOQzogcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgY2FzZSBCX1RERUM6IHJldHVybiB0cnVlO1xuICAgICAgICAgICAgY2FzZSBCX1JFQUQ6IHJldHVybiB0cnVlO1xuICAgICAgICAgICAgY2FzZSBCX1NFVDogcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKiBAcGFyYW0ge0FjdGlvbn0gYWN0aW9uXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNTYW1lQ29tcG9uZW50KGFjdGlvbikge1xuICAgICAgICBpZiAoYWN0aW9uIGluc3RhbmNlb2YgQlJlZ0FjdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVnTnVtYmVyID09PSBhY3Rpb24ucmVnTnVtYmVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8gQHRzLWNoZWNrXG5cbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuL0FjdGlvbi5qc1wiO1xuXG5leHBvcnQgY29uc3QgTVVMXzAgPSAwO1xuZXhwb3J0IGNvbnN0IE1VTF8xID0gMTtcblxuY29uc3QgTVVMXzBfU1RSSU5HID0gXCIwXCI7XG5jb25zdCBNVUxfMV9TVFJJTkcgPSBcIjFcIjtcblxuY29uc3QgTVVMX1NUUklORyA9IFwiTVVMXCI7XG5cbi8qKlxuICogQHR5cGVkZWYge01VTF8wIHwgTVVMXzF9IE11bE9wXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7TVVMXzBfU1RSSU5HIHwgTVVMXzFfU1RSSU5HfSBNdWxPcFN0cmluZ1xuICovXG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7TXVsT3BTdHJpbmd9IG9wXG4gKiBAcmV0dXJucyB7TXVsT3B9XG4gKi9cbmZ1bmN0aW9uIHBhcnNlT3Aob3ApIHtcbiAgICBzd2l0Y2ggKG9wKSB7XG4gICAgICAgIGNhc2UgTVVMXzBfU1RSSU5HOiByZXR1cm4gTVVMXzA7XG4gICAgICAgIGNhc2UgTVVMXzFfU1RSSU5HOiByZXR1cm4gTVVMXzE7XG4gICAgfVxufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0ge011bE9wfSBvcFxuICogQHJldHVybnMge011bE9wU3RyaW5nfVxuICovXG5mdW5jdGlvbiBwcmV0dHlPcChvcCkge1xuICAgIHN3aXRjaCAob3ApIHtcbiAgICAgICAgY2FzZSBNVUxfMDogcmV0dXJuIE1VTF8wX1NUUklORztcbiAgICAgICAgY2FzZSBNVUxfMTogcmV0dXJuIE1VTF8xX1NUUklORztcbiAgICB9XG59XG5cbi8qKlxuICogQWN0aW9uIGZvciBgTVVMYFxuICovXG5leHBvcnQgY2xhc3MgTXVsQWN0aW9uIGV4dGVuZHMgQWN0aW9uIHtcbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TXVsT3B9IG9wXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iob3ApIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge011bE9wfVxuICAgICAgICAgKiBAcmVhZG9ubHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMub3AgPSBvcDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBwcmV0dHkoKSB7XG4gICAgICAgIHJldHVybiBgJHtNVUxfU1RSSU5HfSAke3ByZXR0eU9wKHRoaXMub3ApfWA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gICAgICogQHJldHVybnMge011bEFjdGlvbiB8IHVuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBzdGF0aWMgcGFyc2Uoc3RyKSB7XG4gICAgICAgIGNvbnN0IGFycmF5ID0gc3RyLnRyaW0oKS5zcGxpdCgvXFxzKy91KTtcbiAgICAgICAgaWYgKGFycmF5Lmxlbmd0aCAhPT0gMikge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IFsgbXVsLCBvcCBdID0gYXJyYXk7XG4gICAgICAgIGlmIChtdWwgIT09IE1VTF9TVFJJTkcpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3AgPT09IE1VTF8wX1NUUklORyB8fCBvcCA9PT0gTVVMXzFfU1RSSU5HKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IE11bEFjdGlvbihwYXJzZU9wKG9wKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIGRvZXNSZXR1cm5WYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKiBAcGFyYW0ge0FjdGlvbn0gYWN0aW9uXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNTYW1lQ29tcG9uZW50KGFjdGlvbikge1xuICAgICAgICByZXR1cm4gYWN0aW9uIGluc3RhbmNlb2YgTXVsQWN0aW9uO1xuICAgIH1cbn1cbiIsIi8vIEB0cy1jaGVja1xuXG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi9BY3Rpb24uanNcIjtcblxuY29uc3QgT1VUUFVUX1NUUklORyA9IFwiT1VUUFVUXCI7XG5cbmV4cG9ydCBjbGFzcyBPdXRwdXRBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRpZ2l0XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZGlnaXQpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHJlYWRvbmx5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRpZ2l0ID0gZGlnaXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG92ZXJyaWRlXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwcmV0dHkoKSB7XG4gICAgICAgIHJldHVybiBgJHtPVVRQVVRfU1RSSU5HfSAke3RoaXMuZGlnaXR9YDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcbiAgICAgKiBAcmV0dXJucyB7T3V0cHV0QWN0aW9uIHwgdW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHN0YXRpYyBwYXJzZShzdHIpIHtcbiAgICAgICAgY29uc3QgYXJyYXkgPSBzdHIudHJpbSgpLnNwbGl0KC9cXHMrL3UpO1xuICAgICAgICBpZiAoYXJyYXkubGVuZ3RoICE9PSAyKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IFsgb3V0cHV0LCBkaWdpdCBdID0gYXJyYXk7XG4gICAgICAgIGlmIChvdXRwdXQgIT09IE9VVFBVVF9TVFJJTkcpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRpZ2l0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBPdXRwdXRBY3Rpb24oZGlnaXQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIGRvZXNSZXR1cm5WYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQG92ZXJyaWRlXG4gICAgICogQHBhcmFtIHtBY3Rpb259IGFjdGlvblxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzU2FtZUNvbXBvbmVudChhY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIGFjdGlvbiBpbnN0YW5jZW9mIE91dHB1dEFjdGlvbjtcbiAgICB9XG59XG4iLCIvLyBAdHMtY2hlY2tcblxuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4vQWN0aW9uLmpzXCI7XG5cbmV4cG9ydCBjb25zdCBTVUJfQTEgPSAwO1xuZXhwb3J0IGNvbnN0IFNVQl9CMCA9IDE7XG5leHBvcnQgY29uc3QgU1VCX0IxID0gMjtcblxuY29uc3QgU1VCX0ExX1NUUklORyA9IFwiQTFcIjtcbmNvbnN0IFNVQl9CMF9TVFJJTkcgPSBcIkIwXCI7XG5jb25zdCBTVUJfQjFfU1RSSU5HID0gXCJCMVwiO1xuXG5jb25zdCBTVUJfU1RSSU5HID0gXCJTVUJcIjtcblxuLyoqXG4gKiBAdHlwZWRlZiB7U1VCX0ExIHwgU1VCX0IwIHwgU1VCX0IxfSBTdWJPcFxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge1NVQl9BMV9TVFJJTkcgfCBTVUJfQjBfU1RSSU5HIHwgU1VCX0IxX1NUUklOR30gU3ViT3BTdHJpbmdcbiAqL1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge1N1Yk9wfSBvcFxuICogQHJldHVybnMge1N1Yk9wU3RyaW5nfVxuICovXG5mdW5jdGlvbiBwcmV0dHlPcChvcCkge1xuICAgIHN3aXRjaCAob3ApIHtcbiAgICAgICAgY2FzZSBTVUJfQTE6IHJldHVybiBTVUJfQTFfU1RSSU5HO1xuICAgICAgICBjYXNlIFNVQl9CMDogcmV0dXJuIFNVQl9CMF9TVFJJTkc7XG4gICAgICAgIGNhc2UgU1VCX0IxOiByZXR1cm4gU1VCX0IxX1NUUklORztcbiAgICB9XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7U3ViT3BTdHJpbmd9IG9wXG4gKiBAcmV0dXJucyB7U3ViT3B9XG4gKi9cbiBmdW5jdGlvbiBwYXJzZU9wKG9wKSB7XG4gICAgc3dpdGNoIChvcCkge1xuICAgICAgICBjYXNlIFNVQl9BMV9TVFJJTkc6IHJldHVybiBTVUJfQTE7XG4gICAgICAgIGNhc2UgU1VCX0IwX1NUUklORzogcmV0dXJuIFNVQl9CMDtcbiAgICAgICAgY2FzZSBTVUJfQjFfU1RSSU5HOiByZXR1cm4gU1VCX0IxO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBY3Rpb24gZm9yIGBTVUJgXG4gKi9cbmV4cG9ydCBjbGFzcyBTdWJBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdWJPcH0gb3BcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihvcCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7U3ViT3B9XG4gICAgICAgICAqIEByZWFkb25seVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5vcCA9IG9wO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIHByZXR0eSgpIHtcbiAgICAgICAgcmV0dXJuIGAke1NVQl9TVFJJTkd9ICR7cHJldHR5T3AodGhpcy5vcCl9YDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcbiAgICAgKiBAcmV0dXJucyB7U3ViQWN0aW9uIHwgdW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHN0YXRpYyBwYXJzZShzdHIpIHtcbiAgICAgICAgY29uc3QgYXJyYXkgPSBzdHIudHJpbSgpLnNwbGl0KC9cXHMrL3UpO1xuICAgICAgICBpZiAoYXJyYXkubGVuZ3RoICE9PSAyKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgWyBzdWIsIHJlZyBdID0gYXJyYXk7XG4gICAgICAgIGlmIChzdWIgIT09IFNVQl9TVFJJTkcpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVnID09PSBTVUJfQTFfU1RSSU5HIHx8IHJlZyA9PT0gU1VCX0IwX1NUUklORyB8fCByZWcgPT09IFNVQl9CMV9TVFJJTkcpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgU3ViQWN0aW9uKHBhcnNlT3AocmVnKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHJldHVybnMgQG92ZXJyaWRlXG4gICAgICovXG4gICAgZG9lc1JldHVyblZhbHVlKCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMub3ApIHtcbiAgICAgICAgICAgIGNhc2UgU1VCX0ExOiByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBjYXNlIFNVQl9CMDogcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBjYXNlIFNVQl9CMTogcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBvdmVycmlkZVxuICAgICAqIEBwYXJhbSB7QWN0aW9ufSBhY3Rpb25cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1NhbWVDb21wb25lbnQoYWN0aW9uKSB7XG4gICAgICAgIHJldHVybiBhY3Rpb24gaW5zdGFuY2VvZiBTdWJBY3Rpb247XG4gICAgfVxufVxuIiwiLy8gQHRzLWNoZWNrXG5cbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuL0FjdGlvbi5qc1wiO1xuXG5leHBvcnQgY29uc3QgVV9JTkMgPSAwO1xuZXhwb3J0IGNvbnN0IFVfVERFQyA9IDE7XG5cbmNvbnN0IFVfSU5DX1NUUklORyA9IFwiSU5DXCI7XG5jb25zdCBVX1RERUNfU1RSSU5HID0gXCJUREVDXCI7XG5cbmNvbnN0IFVfU1RSSU5HID0gXCJVXCI7XG5jb25zdCBSX1NUUklORyA9IFwiUlwiO1xuXG4vKipcbiAqIEB0eXBlZGVmIHtVX0lOQyB8IFVfVERFQ30gVU9wXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7VV9JTkNfU1RSSU5HIHwgVV9UREVDX1NUUklOR30gVU9wU3RyaW5nXG4gKi9cblxuLyoqXG4gKlxuICogQHBhcmFtIHtVT3B9IG9wXG4gKiBAcmV0dXJucyB7VU9wU3RyaW5nfVxuICovXG5mdW5jdGlvbiBwcmV0dHlPcChvcCkge1xuICAgIHN3aXRjaCAob3ApIHtcbiAgICAgICAgY2FzZSBVX0lOQzogcmV0dXJuIFVfSU5DX1NUUklORztcbiAgICAgICAgY2FzZSBVX1RERUM6IHJldHVybiBVX1RERUNfU1RSSU5HO1xuICAgIH1cbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHtVT3BTdHJpbmd9IG9wXG4gKiBAcmV0dXJucyB7VU9wfVxuICovXG5mdW5jdGlvbiBwYXJzZU9wKG9wKSB7XG4gICAgc3dpdGNoIChvcCkge1xuICAgICAgICBjYXNlIFVfSU5DX1NUUklORzogcmV0dXJuIFVfSU5DO1xuICAgICAgICBjYXNlIFVfVERFQ19TVFJJTkc6IHJldHVybiBVX1RERUM7XG4gICAgfVxufVxuXG4vKipcbiAqIEFjdGlvbiBmb3IgYFVuYFxuICovXG5leHBvcnQgY2xhc3MgVVJlZ0FjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1VPcH0gb3BcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcmVnTnVtYmVyXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iob3AsIHJlZ051bWJlcikge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAdHlwZSB7VU9wfVxuICAgICAgICAgKiBAcmVhZG9ubHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMub3AgPSBvcDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHJlYWRvbmx5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnJlZ051bWJlciA9IHJlZ051bWJlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyW119XG4gICAgICovXG4gICAgZXh0cmFjdFVuYXJ5UmVnaXN0ZXJOdW1iZXJzKCkge1xuICAgICAgICByZXR1cm4gW3RoaXMucmVnTnVtYmVyXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBwcmV0dHkoKSB7XG4gICAgICAgIHJldHVybiBgJHtwcmV0dHlPcCh0aGlzLm9wKX0gJHtVX1NUUklOR30ke3RoaXMucmVnTnVtYmVyfWA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gICAgICogQHJldHVybnMge1VSZWdBY3Rpb24gfCB1bmRlZmluZWR9XG4gICAgICovXG4gICAgc3RhdGljIHBhcnNlKHN0cikge1xuICAgICAgICBjb25zdCBhcnJheSA9IHN0ci50cmltKCkuc3BsaXQoL1xccysvdSk7XG4gICAgICAgIGlmIChhcnJheS5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBbIG9wLCByZWcgXSA9IGFycmF5O1xuICAgICAgICBpZiAob3AgPT09IHVuZGVmaW5lZCB8fCByZWcgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcCA9PT0gVV9JTkNfU1RSSU5HIHx8IG9wID09PSBVX1RERUNfU1RSSU5HKSB7XG4gICAgICAgICAgICAvLyBSIGZvciBBUEdzZW1ibHkgMS4wXG4gICAgICAgICAgICBpZiAocmVnLnN0YXJ0c1dpdGgoVV9TVFJJTkcpIHx8IHJlZy5zdGFydHNXaXRoKFJfU1RSSU5HKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0ciA9IHJlZy5zbGljZSgxKTtcbiAgICAgICAgICAgICAgICBpZiAoL15bMC05XSskL3UudGVzdChzdHIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVVJlZ0FjdGlvbihwYXJzZU9wKG9wKSwgcGFyc2VJbnQoc3RyLCAxMCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgZG9lc1JldHVyblZhbHVlKCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMub3ApIHtcbiAgICAgICAgICAgIGNhc2UgVV9JTkM6IHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGNhc2UgVV9UREVDOiByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQG92ZXJyaWRlXG4gICAgICogQHBhcmFtIHtBY3Rpb259IGFjdGlvblxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGlzU2FtZUNvbXBvbmVudChhY3Rpb24pIHtcbiAgICAgICAgaWYgKGFjdGlvbiBpbnN0YW5jZW9mIFVSZWdBY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlZ051bWJlciA9PT0gYWN0aW9uLnJlZ051bWJlcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vIEB0cy1jaGVja1xuXG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi9BY3Rpb24uanNcIjtcblxuZXhwb3J0IGNvbnN0IFRfSU5DID0gMDtcbmV4cG9ydCBjb25zdCBUX0RFQyA9IDE7XG5leHBvcnQgY29uc3QgVF9SRUFEID0gMjtcbmV4cG9ydCBjb25zdCBUX1NFVCA9IDM7XG5leHBvcnQgY29uc3QgVF9SRVNFVCA9IDQ7XG5cbmNvbnN0IFRfSU5DX1NUUklORyA9IFwiSU5DXCI7XG5jb25zdCBUX0RFQ19TVFJJTkcgPSBcIkRFQ1wiO1xuY29uc3QgVF9SRUFEX1NUUklORyA9IFwiUkVBRFwiO1xuY29uc3QgVF9TRVRfU1RSSU5HID0gXCJTRVRcIjtcbmNvbnN0IFRfUkVTRVRfU1RSSU5HID0gXCJSRVNFVFwiO1xuXG4vKipcbiAqIEB0eXBlZGVmIHtUX0lOQyB8IFRfREVDIHwgVF9SRUFEIHwgVF9TRVQgfCBUX1JFU0VUfSBUT3BcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtUX0lOQ19TVFJJTkcgfCBUX0RFQ19TVFJJTkcgfFxuICogICAgICAgICAgVF9SRUFEX1NUUklORyB8IFRfU0VUX1NUUklORyB8IFRfUkVTRVRfU1RSSU5HfSBUT3BTdHJpbmdcbiAqL1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge1RPcH0gb3BcbiAqIEByZXR1cm5zIHtUT3BTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHByZXR0eU9wKG9wKSB7XG4gICAgc3dpdGNoIChvcCkge1xuICAgICAgICBjYXNlIFRfSU5DOiByZXR1cm4gVF9JTkNfU1RSSU5HO1xuICAgICAgICBjYXNlIFRfREVDOiByZXR1cm4gVF9ERUNfU1RSSU5HO1xuICAgICAgICBjYXNlIFRfUkVBRDogcmV0dXJuIFRfUkVBRF9TVFJJTkc7XG4gICAgICAgIGNhc2UgVF9TRVQ6IHJldHVybiBUX1NFVF9TVFJJTkc7XG4gICAgICAgIGNhc2UgVF9SRVNFVDogcmV0dXJuIFRfUkVTRVRfU1RSSU5HO1xuICAgIH1cbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHtUT3BTdHJpbmd9IG9wXG4gKiBAcmV0dXJucyB7VE9wfVxuICovXG5mdW5jdGlvbiBwYXJzZU9wKG9wKSB7XG4gICAgc3dpdGNoIChvcCkge1xuICAgICAgICBjYXNlIFRfSU5DX1NUUklORzogcmV0dXJuIFRfSU5DO1xuICAgICAgICBjYXNlIFRfREVDX1NUUklORzogcmV0dXJuIFRfREVDO1xuICAgICAgICBjYXNlIFRfUkVBRF9TVFJJTkc6IHJldHVybiBUX1JFQUQ7XG4gICAgICAgIGNhc2UgVF9TRVRfU1RSSU5HOiByZXR1cm4gVF9TRVQ7XG4gICAgICAgIGNhc2UgVF9SRVNFVF9TVFJJTkc6IHJldHVybiBUX1JFU0VUO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBY3Rpb24gZm9yIGBUbmBcbiAqL1xuZXhwb3J0IGNsYXNzIExlZ2FjeVRSZWdBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHtUT3B9IG9wXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHJlZ051bWJlclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG9wLCByZWdOdW1iZXIpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge1RPcH1cbiAgICAgICAgICogQHJlYWRvbmx5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm9wID0gb3A7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZWFkb25seVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yZWdOdW1iZXIgPSByZWdOdW1iZXI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG92ZXJyaWRlXG4gICAgICogQHJldHVybnMge251bWJlcltdfVxuICAgICAqL1xuICAgIGV4dHJhY3RMZWdhY3lUUmVnaXN0ZXJOdW1iZXJzKCkge1xuICAgICAgICByZXR1cm4gW3RoaXMucmVnTnVtYmVyXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBwcmV0dHkoKSB7XG4gICAgICAgIHJldHVybiBgJHtwcmV0dHlPcCh0aGlzLm9wKX0gVCR7dGhpcy5yZWdOdW1iZXJ9YDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gICAgICogQHJldHVybnMge0xlZ2FjeVRSZWdBY3Rpb24gfCB1bmRlZmluZWR9XG4gICAgICovXG4gICAgc3RhdGljIHBhcnNlKHN0cikge1xuICAgICAgICBjb25zdCBhcnJheSA9IHN0ci50cmltKCkuc3BsaXQoL1xccysvdSk7XG4gICAgICAgIGlmIChhcnJheS5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgWyBvcCwgcmVnIF0gPSBhcnJheTtcbiAgICAgICAgaWYgKG9wID09PSB1bmRlZmluZWQgfHwgcmVnID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wID09PSBUX0lOQ19TVFJJTkcgfHwgb3AgPT09IFRfREVDX1NUUklORyB8fFxuICAgICAgICAgICAgb3AgPT09IFRfUkVBRF9TVFJJTkcgfHwgb3AgPT09IFRfU0VUX1NUUklORyB8fCBvcCA9PT0gVF9SRVNFVF9TVFJJTkcpIHtcbiAgICAgICAgICAgIGlmIChyZWcuc3RhcnRzV2l0aChcIlRcIikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdHIgPSByZWcuc2xpY2UoMSk7XG4gICAgICAgICAgICAgICAgaWYgKC9eWzAtOV0rJC91LnRlc3Qoc3RyKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IExlZ2FjeVRSZWdBY3Rpb24ocGFyc2VPcChvcCksIHBhcnNlSW50KHN0ciwgMTApKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBkb2VzUmV0dXJuVmFsdWUoKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5vcCkge1xuICAgICAgICAgICAgY2FzZSBUX0lOQzogcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBjYXNlIFRfREVDOiByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGNhc2UgVF9SRUFEOiByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGNhc2UgVF9TRVQ6IHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGNhc2UgVF9SRVNFVDogcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKiBAcGFyYW0ge0FjdGlvbn0gYWN0aW9uXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNTYW1lQ29tcG9uZW50KGFjdGlvbikge1xuICAgICAgICBpZiAoYWN0aW9uIGluc3RhbmNlb2YgTGVnYWN5VFJlZ0FjdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVnTnVtYmVyID09PSBhY3Rpb24ucmVnTnVtYmVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8gQHRzLWNoZWNrXG5cbmltcG9ydCB7XG4gICAgQlJlZ0FjdGlvbixcbiAgICBCX0lOQyxcbiAgICBCX1RERUMsXG4gICAgQl9TRVQsXG4gICAgQl9SRUFEXG59IGZyb20gXCIuLi9hY3Rpb25zL0JSZWdBY3Rpb24uanNcIjtcblxuLyoqXG4gKiDjg5DjgqTjg4rjg6rjga7mloflrZfliJfjgpIw44GoMeOBrumFjeWIl+OBq+WkieaPm+OBmeOCi1xuICogQHBhcmFtIHtzdHJpbmd9IHN0ciAnMDEwMTExMDEnXG4gKiBAcmV0dXJucyB7KDAgfCAxKVtdfVxuICogQHRocm93c1xuICovXG5mdW5jdGlvbiBwYXJzZUJpdHMoc3RyKSB7XG4gICAgcmV0dXJuIFsuLi5zdHJdLm1hcChjID0+IHtcbiAgICAgICAgaWYgKGMgPT09ICcwJykge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gJzEnKSB7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKGBJbnZhbGlkICNSRUdJU1RFUlM6IFwiJHtzdHJ9XCJgKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5jb25zdCBoYXNCaWdJbnQgPSB0eXBlb2YgQmlnSW50ICE9PSAndW5kZWZpbmVkJztcblxuLyoqXG4gKiBCbjogQmluYXJ5IFJlZ2lzdGVyXG4gKi9cbmV4cG9ydCBjbGFzcyBCUmVnIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgLy8gaW52YXJpYW50OiB0aGlzLnBvaW50ZXIgPCB0aGlzLmJpdHMubGVuZ3RoXG4gICAgICAgIHRoaXMucG9pbnRlciA9IDA7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEB0eXBlIHsoMCB8IDEpW119XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmJpdHMgPSBbMF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0JSZWdBY3Rpb259IGFjdFxuICAgICAqIEByZXR1cm5zIHswIHwgMSB8IHZvaWR9XG4gICAgICovXG4gICAgYWN0aW9uKGFjdCkge1xuICAgICAgICAvLyBpZiAodGhpcy5wb2ludGVyID49IHRoaXMuYml0cy5sZW5ndGgpIHtcbiAgICAgICAgLy8gICAgIHRocm93IEVycm9yKCdmYWlsZWQnKTtcbiAgICAgICAgLy8gfVxuICAgICAgICBzd2l0Y2ggKGFjdC5vcCkge1xuICAgICAgICAgICAgLy8gSU5DICAzMjA3NTAyXG4gICAgICAgICAgICAvLyBUREVDIDMyMTc1MDJcbiAgICAgICAgICAgIC8vIFJFQUQgMzE3NTM0NFxuICAgICAgICAgICAgLy8gU0VUICAgNDA2ODQ0XG4gICAgICAgICAgICBjYXNlIEJfVERFQzogcmV0dXJuIHRoaXMudGRlYygpO1xuICAgICAgICAgICAgY2FzZSBCX0lOQzogcmV0dXJuIHRoaXMuaW5jKCk7XG4gICAgICAgICAgICBjYXNlIEJfUkVBRDogcmV0dXJuIHRoaXMucmVhZCgpO1xuICAgICAgICAgICAgY2FzZSBCX1NFVDogcmV0dXJuIHRoaXMuc2V0KCk7XG4gICAgICAgICAgICBkZWZhdWx0OiB0aHJvdyBFcnJvcignQlJlZyBhY3Rpb246ICcgKyBhY3Qub3ApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMgeygwIHwgMSlbXX1cbiAgICAgKi9cbiAgICBnZXRCaXRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5iaXRzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHsoMCB8IDEpW119IGJpdHNcbiAgICAgKi9cbiAgICBzZXRCaXRzKGJpdHMpIHtcbiAgICAgICAgdGhpcy5iaXRzID0gYml0cztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBgSU5DIEJuYFxuICAgICAqIEByZXR1cm5zIHt2b2lkfVxuICAgICAqL1xuICAgIGluYygpIHtcbiAgICAgICAgdGhpcy5wb2ludGVyKys7XG4gICAgICAgIC8vIHVzaW5nIGludmFyaWFudFxuICAgICAgICBpZiAodGhpcy5wb2ludGVyID09PSB0aGlzLmJpdHMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmJpdHMucHVzaCgwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGBUREVDIEJuYFxuICAgICAqIEByZXR1cm5zIHswIHwgMX1cbiAgICAgKi9cbiAgICB0ZGVjKCkge1xuICAgICAgICBpZiAodGhpcy5wb2ludGVyID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucG9pbnRlci0tO1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBgUkVBRCBCbmBcbiAgICAgKiBAcmV0dXJucyB7MCB8IDF9XG4gICAgICovXG4gICAgcmVhZCgpIHtcbiAgICAgICAgY29uc3QgcG9pbnRlciA9IHRoaXMucG9pbnRlcjtcbiAgICAgICAgY29uc3QgYml0cyA9IHRoaXMuYml0cztcbiAgICAgICAgaWYgKHBvaW50ZXIgPCBiaXRzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBiaXRzW3BvaW50ZXJdID8/IHRoaXMuZXJyb3IoKTtcbiAgICAgICAgICAgIGJpdHNbcG9pbnRlcl0gPSAwO1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBgU0VUIEJuYFxuICAgICAqIEByZXR1cm5zIHt2b2lkfVxuICAgICAqL1xuICAgIHNldCgpIHtcbiAgICAgICAgY29uc3QgYml0cyA9IHRoaXMuYml0cztcbiAgICAgICAgY29uc3QgcG9pbnRlciA9IHRoaXMucG9pbnRlcjtcbiAgICAgICAgaWYgKHBvaW50ZXIgPj0gYml0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuZXh0ZW5kKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmFsdWUgPSBiaXRzW3BvaW50ZXJdO1xuICAgICAgICBpZiAodmFsdWUgPT09IDEpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgICAgICAgICdUaGUgYml0IG9mIGJpbmFyeSByZWdpc3RlciBpcyBhbHJlYWR5IDE6IGJpdHMgPSAnICtcbiAgICAgICAgICAgICAgICBiaXRzLmpvaW4oJycpICsgXCIsIHBvaW50ZXIgPSBcIiArIHBvaW50ZXJcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgYml0c1twb2ludGVyXSA9IDE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog44Od44Kk44Oz44K/44O844Gu56+E5Zuy44G+44Gn44Oh44Oi44Oq44KS5bqD44GS44KLXG4gICAgICovXG4gICAgZXh0ZW5kKCkge1xuICAgICAgICBjb25zdCBwb2ludGVyID0gdGhpcy5wb2ludGVyO1xuICAgICAgICBjb25zdCBsZW4gPSB0aGlzLmJpdHMubGVuZ3RoO1xuICAgICAgICBpZiAocG9pbnRlciA+PSBsZW4pIHtcbiAgICAgICAgICAgIGlmIChwb2ludGVyID09PSBsZW4pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJpdHMucHVzaCgwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogQHR5cGUgezBbXX1cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBjb25zdCByZXN0ID0gQXJyYXkocG9pbnRlciAtIGxlbiArIDEpLmZpbGwoMCkubWFwKCgpID0+IDApO1xuICAgICAgICAgICAgICAgIHRoaXMuYml0cy5wdXNoKC4uLnJlc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcmV0dXJucyB7bmV2ZXJ9XG4gICAgICovXG4gICAgZXJyb3IoKSB7XG4gICAgICAgIHRocm93IEVycm9yKCdlcnJvcicpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICB0b0JpbmFyeVN0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Qml0cygpLnNsaWNlKCkucmV2ZXJzZSgpLmpvaW4oXCJcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtiYXNlXSBkZWZhdWx0IGlzIDEwXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0b1N0cmluZyhiYXNlID0gMTApIHtcbiAgICAgICAgaWYgKGhhc0JpZ0ludCkge1xuICAgICAgICAgICAgcmV0dXJuIEJpZ0ludChcIjBiXCIgKyB0aGlzLnRvQmluYXJ5U3RyaW5nKCkpLnRvU3RyaW5nKGJhc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIE51bWJlcihcIjBiXCIgKyB0aGlzLnRvQmluYXJ5U3RyaW5nKCkpLnRvU3RyaW5nKGJhc2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5Y2B6YCy5pWwXG4gICAgICogQHJldHVybnMge3N0cmluZ30gXCIxMjNcIlxuICAgICAqL1xuICAgIHRvRGVjaW1hbFN0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAxNumAsuaVsFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFwiRkZcIlxuICAgICAqL1xuICAgIHRvSGV4U3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50b1N0cmluZygxNik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcHJlZml444Goc3VmZml444GMc2xpY2XjgZXjgozjgabjgYTjgovjgZPjgajjga/kv53oqLzjgZnjgotcbiAgICAgKiBAcmV0dXJucyB7e1xuICAgICAgICBwcmVmaXg6ICgwIHwgMSlbXTtcbiAgICAgICAgaGVhZDogMCB8IDE7XG4gICAgICAgIHN1ZmZpeDogKDAgfCAxKVtdO1xuICAgIH19XG4gICAgICovXG4gICAgdG9PYmplY3QoKSB7XG4gICAgICAgIHRoaXMuZXh0ZW5kKCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwcmVmaXg6IHRoaXMuYml0cy5zbGljZSgwLCB0aGlzLnBvaW50ZXIpLFxuICAgICAgICAgICAgaGVhZDogdGhpcy5iaXRzW3RoaXMucG9pbnRlcl0gPz8gdGhpcy5lcnJvcigpLFxuICAgICAgICAgICAgc3VmZml4OiB0aGlzLmJpdHMuc2xpY2UodGhpcy5wb2ludGVyICsgMSksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gICAgICogQHBhcmFtIHt1bmtub3dufSB2YWx1ZVxuICAgICAqL1xuICAgIHNldEJ5UmVnaXN0ZXJzSW5pdChrZXksIHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IGRlYnVnU3RyID0gYFwiJHtrZXl9XCI6ICR7SlNPTi5zdHJpbmdpZnkodmFsdWUpfWA7XG4gICAgICAgIC8vIOaVsOWtl+OBruWgtOWQiOOBruWHpueQhuOBr+aVsOWtl+OCkuODkOOCpOODiuODquOBq+OBl+OBpumFjee9ruOBmeOCiyBUT0RPIOW/heimgeOBi+eiuuiqjVxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgdGhpcy5zZXRCaXRzKHBhcnNlQml0cyh2YWx1ZS50b1N0cmluZygyKSkucmV2ZXJzZSgpKTtcbiAgICAgICAgICAgIHRoaXMuZXh0ZW5kKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcihgSW52YWxpZCAjUkVHSVNURVJTICR7ZGVidWdTdHJ9YCk7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWUubGVuZ3RoICE9PSAyKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcihgSW52YWxpZCAjUkVHSVNURVJTICR7ZGVidWdTdHJ9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvKiogQHR5cGUge3Vua25vd259ICovXG4gICAgICAgICAgICBjb25zdCB2YWx1ZTAgPSB2YWx1ZVswXTtcbiAgICAgICAgICAgIC8qKiBAdHlwZSB7dW5rbm93bn0gKi9cbiAgICAgICAgICAgIGNvbnN0IHZhbHVlMSA9IHZhbHVlWzFdO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZTAgIT09ICdudW1iZXInIHx8IHR5cGVvZiB2YWx1ZTEgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoYEludmFsaWQgI1JFR0lTVEVSUyAke2RlYnVnU3RyfWApO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZTAgPCAwIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlMCkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcihgSW52YWxpZCAjUkVHSVNURVJTICR7ZGVidWdTdHJ9YCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucG9pbnRlciA9IHZhbHVlMDtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEJpdHMocGFyc2VCaXRzKHZhbHVlMSkpO1xuICAgICAgICAgICAgICAgIHRoaXMuZXh0ZW5kKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLyBAdHMtY2hlY2tcblxuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4vQWN0aW9uLmpzXCI7XG5cbi8qKlxuICogQHR5cGUge3N0cmluZ31cbiAqL1xuY29uc3QgSEFMVF9PVVRfU1RSSU5HID0gYEhBTFRfT1VUYDtcblxuLyoqXG4gKiBgSEFMVF9PVVRgIGFjdGlvblxuICovXG5leHBvcnQgY2xhc3MgSGFsdE91dEFjdGlvbiBleHRlbmRzIEFjdGlvbiB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG92ZXJyaWRlXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwcmV0dHkoKSB7XG4gICAgICAgIHJldHVybiBIQUxUX09VVF9TVFJJTkc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gICAgICogQHJldHVybnMge0hhbHRPdXRBY3Rpb24gfCB1bmRlZmluZWR9XG4gICAgICovXG4gICAgc3RhdGljIHBhcnNlKHN0cikge1xuICAgICAgICBjb25zdCBhcnJheSA9IHN0ci50cmltKCkuc3BsaXQoL1xccysvdSk7XG4gICAgICAgIGlmIChhcnJheS5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgW2hhbHRPdXRdID0gYXJyYXk7XG4gICAgICAgIGlmIChoYWx0T3V0ICE9PSBIQUxUX09VVF9TVFJJTkcpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBIYWx0T3V0QWN0aW9uKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5a6f6Zqb44Gr44Gv5YCk44Gv44Gp44Gh44KJ44Gn44KC6Imv44GEXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgZG9lc1JldHVyblZhbHVlKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKiBAcGFyYW0ge0FjdGlvbn0gYWN0aW9uXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNTYW1lQ29tcG9uZW50KGFjdGlvbikge1xuICAgICAgICByZXR1cm4gYWN0aW9uIGluc3RhbmNlb2YgSGFsdE91dEFjdGlvbjtcbiAgICB9XG59XG4iLCIvLyBAdHMtY2hlY2tcblxuaW1wb3J0IHsgSGFsdE91dEFjdGlvbiB9IGZyb20gXCIuLi9hY3Rpb25zL0hhbHRPdXRBY3Rpb24uanNcIjtcbmltcG9ydCB7IENvbW1hbmQgfSBmcm9tIFwiLi4vQ29tbWFuZC5qc1wiO1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmRcbiAqIEByZXR1cm5zIHtzdHJpbmcgfCB1bmRlZmluZWR9XG4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlQWN0aW9uUmV0dXJuT25jZUNvbW1hbmQoY29tbWFuZCkge1xuICAgIC8vIEZJWE1FOiBIQUxUX09VVOOBjOWQq+OBvuOCjOOCi+WgtOWQiOOBr+S4gOaXpueEoeimllxuICAgIGlmIChjb21tYW5kLmFjdGlvbnMuc29tZSh4ID0+IHggaW5zdGFuY2VvZiBIYWx0T3V0QWN0aW9uKSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNvbnN0IHZhbHVlUmV0dXJuQWN0aW9ucyA9IGNvbW1hbmQuYWN0aW9ucy5maWx0ZXIoeCA9PiB4LmRvZXNSZXR1cm5WYWx1ZSgpKTtcbiAgICBpZiAodmFsdWVSZXR1cm5BY3Rpb25zLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSBpZiAodmFsdWVSZXR1cm5BY3Rpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gYERvZXMgbm90IHByb2R1Y2UgdGhlIHJldHVybiB2YWx1ZSBpbiBcIiR7Y29tbWFuZC5wcmV0dHkoKX1cImA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGBEb2VzIG5vdCBjb250YWluIGV4YWN0bHkgb25lIGFjdGlvbiB0aGF0IHByb2R1Y2VzIGEgcmV0dXJuIHZhbHVlIGluIFwiJHtcbiAgICAgICAgICAgIGNvbW1hbmQucHJldHR5KClcbiAgICAgICAgfVwiOiBBY3Rpb25zIHRoYXQgcHJvZHVjZSB2YWx1ZSBhcmUgJHtcbiAgICAgICAgICAgIHZhbHVlUmV0dXJuQWN0aW9ucy5tYXAoeCA9PiBgXCIke3gucHJldHR5KCl9XCJgKS5qb2luKCcsICcpXG4gICAgICAgIH1gO1xuICAgIH1cbn1cblxuLyoqXG4gKiDjgqLjgq/jgrfjg6fjg7PjgYzlgKTjgpLkuIDluqbjgaDjgZHov5TjgZnjgYvmpJzmn7vjgZnjgotcbiAqIOOCqOODqeODvOODoeODg+OCu+ODvOOCuOOCkui/lOWNtOOBmeOCi1xuICogQHBhcmFtIHtDb21tYW5kW119IGNvbW1hbmRzXG4gKiBAcmV0dXJucyB7c3RyaW5nW10gfCB1bmRlZmluZWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUFjdGlvblJldHVybk9uY2UoY29tbWFuZHMpIHtcbiAgICAvKiogQHR5cGUge3N0cmluZ1tdfSAqL1xuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgIGZvciAoY29uc3QgY29tbWFuZCBvZiBjb21tYW5kcykge1xuICAgICAgICBjb25zdCBlcnIgPSB2YWxpZGF0ZUFjdGlvblJldHVybk9uY2VDb21tYW5kKGNvbW1hbmQpO1xuICAgICAgICBpZiAodHlwZW9mIGVyciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKGVycik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBlcnJvcnM7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG4iLCIvLyBAdHMtY2hlY2tcblxuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4vQWN0aW9uLmpzXCI7XG5cbi8qKlxuICogYE5PUGAgYWN0aW9uXG4gKi9cbmV4cG9ydCBjbGFzcyBOb3BBY3Rpb24gZXh0ZW5kcyBBY3Rpb24ge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBvdmVycmlkZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHJldHR5KCkge1xuICAgICAgICByZXR1cm4gYE5PUGA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gICAgICogQHJldHVybnMge05vcEFjdGlvbiB8IHVuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBzdGF0aWMgcGFyc2Uoc3RyKSB7XG4gICAgICAgIGNvbnN0IGFycmF5ID0gc3RyLnRyaW0oKS5zcGxpdCgvXFxzKy91KTtcbiAgICAgICAgaWYgKGFycmF5Lmxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBbIG5vcCBdID0gYXJyYXk7XG4gICAgICAgIGlmIChub3AgIT09IFwiTk9QXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBOb3BBY3Rpb24oKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEBvdmVycmlkZVxuICAgICAqL1xuICAgIGRvZXNSZXR1cm5WYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKiBAcGFyYW0ge0FjdGlvbn0gYWN0aW9uXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNTYW1lQ29tcG9uZW50KGFjdGlvbikge1xuICAgICAgICByZXR1cm4gYWN0aW9uIGluc3RhbmNlb2YgTm9wQWN0aW9uO1xuICAgIH1cbn1cbiIsIi8vIEB0cy1jaGVja1xuXG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi9BY3Rpb24uanNcIjtcbmltcG9ydCB7IEFkZEFjdGlvbiB9IGZyb20gXCIuL0FkZEFjdGlvbi5qc1wiO1xuaW1wb3J0IHsgQjJEQWN0aW9uIH0gZnJvbSBcIi4vQjJEQWN0aW9uLmpzXCI7XG5pbXBvcnQgeyBCUmVnQWN0aW9uIH0gZnJvbSBcIi4vQlJlZ0FjdGlvbi5qc1wiO1xuaW1wb3J0IHsgSGFsdE91dEFjdGlvbiB9IGZyb20gXCIuL0hhbHRPdXRBY3Rpb24uanNcIjtcbmltcG9ydCB7IE11bEFjdGlvbiB9IGZyb20gXCIuL011bEFjdGlvbi5qc1wiO1xuaW1wb3J0IHsgTm9wQWN0aW9uIH0gZnJvbSBcIi4vTm9wQWN0aW9uLmpzXCI7XG5pbXBvcnQgeyBPdXRwdXRBY3Rpb24gfSBmcm9tIFwiLi9PdXRwdXRBY3Rpb24uanNcIjtcbmltcG9ydCB7IFN1YkFjdGlvbiB9IGZyb20gXCIuL1N1YkFjdGlvbi5qc1wiO1xuaW1wb3J0IHsgVVJlZ0FjdGlvbiB9IGZyb20gXCIuL1VSZWdBY3Rpb24uanNcIjtcbmltcG9ydCB7IExlZ2FjeVRSZWdBY3Rpb24gfSBmcm9tIFwiLi9MZWdhY3lUUmVnQWN0aW9uLmpzXCI7XG5cbi8qKlxuICog44Ki44Kv44K344On44Oz44KS44OR44O844K544GZ44KLXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gKiBAcmV0dXJucyB7QWN0aW9uIHwgdW5kZWZpbmVkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VBY3Rpb24oc3RyKSB7XG4gICAgLyoqXG4gICAgICogQHR5cGUgeygoc3RyOiBzdHJpbmcpID0+IEFjdGlvbiB8IHVuZGVmaW5lZClbXX1cbiAgICAgKi9cbiAgICBjb25zdCBwYXJzZXJzID0gW1xuICAgICAgICBCUmVnQWN0aW9uLnBhcnNlLFxuICAgICAgICBVUmVnQWN0aW9uLnBhcnNlLFxuICAgICAgICBCMkRBY3Rpb24ucGFyc2UsXG4gICAgICAgIE5vcEFjdGlvbi5wYXJzZSxcbiAgICAgICAgQWRkQWN0aW9uLnBhcnNlLFxuICAgICAgICBNdWxBY3Rpb24ucGFyc2UsXG4gICAgICAgIFN1YkFjdGlvbi5wYXJzZSxcbiAgICAgICAgT3V0cHV0QWN0aW9uLnBhcnNlLFxuICAgICAgICBIYWx0T3V0QWN0aW9uLnBhcnNlLFxuICAgICAgICBMZWdhY3lUUmVnQWN0aW9uLnBhcnNlLFxuICAgIF07XG5cbiAgICBmb3IgKGNvbnN0IHBhcnNlciBvZiBwYXJzZXJzKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHBhcnNlcihzdHIpO1xuICAgICAgICBpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuIiwiLy8gQHRzLWNoZWNrXG4vLyBkZW5vLWxpbnQtaWdub3JlLWZpbGUgbm8tdW51c2VkLXZhcnNcblxuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4vYWN0aW9ucy9BY3Rpb24uanNcIjtcbmltcG9ydCB7IHBhcnNlQWN0aW9uIH0gZnJvbSBcIi4vYWN0aW9ucy9wYXJzZS5qc1wiO1xuXG4vKipcbiAqIOWIneacn+eKtuaFi1xuICovXG5leHBvcnQgY29uc3QgSU5JVElBTF9TVEFURSA9IFwiSU5JVElBTFwiO1xuXG4vKipcbiAqIEBhYnN0cmFjdFxuICovXG5leHBvcnQgY2xhc3MgUHJvZ3JhbUxpbmUge1xuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHJldHR5KCkge1xuICAgICAgICByZXR1cm4gYHVuaW1wbGVtZW50ZWRgO1xuICAgIH1cbn1cblxuLyoqXG4gKiBgI0NPTVBPTkVOVFNgXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRzSGVhZGVyIGV4dGVuZHMgUHJvZ3JhbUxpbmUge1xuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnRcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihjb250ZW50KSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZWFkb25seVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jb250ZW50ID0gY29udGVudDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHN0YXRpYyBnZXQga2V5KCkge1xuICAgICAgICByZXR1cm4gXCIjQ09NUE9ORU5UU1wiO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBwcmV0dHkoKSB7XG4gICAgICAgIHJldHVybiBDb21wb25lbnRzSGVhZGVyLmtleSArIFwiIFwiICsgdGhpcy5jb250ZW50O1xuICAgIH1cbn1cblxuLyoqXG4gKiBgI1JFR0lTVEVSU2BcbiAqL1xuZXhwb3J0IGNsYXNzIFJlZ2lzdGVyc0hlYWRlciBleHRlbmRzIFByb2dyYW1MaW5lIHtcbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoY29udGVudCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcmVhZG9ubHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY29udGVudCA9IGNvbnRlbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0IGtleSgpIHtcbiAgICAgICAgcmV0dXJuIFwiI1JFR0lTVEVSU1wiO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBvdmVycmlkZVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgcHJldHR5KCkge1xuICAgICAgICByZXR1cm4gUmVnaXN0ZXJzSGVhZGVyLmtleSArIFwiIFwiICsgdGhpcy5jb250ZW50O1xuICAgIH1cbn1cblxuLyoqXG4gKiDjgrPjg6Hjg7Pjg4hcbiAqL1xuZXhwb3J0IGNsYXNzIENvbW1lbnQgZXh0ZW5kcyBQcm9ncmFtTGluZSB7XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyIHdpdGggI1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHN0cikge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcmVhZG9ubHlcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuc3RyID0gc3RyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOOCt+ODo+ODvOODl+OCkuWQq+OCgFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgZ2V0U3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdHI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgcHJldHR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTdHJpbmcoKTtcbiAgICB9XG59XG5cbi8qKlxuICog56m66KGMXG4gKi9cbmV4cG9ydCBjbGFzcyBFbXB0eUxpbmUgZXh0ZW5kcyBQcm9ncmFtTGluZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgcHJldHR5KCkge1xuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dFN0clxuICogQHJldHVybnMge1wiWlwiIHwgXCJOWlwiIHwgXCJaWlwiIHwgXCIqXCIgfCB1bmRlZmluZWR9XG4gKi9cbmZ1bmN0aW9uIHBhcnNlSW5wdXQoaW5wdXRTdHIpIHtcbiAgICBzd2l0Y2ggKGlucHV0U3RyKSB7XG4gICAgICAgIGNhc2UgXCJaXCI6IHJldHVybiBpbnB1dFN0cjtcbiAgICAgICAgY2FzZSBcIk5aXCI6IHJldHVybiBpbnB1dFN0cjtcbiAgICAgICAgY2FzZSBcIlpaXCI6IHJldHVybiBpbnB1dFN0cjtcbiAgICAgICAgY2FzZSBcIipcIjogcmV0dXJuIGlucHV0U3RyO1xuICAgICAgICBkZWZhdWx0OiByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbn1cblxuLyoqXG4gKiBBIGxpbmUgb2YgcHJvZ3JhbVxuICovXG5leHBvcnQgY2xhc3MgQ29tbWFuZCBleHRlbmRzIFByb2dyYW1MaW5lIHtcbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7e1xuICAgICAqICAgIHN0YXRlOiBzdHJpbmc7XG4gICAgICogICAgaW5wdXQ6IFwiWlwiIHwgXCJOWlwiIHwgXCJaWlwiIHwgXCIqXCI7XG4gICAgICogICAgbmV4dFN0YXRlOiBzdHJpbmc7XG4gICAgICogICAgYWN0aW9uczogQWN0aW9uW11cbiAgICAgKiB9fSBwYXJhbTBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcih7IHN0YXRlLCBpbnB1dCwgbmV4dFN0YXRlLCBhY3Rpb25zIH0pIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHJlYWRvbmx5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGU7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZWFkb25seVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pbnB1dCA9IGlucHV0O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcmVhZG9ubHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMubmV4dFN0YXRlID0gbmV4dFN0YXRlO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcmVhZG9ubHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYWN0aW9ucyA9IGFjdGlvbnM7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZWFkb25seVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fc3RyaW5nID0gYCR7dGhpcy5zdGF0ZX07ICR7dGhpcy5pbnB1dH07ICR7dGhpcy5uZXh0U3RhdGV9OyAke3RoaXMuYWN0aW9ucy5tYXAoYSA9PiBhLnByZXR0eSgpKS5qb2luKFwiLCBcIil9YDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb21tYW5k44G+44Gf44GvQ29tbWVudOOBvuOBn+OBr+epuuihjOOBvuOBn+OBr+OCqOODqeODvOODoeODg+OCu+ODvOOCuFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcbiAgICAgKiBAcmV0dXJucyB7Q29tbWFuZCB8IFJlZ2lzdGVyc0hlYWRlciB8IENvbXBvbmVudHNIZWFkZXIgfCBDb21tZW50IHwgRW1wdHlMaW5lIHwgc3RyaW5nfVxuICAgICAqL1xuICAgIHN0YXRpYyBwYXJzZShzdHIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBUeXBlRXJyb3IoJ3N0ciBpcyBub3QgYSBzdHJpbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0cmltbWVkU3RyID0gc3RyLnRyaW0oKTtcbiAgICAgICAgaWYgKHRyaW1tZWRTdHIgPT09IFwiXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRW1wdHlMaW5lKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyaW1tZWRTdHIuc3RhcnRzV2l0aChcIiNcIikpIHtcbiAgICAgICAgICAgIC8vIOODmOODg+ODgOODvOOCkuODkeODvOOCueOBmeOCi1xuICAgICAgICAgICAgaWYgKHRyaW1tZWRTdHIuc3RhcnRzV2l0aChDb21wb25lbnRzSGVhZGVyLmtleSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IENvbXBvbmVudHNIZWFkZXIodHJpbW1lZFN0ci5zbGljZShDb21wb25lbnRzSGVhZGVyLmtleS5sZW5ndGgpLnRyaW0oKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRyaW1tZWRTdHIuc3RhcnRzV2l0aChSZWdpc3RlcnNIZWFkZXIua2V5KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUmVnaXN0ZXJzSGVhZGVyKHRyaW1tZWRTdHIuc2xpY2UoUmVnaXN0ZXJzSGVhZGVyLmtleS5sZW5ndGgpLnRyaW0oKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmV3IENvbW1lbnQoc3RyKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhcnJheSA9IHRyaW1tZWRTdHIuc3BsaXQoL1xccyo7XFxzKi91KTtcbiAgICAgICAgaWYgKGFycmF5Lmxlbmd0aCA8IDQpIHtcbiAgICAgICAgICAgIHJldHVybiBgSW52YWxpZCBsaW5lIFwiJHtzdHJ9XCJgO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhcnJheS5sZW5ndGggPiA0KSB7XG4gICAgICAgICAgICBpZiAoYXJyYXlbNF0gPT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYEV4dHJhbmVvdXMgc2VtaWNvbG9uIFwiJHtzdHJ9XCJgO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGBJbnZhbGlkIGxpbmUgXCIke3N0cn1cImA7XG4gICAgICAgIH1cbiAgICAgICAgLy8gYXJyYXnjga7plbfjgZXjga80XG4gICAgICAgIGNvbnN0IHN0YXRlID0gYXJyYXlbMF0gPz8gdGhpcy5lcnJvcigpO1xuICAgICAgICBjb25zdCBpbnB1dFN0ciA9IGFycmF5WzFdID8/IHRoaXMuZXJyb3IoKTtcbiAgICAgICAgY29uc3QgbmV4dFN0YXRlID0gYXJyYXlbMl0gPz8gdGhpcy5lcnJvcigpO1xuICAgICAgICBjb25zdCBhY3Rpb25zU3RyID0gYXJyYXlbM10gPz8gdGhpcy5lcnJvcigpO1xuICAgICAgICAvLyDnqbrmloflrZfjgpLpmaTjgY9cbiAgICAgICAgY29uc3QgYWN0aW9uU3RycyA9IGFjdGlvbnNTdHIudHJpbSgpLnNwbGl0KC9cXHMqLFxccyovdSkuZmlsdGVyKHggPT4geCAhPT0gXCJcIik7XG5cbiAgICAgICAgLyoqIEB0eXBlIHtBY3Rpb25bXX0gKi9cbiAgICAgICAgY29uc3QgYWN0aW9ucyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGFjdGlvbnNTdHIgb2YgYWN0aW9uU3Rycykge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gcGFyc2VBY3Rpb24oYWN0aW9uc1N0cik7XG4gICAgICAgICAgICBpZiAocmVzdWx0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYFVua25vd24gYWN0aW9uIFwiJHthY3Rpb25zU3RyfVwiIGF0IFwiJHtzdHJ9XCJgO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKHJlc3VsdCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpbnB1dCA9IHBhcnNlSW5wdXQoaW5wdXRTdHIpO1xuICAgICAgICBpZiAoaW5wdXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGBVbmtub3duIGlucHV0IFwiJHtpbnB1dFN0cn1cIiBhdCBcIiR7c3RyfVwiLiBFeHBlY3QgXCJaXCIsIFwiTlpcIiwgXCJaWlwiLCBvciBcIipcImA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IENvbW1hbmQoe1xuICAgICAgICAgICAgc3RhdGU6IHN0YXRlLFxuICAgICAgICAgICAgaW5wdXQ6IGlucHV0LFxuICAgICAgICAgICAgbmV4dFN0YXRlOiBuZXh0U3RhdGUsXG4gICAgICAgICAgICBhY3Rpb25zOiBhY3Rpb25zXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHJldHVybnMge25ldmVyfVxuICAgICAqL1xuICAgIHN0YXRpYyBlcnJvcigpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ2ludGVybmFsIGVycm9yJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5paH5a2X5YiX5YyW44GZ44KLXG4gICAgICogQG92ZXJyaWRlXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwcmV0dHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdHJpbmc7IC8vIGAke3RoaXMuc3RhdGV9OyAke3RoaXMuaW5wdXR9OyAke3RoaXMubmV4dFN0YXRlfTsgJHt0aGlzLmFjdGlvbnMubWFwKGEgPT4gYS5wcmV0dHkoKSkuam9pbihcIiwgXCIpfWA7XG4gICAgfVxufVxuIiwiLy8gQHRzLWNoZWNrXG5cbmltcG9ydCB7IENvbW1hbmQsIElOSVRJQUxfU1RBVEUgfSBmcm9tIFwiLi4vQ29tbWFuZC5qc1wiO1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmRcbiAqIEByZXR1cm5zIHtzdHJpbmcgfCB1bmRlZmluZWR9XG4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlTmV4dFN0YXRlSXNOb3RJTklUSUFMQ29tbWFuZChjb21tYW5kKSB7XG4gICAgaWYgKGNvbW1hbmQubmV4dFN0YXRlID09PSBJTklUSUFMX1NUQVRFKSB7XG4gICAgICAgIHJldHVybiBgUmV0dXJuIHRvIGluaXRpYWwgc3RhdGUgaW4gXCIke2NvbW1hbmQucHJldHR5KCl9XCJgO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIOasoeOBrueKtuaFi+OBjOWIneacn+eKtuaFi+OBp+OBquOBhOOBi+aknOafu+OBmeOCi1xuICog44Ko44Op44O844Oh44OD44K744O844K444KS6L+U5Y2044GZ44KLXG4gKiBAcGFyYW0ge0NvbW1hbmRbXX0gY29tbWFuZHNcbiAqIEByZXR1cm5zIHtzdHJpbmdbXSB8IHVuZGVmaW5lZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlTmV4dFN0YXRlSXNOb3RJTklUSUFMKGNvbW1hbmRzKSB7XG4gICAgLyoqIEB0eXBlIHtzdHJpbmdbXX0gKi9cbiAgICAgICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgZm9yIChjb25zdCBjb21tYW5kIG9mIGNvbW1hbmRzKSB7XG4gICAgICAgIGNvbnN0IGVyciA9IHZhbGlkYXRlTmV4dFN0YXRlSXNOb3RJTklUSUFMQ29tbWFuZChjb21tYW5kKTtcbiAgICAgICAgaWYgKHR5cGVvZiBlcnIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBlcnJvcnMucHVzaChlcnIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChlcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gZXJyb3JzO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuIiwiLy8gQHRzLWNoZWNrXG5cbmltcG9ydCB7IENvbW1hbmQgfSBmcm9tIFwiLi4vQ29tbWFuZC5qc1wiO1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmRcbiAqIEByZXR1cm5zIHtzdHJpbmcgfCB1bmRlZmluZWR9XG4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlTm9EdXBsaWNhdGVkQWN0aW9uQ29tbWFuZChjb21tYW5kKSB7XG4gICAgaWYgKGNvbW1hbmQuYWN0aW9ucy5sZW5ndGggPD0gMSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zdCBhY3Rpb25TdHJzID0gY29tbWFuZC5hY3Rpb25zLm1hcCh4ID0+IHgucHJldHR5KCkpO1xuICAgIGFjdGlvblN0cnMuc29ydCgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWN0aW9uU3Rycy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgY29uc3QgYWN0MSA9IGFjdGlvblN0cnNbaV07XG4gICAgICAgIGNvbnN0IGFjdDIgPSBhY3Rpb25TdHJzW2kgKyAxXTtcbiAgICAgICAgaWYgKGFjdDEgPT09IGFjdDIpIHtcbiAgICAgICAgICAgIHJldHVybiBgRHVwbGljYXRlZCBhY3Rpb25zIFwiJHthY3QxfVwiIGluIFwiJHtjb21tYW5kLnByZXR0eSgpfVwiYDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIOWQjOOBmOOCouOCr+OCt+ODp+ODs+OBjOikh+aVsOWQq+OBvuOCjOOBpuOBhOOBquOBhOOBi+aknOafu+OBmeOCi1xuICog44Ko44Op44O844Oh44OD44K744O844K444KS6L+U5Y2044GZ44KLXG4gKiBAcGFyYW0ge0NvbW1hbmRbXX0gY29tbWFuZHNcbiAqIEByZXR1cm5zIHtzdHJpbmdbXSB8IHVuZGVmaW5lZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlTm9EdXBsaWNhdGVkQWN0aW9uKGNvbW1hbmRzKSB7XG4gICAgLyoqIEB0eXBlIHtzdHJpbmdbXX0gKi9cbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGNvbW1hbmQgb2YgY29tbWFuZHMpIHtcbiAgICAgICAgY29uc3QgZXJyID0gdmFsaWRhdGVOb0R1cGxpY2F0ZWRBY3Rpb25Db21tYW5kKGNvbW1hbmQpO1xuICAgICAgICBpZiAodHlwZW9mIGVyciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKGVycik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBlcnJvcnM7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG4iLCIvLyBAdHMtY2hlY2tcblxuaW1wb3J0IHsgQ29tbWFuZCB9IGZyb20gXCIuLi9Db21tYW5kLmpzXCI7XG5pbXBvcnQgeyBIYWx0T3V0QWN0aW9uIH0gZnJvbSBcIi4uL2FjdGlvbnMvSGFsdE91dEFjdGlvbi5qc1wiO1xuXG4vKipcbiAqIEByZXR1cm5zIHtuZXZlcn1cbiAqL1xuZnVuY3Rpb24gaW50ZXJuYWxFcnJvcigpIHtcbiAgICB0aHJvdyBFcnJvcignaW50ZXJuYWwgZXJyb3InKTtcbn1cblxuLyoqXG4gKiDjgqLjgq/jgrfjg6fjg7PjgYzlkIzjgZjjgrPjg7Pjg53jg7zjg43jg7Pjg4jjgpLkvb/nlKjjgZfjgabjgYTjgarjgYTjgYvmpJzmn7vjgZnjgotcbiAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZFxuICogQHJldHVybnMge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAqL1xuZnVuY3Rpb24gdmFsaWRhdGVOb1NhbWVDb21wb25lbnRDb21tYW5kKGNvbW1hbmQpIHtcbiAgICAvLyBIQUxUX09VVOOBruWgtOWQiOOBr+S4gOaXpueEoeimllxuICAgIC8vIEZJWE1FXG4gICAgaWYgKGNvbW1hbmQuYWN0aW9ucy5maW5kKHggPT4geCBpbnN0YW5jZW9mIEhhbHRPdXRBY3Rpb24pICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgY29uc3QgYWN0aW9ucyA9IGNvbW1hbmQuYWN0aW9ucztcbiAgICBjb25zdCBsZW4gPSBhY3Rpb25zLmxlbmd0aDtcblxuICAgIGlmIChsZW4gPD0gMSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZm9yIChsZXQgaiA9IGkgKyAxOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgICAgIC8vIGlmIChpID09PSBqKSB7XG4gICAgICAgICAgICAvLyAgICAgY29udGludWU7XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICBjb25zdCBhID0gYWN0aW9uc1tpXSA/PyBpbnRlcm5hbEVycm9yKCk7XG4gICAgICAgICAgICBjb25zdCBiID0gYWN0aW9uc1tqXSA/PyBpbnRlcm5hbEVycm9yKCk7XG4gICAgICAgICAgICBpZiAoYS5pc1NhbWVDb21wb25lbnQoYikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYEFjdGlvbnMgXCIke1xuICAgICAgICAgICAgICAgICAgICBhLnByZXR0eSgpXG4gICAgICAgICAgICAgICAgfVwiIGFuZCBcIiR7XG4gICAgICAgICAgICAgICAgICAgIGIucHJldHR5KClcbiAgICAgICAgICAgICAgICB9XCIgdXNlIHNhbWUgY29tcG9uZW50IGluIFwiJHtjb21tYW5kLnByZXR0eSgpfVwiYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIOOCouOCr+OCt+ODp+ODs+OBjOWQjOOBmOOCs+ODs+ODneODvOODjeODs+ODiOOCkuS9v+eUqOOBl+OBpuOBhOOBquOBhOOBi+aknOafu+OBmeOCi1xuICog44Ko44Op44O844Oh44OD44K744O844K444KS6L+U5Y2044GZ44KLXG4gKiBAcGFyYW0ge0NvbW1hbmRbXX0gY29tbWFuZHNcbiAqIEByZXR1cm5zIHtzdHJpbmdbXSB8IHVuZGVmaW5lZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlTm9TYW1lQ29tcG9uZW50KGNvbW1hbmRzKSB7XG4gICAgLyoqIEB0eXBlIHtzdHJpbmdbXX0gKi9cbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGNvbW1hbmQgb2YgY29tbWFuZHMpIHtcbiAgICAgICAgY29uc3QgZXJyID0gdmFsaWRhdGVOb1NhbWVDb21wb25lbnRDb21tYW5kKGNvbW1hbmQpO1xuICAgICAgICBpZiAodHlwZW9mIGVyciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKGVycik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBlcnJvcnM7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG4iLCIvLyBAdHMtY2hlY2tcblxuaW1wb3J0IHsgQ29tbWFuZCB9IGZyb20gXCIuLi9Db21tYW5kLmpzXCI7XG5cbi8qKlxuICogQHJldHVybnMge25ldmVyfVxuICovXG5mdW5jdGlvbiBpbnRlcm5hbEVycm9yKCkge1xuICAgIHRocm93IEVycm9yKCdpbnRlcm5hbCBlcnJvcicpO1xufVxuXG4vKipcbiAqIFrjgahOWuOBjOODmuOCouOBq+OBquOBo+OBpuOBhOOCi+OBk+OBqOOCkuaknOafu+OBmeOCi1xuICog44Ko44Op44O844Oh44OD44K744O844K444KS6L+U5Y2044GZ44KLXG4gKiBAcGFyYW0ge0NvbW1hbmRbXX0gY29tbWFuZHNcbiAqIEByZXR1cm5zIHtzdHJpbmdbXSB8IHVuZGVmaW5lZH1cbiAqL1xuIGV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVpBbmROWihjb21tYW5kcykge1xuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHtDb21tYW5kfSBsaW5lXG4gICAgICovXG4gICAgY29uc3QgZXJyTXNnID0gbGluZSA9PiBgTmVlZCBaIGxpbmUgZm9sbG93ZWQgYnkgTlogbGluZSBhdCBcIiR7bGluZS5wcmV0dHkoKX1cImA7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbW1hbmRzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICBjb25zdCBhID0gY29tbWFuZHNbaV0gPz8gaW50ZXJuYWxFcnJvcigpO1xuICAgICAgICBjb25zdCBiID0gY29tbWFuZHNbaSArIDFdID8/IGludGVybmFsRXJyb3IoKTtcblxuICAgICAgICBpZiAoYS5pbnB1dCA9PT0gXCJaXCIgJiYgYi5pbnB1dCAhPT0gJ05aJykge1xuICAgICAgICAgICAgcmV0dXJuIFtlcnJNc2coYSldO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGIuaW5wdXQgPT09IFwiTlpcIiAmJiBhLmlucHV0ICE9PSAnWicpIHtcbiAgICAgICAgICAgIHJldHVybiBbZXJyTXNnKGIpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhLmlucHV0ID09PSBcIlpcIiAmJiBiLmlucHV0ID09PSBcIk5aXCIgJiYgYS5zdGF0ZSAhPT0gYi5zdGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIFtlcnJNc2coYSldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbGFzdExpbmUgPSBjb21tYW5kc1tjb21tYW5kcy5sZW5ndGggLSAxXTtcbiAgICBpZiAobGFzdExpbmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAobGFzdExpbmUuaW5wdXQgPT09ICdaJykge1xuICAgICAgICAgICAgcmV0dXJuIFtlcnJNc2cobGFzdExpbmUpXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG4iLCIvLyBAdHMtY2hlY2tcblxuaW1wb3J0IHtcbiAgICBDb21tYW5kLFxuICAgIFByb2dyYW1MaW5lLFxufSBmcm9tIFwiLi9Db21tYW5kLmpzXCI7XG5cbi8qKlxuICog44OX44Ot44Kw44Op44Og44Gu6KGM44Gu6YWN5YiXXG4gKi9cbmV4cG9ydCBjbGFzcyBQcm9ncmFtTGluZXMge1xuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHtQcm9ncmFtTGluZVtdfSBhcnJheVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGFycmF5KSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcmVhZG9ubHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtQcm9ncmFtTGluZVtdfVxuICAgICAqL1xuICAgIGdldEFycmF5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcnJheTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHByZXR0eSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXJyYXkoKS5tYXAobGluZSA9PiBsaW5lLnByZXR0eSgpKS5qb2luKCdcXG4nKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAx6KGM44KS44OR44O844K5XG4gICAgICogc3RyaW5n44Gv44Ko44Op44O844Oh44OD44K744O844K4XG4gICAgICogc3RyaW5nIGlzIGFuIGVycm9yXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0clxuICAgICAqIEByZXR1cm5zIHtQcm9ncmFtTGluZXMgfCBzdHJpbmd9XG4gICAgICovXG4gICAgc3RhdGljIHBhcnNlKHN0cikge1xuICAgICAgICBjb25zdCBsaW5lcyA9IHN0ci5zcGxpdCgvXFxyXFxufFxcbnxcXHIvdSk7XG5cbiAgICAgICAgY29uc3QgcHJvZ3JhbUxpbmVXaXRoRXJyb3JBcnJheSA9IGxpbmVzLm1hcChsaW5lID0+IENvbW1hbmQucGFyc2UobGluZSkpO1xuXG4gICAgICAgIGNvbnN0IGVycm9ycyA9IHByb2dyYW1MaW5lV2l0aEVycm9yQXJyYXlcbiAgICAgICAgICAgIC5mbGF0TWFwKHggPT4gdHlwZW9mIHggPT09ICdzdHJpbmcnID8gW3hdIDogW10pO1xuXG4gICAgICAgIGlmIChlcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGVycm9ycy5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHByb2dyYW1MaW5lcyA9IHByb2dyYW1MaW5lV2l0aEVycm9yQXJyYXlcbiAgICAgICAgICAgIC5mbGF0TWFwKHggPT4gdHlwZW9mIHggIT09ICdzdHJpbmcnID8gW3hdIDogW10pO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvZ3JhbUxpbmVzKHByb2dyYW1MaW5lcyk7XG4gICAgfVxufVxuIiwiLy8gQHRzLWNoZWNrXG5cbmltcG9ydCB7IENvbW1hbmQgfSBmcm9tIFwiLi9Db21tYW5kLmpzXCI7XG5cbmltcG9ydCB7IHZhbGlkYXRlTmV4dFN0YXRlSXNOb3RJTklUSUFMIH0gZnJvbSBcIi4vdmFsaWRhdG9ycy9uZXh0X3N0YXRlX2lzX25vdF9pbml0aWFsLmpzXCI7XG5pbXBvcnQgeyB2YWxpZGF0ZU5vRHVwbGljYXRlZEFjdGlvbiB9IGZyb20gXCIuL3ZhbGlkYXRvcnMvbm9fZHVwX2FjdGlvbi5qc1wiO1xuaW1wb3J0IHsgdmFsaWRhdGVBY3Rpb25SZXR1cm5PbmNlIH0gZnJvbSBcIi4vdmFsaWRhdG9ycy9hY3Rpb25fcmV0dXJuX29uY2UuanNcIjtcbmltcG9ydCB7IHZhbGlkYXRlTm9TYW1lQ29tcG9uZW50IH0gZnJvbSBcIi4vdmFsaWRhdG9ycy9ub19zYW1lX2NvbXBvbmVudC5qc1wiO1xuaW1wb3J0IHsgdmFsaWRhdGVaQW5kTlogfSBmcm9tIFwiLi92YWxpZGF0b3JzL3pfYW5kX256LmpzXCI7XG5cbi8qKlxuICog5YWo44Gm44Gu44OQ44Oq44OH44O844K344On44Oz44KS6YCa44GZXG4gKiBAcGFyYW0ge0NvbW1hbmRbXX0gY29tbWFuZHNcbiAqIEByZXR1cm5zIHt1bmRlZmluZWQgfCBzdHJpbmd9IHN0cmluZyBpcyBlcnJvclxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVBbGwoY29tbWFuZHMpIHtcbiAgICAvKipcbiAgICAgKiBAdHlwZSB7KChfOiBDb21tYW5kW10pID0+IHN0cmluZ1tdIHwgdW5kZWZpbmVkKVtdfVxuICAgICAqL1xuICAgIGNvbnN0IHZhbGlkYXRvcnMgPSBbXG4gICAgICAgIHZhbGlkYXRlTm9EdXBsaWNhdGVkQWN0aW9uLFxuICAgICAgICB2YWxpZGF0ZUFjdGlvblJldHVybk9uY2UsXG4gICAgICAgIHZhbGlkYXRlTm9TYW1lQ29tcG9uZW50LFxuICAgICAgICB2YWxpZGF0ZU5leHRTdGF0ZUlzTm90SU5JVElBTCxcbiAgICAgICAgdmFsaWRhdGVaQW5kTlpcbiAgICBdO1xuXG4gICAgLyoqIEB0eXBlIHtzdHJpbmdbXX0gKi9cbiAgICBsZXQgZXJyb3JzID0gW107XG4gICAgZm9yIChjb25zdCB2YWxpZGF0b3Igb2YgdmFsaWRhdG9ycykge1xuICAgICAgICBjb25zdCBlcnJvcnNPclVuZGVmaW5lZCA9IHZhbGlkYXRvcihjb21tYW5kcyk7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGVycm9yc09yVW5kZWZpbmVkKSkge1xuICAgICAgICAgICAgZXJyb3JzID0gZXJyb3JzLmNvbmNhdChlcnJvcnNPclVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIGVycm9ycy5qb2luKCdcXG4nKTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbiIsIi8vIEB0cy1jaGVja1xuXG5pbXBvcnQgeyBDb21tYW5kLCBDb21wb25lbnRzSGVhZGVyLCBSZWdpc3RlcnNIZWFkZXIgfSBmcm9tIFwiLi9Db21tYW5kLmpzXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi9hY3Rpb25zL0FjdGlvbi5qc1wiO1xuaW1wb3J0IHsgUHJvZ3JhbUxpbmVzIH0gZnJvbSBcIi4vUHJvZ3JhbUxpbmVzLmpzXCI7XG5pbXBvcnQgeyB2YWxpZGF0ZUFsbCB9IGZyb20gXCIuL3ZhbGlkYXRlLmpzXCI7XG5cbi8qKlxuICogQVBHc2VtYmx5IHByb2dyYW1cbiAqL1xuZXhwb3J0IGNsYXNzIFByb2dyYW0ge1xuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIHt7XG4gICAgICogICBwcm9ncmFtTGluZXM6IFByb2dyYW1MaW5lc1xuICAgICAqIH19IHBhcmFtMFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHtcbiAgICAgICAgcHJvZ3JhbUxpbmVzLFxuICAgIH0pIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZWFkb25seVxuICAgICAgICAgKiBAdHlwZSB7Q29tbWFuZFtdfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jb21tYW5kcyA9IHByb2dyYW1MaW5lcy5nZXRBcnJheSgpLmZsYXRNYXAoeCA9PiB7XG4gICAgICAgICAgICBpZiAoeCBpbnN0YW5jZW9mIENvbW1hbmQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW3hdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcmVhZG9ubHlcbiAgICAgICAgICogQHR5cGUge0NvbXBvbmVudHNIZWFkZXIgfCB1bmRlZmluZWR9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNvbXBvbmVudHNIZWFkZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIGZvciAoY29uc3QgeCBvZiBwcm9ncmFtTGluZXMuZ2V0QXJyYXkoKSkge1xuICAgICAgICAgICAgaWYgKHggaW5zdGFuY2VvZiBDb21wb25lbnRzSGVhZGVyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29tcG9uZW50c0hlYWRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IEVycm9yKGBNdWx0aXBsZSAke0NvbXBvbmVudHNIZWFkZXIua2V5fWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmNvbXBvbmVudHNIZWFkZXIgPSB4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZWFkb25seVxuICAgICAgICAgKiBAdHlwZSB7UmVnaXN0ZXJzSGVhZGVyIHwgdW5kZWZpbmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5yZWdpc3RlcnNIZWFkZXIgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgZm9yIChjb25zdCB4IG9mIHByb2dyYW1MaW5lcy5nZXRBcnJheSgpKSB7XG4gICAgICAgICAgICBpZiAoeCBpbnN0YW5jZW9mIFJlZ2lzdGVyc0hlYWRlcikge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJlZ2lzdGVyc0hlYWRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTXVsdGlwbGUgJHtSZWdpc3RlcnNIZWFkZXIua2V5fWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdGVyc0hlYWRlciA9IHg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKiogQHJlYWRvbmx5ICovXG4gICAgICAgIHRoaXMucHJvZ3JhbUxpbmVzID0gcHJvZ3JhbUxpbmVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOODl+ODreOCsOODqeODoOOBvuOBn+OBr+OCqOODqeODvOODoeODg+OCu+ODvOOCuFxuICAgICAqIFByb2dyYW0gb3IgZXJyb3IgbWVzc2FnZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcbiAgICAgKiBAcmV0dXJucyB7UHJvZ3JhbSB8IHN0cmluZ31cbiAgICAgKi9cbiAgICBzdGF0aWMgcGFyc2Uoc3RyKSB7XG4gICAgICAgIGNvbnN0IHByb2dyYW1MaW5lcyA9IFByb2dyYW1MaW5lcy5wYXJzZShzdHIpO1xuICAgICAgICBpZiAodHlwZW9mIHByb2dyYW1MaW5lcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9ncmFtTGluZXM7XG4gICAgICAgIH1cblxuICAgICAgICAvKiogQHR5cGUge0NvbW1hbmRbXX0gKi9cbiAgICAgICAgY29uc3QgY29tbWFuZHMgPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IHByb2dyYW1MaW5lIG9mIHByb2dyYW1MaW5lcy5nZXRBcnJheSgpKSB7XG4gICAgICAgICAgICBpZiAocHJvZ3JhbUxpbmUgaW5zdGFuY2VvZiBDb21tYW5kKSB7XG4gICAgICAgICAgICAgICAgY29tbWFuZHMucHVzaChwcm9ncmFtTGluZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyB2YWxpZGF0aW9uXG4gICAgICAgIGlmIChjb21tYW5kcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiAnUHJvZ3JhbSBpcyBlbXB0eSc7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBlcnJvck9yVW5kZWZpbmVkID0gdmFsaWRhdGVBbGwoY29tbWFuZHMpO1xuICAgICAgICBpZiAodHlwZW9mIGVycm9yT3JVbmRlZmluZWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICByZXR1cm4gZXJyb3JPclVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb2dyYW0oe1xuICAgICAgICAgICAgICAgIHByb2dyYW1MaW5lczogcHJvZ3JhbUxpbmVzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVE9ET1xuICAgICAgICAgICAgcmV0dXJuIGVycm9yLm1lc3NhZ2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEByZXR1cm5zIHtBY3Rpb25bXX1cbiAgICAgKi9cbiAgICBfYWN0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tbWFuZHMuZmxhdE1hcChjb21tYW5kID0+IGNvbW1hbmQuYWN0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge251bWJlcltdfVxuICAgICAqL1xuICAgIGV4dHJhY3RVbmFyeVJlZ2lzdGVyTnVtYmVycygpIHtcbiAgICAgICAgcmV0dXJuIHNvcnROdWIodGhpcy5fYWN0aW9ucygpLmZsYXRNYXAoYSA9PiBhLmV4dHJhY3RVbmFyeVJlZ2lzdGVyTnVtYmVycygpKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge251bWJlcltdfVxuICAgICAqL1xuICAgIGV4dHJhY3RCaW5hcnlSZWdpc3Rlck51bWJlcnMoKSB7XG4gICAgICAgIHJldHVybiBzb3J0TnViKHRoaXMuX2FjdGlvbnMoKS5mbGF0TWFwKGEgPT4gYS5leHRyYWN0QmluYXJ5UmVnaXN0ZXJOdW1iZXJzKCkpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyW119XG4gICAgICovXG4gICAgZXh0cmFjdExlZ2FjeVRSZWdpc3Rlck51bWJlcnMoKSB7XG4gICAgICAgIHJldHVybiBzb3J0TnViKHRoaXMuX2FjdGlvbnMoKS5mbGF0TWFwKGEgPT4gYS5leHRyYWN0TGVnYWN5VFJlZ2lzdGVyTnVtYmVycygpKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5paH5a2X5YiX5YyW44GZ44KLXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBwcmV0dHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb2dyYW1MaW5lcy5wcmV0dHkoKTtcbiAgICB9XG59XG5cbi8qKlxuICog6KaB57Sg44KS5LiA5oSP44Gr44GX44Gm44K944O844OI44GZ44KLXG4gKiBAcGFyYW0ge251bWJlcltdfSBhcnJheVxuICogQHJldHVybnMge251bWJlcltdfVxuICovXG5mdW5jdGlvbiBzb3J0TnViKGFycmF5KSB7XG4gICAgcmV0dXJuIFsuLi5uZXcgU2V0KGFycmF5KV0uc29ydCgoYSwgYikgPT4gYSAtIGIpO1xufVxuIiwiaW1wb3J0IHsgYm5iIH0gZnJvbSBcIi4uLy4uL2RlcHMudHNcIjtcblxuZXhwb3J0IGNvbnN0IGRlY2ltYWxOYXR1cmFsUGFyc2VyID0gYm5iLm1hdGNoKC9bMC05XSsvKS5kZXNjKFtcIm51bWJlclwiXSkubWFwKFxuICAgICh4KSA9PiBwYXJzZUludCh4LCAxMCksXG4pO1xuXG5leHBvcnQgY29uc3QgaGV4YWRlY2ltYWxOYXR1cmFsUGFyc2VyID0gYm5iLm1hdGNoKC8weFthLWZBLUYwLTldKy8pLmRlc2MoW1xuICAgIFwiaGV4YWRlY2ltYWwgbnVtYmVyXCIsXG5dKS5tYXAoKHgpID0+IHBhcnNlSW50KHgsIDE2KSk7XG5cbmV4cG9ydCBjb25zdCBuYXR1cmFsTnVtYmVyUGFyc2VyOiBibmIuUGFyc2VyPG51bWJlcj4gPSBoZXhhZGVjaW1hbE5hdHVyYWxQYXJzZXJcbiAgICAub3IoZGVjaW1hbE5hdHVyYWxQYXJzZXIpLmRlc2MoW1wibnVtYmVyXCJdKTtcbiIsIi8qKlxuICogRXhwcmVzc2lvbiBvZiBBUEdNIGxhbmd1YWdlXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBUEdNRXhwciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXBwbHkgcmVjdXJzaXZlIHRyYW5zZm9ybVxuICAgICAqL1xuICAgIGFic3RyYWN0IHRyYW5zZm9ybShmOiAoXzogQVBHTUV4cHIpID0+IEFQR01FeHByKTogQVBHTUV4cHI7XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IHRvIHN0cmluZ1xuICAgICAqL1xuICAgIGFic3RyYWN0IHByZXR0eSgpOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQVBHTVNvdXJjZUxvY2F0aW9uIHtcbiAgICAvKiogVGhlIHN0cmluZyBpbmRleCBpbnRvIHRoZSBpbnB1dCAoZS5nLiBmb3IgdXNlIHdpdGggYC5zbGljZWApICovXG4gICAgaW5kZXg6IG51bWJlcjtcbiAgICAvKipcbiAgICAgKiBUaGUgbGluZSBudW1iZXIgZm9yIGVycm9yIHJlcG9ydGluZy4gT25seSB0aGUgY2hhcmFjdGVyIGBcXG5gIGlzIHVzZWQgdG9cbiAgICAgKiBzaWduaWZ5IHRoZSBiZWdpbm5pbmcgb2YgYSBuZXcgbGluZS5cbiAgICAgKi9cbiAgICBsaW5lOiBudW1iZXI7XG4gICAgLyoqXG4gICAgICogVGhlIGNvbHVtbiBudW1iZXIgZm9yIGVycm9yIHJlcG9ydGluZy5cbiAgICAgKi9cbiAgICBjb2x1bW46IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIEVycm9yV2l0aExvY2F0aW9uIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgICAgIHB1YmxpYyBhcGdtTG9jYXRpb24/OiBBUEdNU291cmNlTG9jYXRpb24gfCB1bmRlZmluZWQsXG4gICAgICAgIG9wdGlvbnM/OiBFcnJvck9wdGlvbnMgfCB1bmRlZmluZWQsXG4gICAgKSB7XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdExvY2F0aW9uKGxvY2F0aW9uOiBBUEdNU291cmNlTG9jYXRpb24pOiBzdHJpbmcge1xuICAgIHJldHVybiBgbGluZSAke2xvY2F0aW9uLmxpbmV9IGNvbHVtbiAke2xvY2F0aW9uLmNvbHVtbn1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0TG9jYXRpb25BdChcbiAgICBsb2NhdGlvbjogQVBHTVNvdXJjZUxvY2F0aW9uIHwgdW5kZWZpbmVkLFxuKTogc3RyaW5nIHtcbiAgICBpZiAobG9jYXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gYCBhdCBsaW5lICR7bG9jYXRpb24ubGluZX0gY29sdW1uICR7bG9jYXRpb24uY29sdW1ufWA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQVBHTUV4cHIgfSBmcm9tIFwiLi9jb3JlLnRzXCI7XG5cbmV4cG9ydCBjbGFzcyBJZkFQR01FeHByIGV4dGVuZHMgQVBHTUV4cHIge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwdWJsaWMgcmVhZG9ubHkgbW9kaWZpZXI6IFwiWlwiIHwgXCJOWlwiLFxuICAgICAgICBwdWJsaWMgcmVhZG9ubHkgY29uZDogQVBHTUV4cHIsXG4gICAgICAgIHB1YmxpYyByZWFkb25seSB0aGVuQm9keTogQVBHTUV4cHIsXG4gICAgICAgIHB1YmxpYyByZWFkb25seSBlbHNlQm9keTogQVBHTUV4cHIgfCB1bmRlZmluZWQsXG4gICAgKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgdHJhbnNmb3JtKGY6IChfOiBBUEdNRXhwcikgPT4gQVBHTUV4cHIpOiBBUEdNRXhwciB7XG4gICAgICAgIHJldHVybiBmKFxuICAgICAgICAgICAgbmV3IElmQVBHTUV4cHIoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RpZmllcixcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmQudHJhbnNmb3JtKGYpLFxuICAgICAgICAgICAgICAgIHRoaXMudGhlbkJvZHkudHJhbnNmb3JtKGYpLFxuICAgICAgICAgICAgICAgIHRoaXMuZWxzZUJvZHkgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICA/IHRoaXMuZWxzZUJvZHkudHJhbnNmb3JtKGYpXG4gICAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcmV0dHkoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3Qga2V5d29yZCA9IGBpZl8ke3RoaXMubW9kaWZpZXIgPT09IFwiWlwiID8gXCJ6XCIgOiBcIm56XCJ9YDtcbiAgICAgICAgY29uc3QgY29uZCA9IHRoaXMuY29uZC5wcmV0dHkoKTtcbiAgICAgICAgY29uc3QgZWwgPSB0aGlzLmVsc2VCb2R5ID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgID8gYGBcbiAgICAgICAgICAgIDogYCBlbHNlICR7dGhpcy5lbHNlQm9keS5wcmV0dHkoKX1gO1xuICAgICAgICByZXR1cm4gYCR7a2V5d29yZH0gKCR7Y29uZH0pICR7dGhpcy50aGVuQm9keS5wcmV0dHkoKX1gICsgZWw7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQVBHTUV4cHIgfSBmcm9tIFwiLi9jb3JlLnRzXCI7XG5cbmV4cG9ydCBjbGFzcyBMb29wQVBHTUV4cHIgZXh0ZW5kcyBBUEdNRXhwciB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHB1YmxpYyByZWFkb25seSBib2R5OiBBUEdNRXhwcixcbiAgICApIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICB0cmFuc2Zvcm0oZjogKF86IEFQR01FeHByKSA9PiBBUEdNRXhwcik6IEFQR01FeHByIHtcbiAgICAgICAgcmV0dXJuIGYobmV3IExvb3BBUEdNRXhwcih0aGlzLmJvZHkudHJhbnNmb3JtKGYpKSk7XG4gICAgfVxuXG4gICAgcHJldHR5KCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBgbG9vcCAke3RoaXMuYm9keS5wcmV0dHkoKX1gO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEFQR01FeHByLCB0eXBlIEFQR01Tb3VyY2VMb2NhdGlvbiB9IGZyb20gXCIuL2NvcmUudHNcIjtcblxuLyoqXG4gKiBGdW5jdGlvbiBjYWxsXG4gKi9cbmV4cG9ydCBjbGFzcyBGdW5jQVBHTUV4cHIgZXh0ZW5kcyBBUEdNRXhwciB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHB1YmxpYyByZWFkb25seSBuYW1lOiBzdHJpbmcsXG4gICAgICAgIHB1YmxpYyByZWFkb25seSBhcmdzOiBBUEdNRXhwcltdLFxuICAgICAgICBwdWJsaWMgcmVhZG9ubHkgbG9jYXRpb246IEFQR01Tb3VyY2VMb2NhdGlvbiB8IHVuZGVmaW5lZCxcbiAgICApIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBvdmVycmlkZSB0cmFuc2Zvcm0oZjogKF86IEFQR01FeHByKSA9PiBBUEdNRXhwcik6IEFQR01FeHByIHtcbiAgICAgICAgcmV0dXJuIGYoXG4gICAgICAgICAgICBuZXcgRnVuY0FQR01FeHByKFxuICAgICAgICAgICAgICAgIHRoaXMubmFtZSxcbiAgICAgICAgICAgICAgICB0aGlzLmFyZ3MubWFwKCh4KSA9PiB4LnRyYW5zZm9ybShmKSksXG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhdGlvbixcbiAgICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgcHJldHR5KCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBgJHt0aGlzLm5hbWV9KCR7dGhpcy5hcmdzLm1hcCgoeCkgPT4geC5wcmV0dHkoKSkuam9pbihcIiwgXCIpfSlgO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEFQR01FeHByLCB0eXBlIEFQR01Tb3VyY2VMb2NhdGlvbiB9IGZyb20gXCIuL2NvcmUudHNcIjtcbmltcG9ydCB7IFZhckFQR01FeHByIH0gZnJvbSBcIi4vdmFyLnRzXCI7XG5cbi8qKlxuICogTWFjcm8gZGVjbGFyYXRpb25cbiAqL1xuZXhwb3J0IGNsYXNzIE1hY3JvIHtcbiAgICAvKipcbiAgICAgKiBAcGFyYW0gbmFtZSBpbmNsdWRlICFcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHVibGljIHJlYWRvbmx5IG5hbWU6IHN0cmluZyxcbiAgICAgICAgcHVibGljIHJlYWRvbmx5IGFyZ3M6IFZhckFQR01FeHByW10sXG4gICAgICAgIHB1YmxpYyByZWFkb25seSBib2R5OiBBUEdNRXhwcixcbiAgICAgICAgcHVibGljIHJlYWRvbmx5IGxvY2F0aW9uOiBBUEdNU291cmNlTG9jYXRpb24gfCB1bmRlZmluZWQsXG4gICAgKSB7XG4gICAgfVxuXG4gICAgcHJldHR5KCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBgbWFjcm8gJHt0aGlzLm5hbWV9KCR7XG4gICAgICAgICAgICB0aGlzLmFyZ3MubWFwKCh4KSA9PiB4LnByZXR0eSgpKS5qb2luKFwiLCBcIilcbiAgICAgICAgfSkgJHt0aGlzLmJvZHkucHJldHR5KCl9YDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBTZXFBUEdNRXhwciB9IGZyb20gXCIuL3NlcS50c1wiO1xuaW1wb3J0IHsgTWFjcm8gfSBmcm9tIFwiLi9tYWNyby50c1wiO1xuaW1wb3J0IHsgSGVhZGVyIH0gZnJvbSBcIi4vaGVhZGVyLnRzXCI7XG5cbmV4cG9ydCBjbGFzcyBNYWluIHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHVibGljIHJlYWRvbmx5IG1hY3JvczogTWFjcm9bXSxcbiAgICAgICAgcHVibGljIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcltdLFxuICAgICAgICBwdWJsaWMgcmVhZG9ubHkgc2VxRXhwcjogU2VxQVBHTUV4cHIsXG4gICAgKSB7XG4gICAgfVxuXG4gICAgcHJldHR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYWNyb3MubWFwKChtKSA9PiBtLnByZXR0eSgpKS5qb2luKFwiXFxuXCIpICsgXCJcXG5cIiArXG4gICAgICAgICAgICB0aGlzLmhlYWRlcnMubWFwKChoKSA9PiBoLnRvU3RyaW5nKCkpLmpvaW4oXCJcXG5cIikgKyBcIlxcblwiICtcbiAgICAgICAgICAgIHRoaXMuc2VxRXhwci5wcmV0dHlJbm5lcigpO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBIZWFkZXIge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICAvKipcbiAgICAgICAgICogbmFtZSB3aXRob3V0IGAjYFxuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIHJlYWRvbmx5IG5hbWU6IHN0cmluZyxcbiAgICAgICAgcHVibGljIHJlYWRvbmx5IGNvbnRlbnQ6IHN0cmluZyxcbiAgICApIHt9XG5cbiAgICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBzcGFjZSA9IHRoaXMuY29udGVudC5zdGFydHNXaXRoKFwiIFwiKSA/IFwiXCIgOiBcIiBcIjtcbiAgICAgICAgcmV0dXJuIGAjJHt0aGlzLm5hbWV9JHtzcGFjZX0ke3RoaXMuY29udGVudH1gO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEFQR01FeHByLCB0eXBlIEFQR01Tb3VyY2VMb2NhdGlvbiB9IGZyb20gXCIuL2NvcmUudHNcIjtcblxuZXhwb3J0IGNsYXNzIE51bWJlckFQR01FeHByIGV4dGVuZHMgQVBHTUV4cHIge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwdWJsaWMgcmVhZG9ubHkgdmFsdWU6IG51bWJlcixcbiAgICAgICAgcHVibGljIHJlYWRvbmx5IGxvY2F0aW9uPzogQVBHTVNvdXJjZUxvY2F0aW9uIHwgdW5kZWZpbmVkLFxuICAgICkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHRyYW5zZm9ybShmOiAoXzogQVBHTUV4cHIpID0+IEFQR01FeHByKTogQVBHTUV4cHIge1xuICAgICAgICByZXR1cm4gZih0aGlzKTtcbiAgICB9XG5cbiAgICBwcmV0dHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlLnRvU3RyaW5nKCk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQVBHTUV4cHIsIHR5cGUgQVBHTVNvdXJjZUxvY2F0aW9uIH0gZnJvbSBcIi4vY29yZS50c1wiO1xuXG5leHBvcnQgY2xhc3MgU3RyaW5nQVBHTUV4cHIgZXh0ZW5kcyBBUEdNRXhwciB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHB1YmxpYyByZWFkb25seSB2YWx1ZTogc3RyaW5nLFxuICAgICAgICBwdWJsaWMgcmVhZG9ubHkgbG9jYXRpb24/OiBBUEdNU291cmNlTG9jYXRpb24gfCB1bmRlZmluZWQsXG4gICAgKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgdHJhbnNmb3JtKGY6IChfOiBBUEdNRXhwcikgPT4gQVBHTUV4cHIpOiBBUEdNRXhwciB7XG4gICAgICAgIHJldHVybiBmKHRoaXMpO1xuICAgIH1cblxuICAgIHByZXR0eSgpIHtcbiAgICAgICAgLy8gVE9ETzogZXNjYXBlXG4gICAgICAgIHJldHVybiBgXCJgICsgdGhpcy52YWx1ZSArIGBcImA7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQVBHTUV4cHIsIHR5cGUgQVBHTVNvdXJjZUxvY2F0aW9uIH0gZnJvbSBcIi4vY29yZS50c1wiO1xuXG5leHBvcnQgY2xhc3MgVmFyQVBHTUV4cHIgZXh0ZW5kcyBBUEdNRXhwciB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHB1YmxpYyByZWFkb25seSBuYW1lOiBzdHJpbmcsXG4gICAgICAgIHB1YmxpYyByZWFkb25seSBsb2NhdGlvbjogQVBHTVNvdXJjZUxvY2F0aW9uIHwgdW5kZWZpbmVkLFxuICAgICkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHRyYW5zZm9ybShmOiAoXzogQVBHTUV4cHIpID0+IEFQR01FeHByKTogQVBHTUV4cHIge1xuICAgICAgICByZXR1cm4gZih0aGlzKTtcbiAgICB9XG5cbiAgICBwcmV0dHkoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBBUEdNRXhwciB9IGZyb20gXCIuL2NvcmUudHNcIjtcblxuZXhwb3J0IGNsYXNzIFdoaWxlQVBHTUV4cHIgZXh0ZW5kcyBBUEdNRXhwciB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHB1YmxpYyByZWFkb25seSBtb2RpZmllcjogXCJaXCIgfCBcIk5aXCIsXG4gICAgICAgIHB1YmxpYyByZWFkb25seSBjb25kOiBBUEdNRXhwcixcbiAgICAgICAgcHVibGljIHJlYWRvbmx5IGJvZHk6IEFQR01FeHByLFxuICAgICkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHRyYW5zZm9ybShmOiAoXzogQVBHTUV4cHIpID0+IEFQR01FeHByKTogQVBHTUV4cHIge1xuICAgICAgICByZXR1cm4gZihcbiAgICAgICAgICAgIG5ldyBXaGlsZUFQR01FeHByKFxuICAgICAgICAgICAgICAgIHRoaXMubW9kaWZpZXIsXG4gICAgICAgICAgICAgICAgdGhpcy5jb25kLnRyYW5zZm9ybShmKSxcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkudHJhbnNmb3JtKGYpLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcmV0dHkoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGB3aGlsZV8ke1xuICAgICAgICAgICAgdGhpcy5tb2RpZmllciA9PT0gXCJaXCIgPyBcInpcIiA6IFwibnpcIlxuICAgICAgICB9KCR7dGhpcy5jb25kLnByZXR0eSgpfSkgJHt0aGlzLmJvZHkucHJldHR5KCl9YDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBBUEdNRXhwciB9IGZyb20gXCIuL2NvcmUudHNcIjtcbmltcG9ydCB7IElmQVBHTUV4cHIgfSBmcm9tIFwiLi9pZi50c1wiO1xuaW1wb3J0IHsgTG9vcEFQR01FeHByIH0gZnJvbSBcIi4vbG9vcC50c1wiO1xuaW1wb3J0IHsgV2hpbGVBUEdNRXhwciB9IGZyb20gXCIuL21vZC50c1wiO1xuXG5leHBvcnQgY2xhc3MgU2VxQVBHTUV4cHIgZXh0ZW5kcyBBUEdNRXhwciB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHB1YmxpYyByZWFkb25seSBleHByczogQVBHTUV4cHJbXSxcbiAgICApIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICB0cmFuc2Zvcm0oZjogKF86IEFQR01FeHByKSA9PiBBUEdNRXhwcik6IEFQR01FeHByIHtcbiAgICAgICAgcmV0dXJuIGYobmV3IFNlcUFQR01FeHByKHRoaXMuZXhwcnMubWFwKCh4KSA9PiB4LnRyYW5zZm9ybShmKSkpKTtcbiAgICB9XG5cbiAgICBwcmV0dHkoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGB7JHt0aGlzLnByZXR0eUlubmVyKCl9fWA7XG4gICAgfVxuXG4gICAgcHJldHR5SW5uZXIoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXhwcnMubWFwKCh4KSA9PiB7XG4gICAgICAgICAgICBpZiAoeCBpbnN0YW5jZW9mIElmQVBHTUV4cHIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geC5wcmV0dHkoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoeCBpbnN0YW5jZW9mIExvb3BBUEdNRXhwcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB4LnByZXR0eSgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh4IGluc3RhbmNlb2YgV2hpbGVBUEdNRXhwcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB4LnByZXR0eSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geC5wcmV0dHkoKSArIFwiO1wiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5qb2luKFwiXFxuXCIpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IGJuYiB9IGZyb20gXCIuLi8uLi9kZXBzLnRzXCI7XG5pbXBvcnQgeyBFcnJvcldpdGhMb2NhdGlvbiB9IGZyb20gXCIuLi9hc3QvbW9kLnRzXCI7XG5cbi8vIHBhcnNlIGVycm9yIGF0IGxpbmUgOCBjb2x1bW4gOTogZXhwZWN0ZWQgY29tbWVudCwgLCwgKVxuXG5leHBvcnQgZnVuY3Rpb24gcHJldHR5RXJyb3IoZmFpbDogYm5iLlBhcnNlRmFpbCwgc291cmNlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IGxpbmVzID0gc291cmNlLnNwbGl0KC9cXG58XFxyXFxuLyk7XG4gICAgY29uc3QgYWJvdmUgPSBsaW5lc1tmYWlsLmxvY2F0aW9uLmxpbmUgLSAyXTtcbiAgICBjb25zdCBlcnJvckxpbmUgPSBsaW5lc1tmYWlsLmxvY2F0aW9uLmxpbmUgLSAxXTtcbiAgICBjb25zdCBiZWxvdyA9IGxpbmVzW2ZhaWwubG9jYXRpb24ubGluZV07XG4gICAgY29uc3QgYXJyb3dMaW5lID0gXCIgXCIucmVwZWF0KE1hdGgubWF4KDAsIGZhaWwubG9jYXRpb24uY29sdW1uIC0gMSkpICsgXCJeXCI7XG5cbiAgICBjb25zdCBhYm92ZUxpbmVzID0gW1xuICAgICAgICAuLi4oYWJvdmUgPT09IHVuZGVmaW5lZCA/IFtdIDogW2Fib3ZlXSksXG4gICAgICAgIGVycm9yTGluZSxcbiAgICBdO1xuXG4gICAgY29uc3QgYmVsb3dMaW5lcyA9IFtcbiAgICAgICAgLi4uKGJlbG93ID09PSB1bmRlZmluZWQgPyBbXSA6IFtiZWxvd10pLFxuICAgIF07XG5cbiAgICBjb25zdCBwcmVmaXggPSBcInwgXCI7XG5cbiAgICBjb25zdCBlcnJvckxpbmVzID0gW1xuICAgICAgICAuLi5hYm92ZUxpbmVzLm1hcCgoeCkgPT4gcHJlZml4ICsgeCksXG4gICAgICAgIFwiIFwiLnJlcGVhdChwcmVmaXgubGVuZ3RoKSArIGFycm93TGluZSxcbiAgICAgICAgLi4uYmVsb3dMaW5lcy5tYXAoKHgpID0+IHByZWZpeCArIHgpLFxuICAgIF07XG5cbiAgICByZXR1cm4gW1xuICAgICAgICBgcGFyc2UgZXJyb3IgYXQgbGluZSAke2ZhaWwubG9jYXRpb24ubGluZX0gY29sdW1uICR7ZmFpbC5sb2NhdGlvbi5jb2x1bW59OmAsXG4gICAgICAgIGAgIGV4cGVjdGVkICR7ZmFpbC5leHBlY3RlZC5qb2luKFwiLCBcIil9YCxcbiAgICAgICAgYGAsXG4gICAgICAgIC4uLmVycm9yTGluZXMsXG4gICAgXS5qb2luKFwiXFxuXCIpO1xufVxuXG4vKipcbiAqIEBwYXJhbSBwYXJzZXJcbiAqIEBwYXJhbSBzb3VyY2Ugc291cmNlIHN0cmluZ1xuICogQHJldHVybnMgcGFyc2VkIHZhbHVlXG4gKiBAdGhyb3dzIEVycm9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVByZXR0eTxBPihwYXJzZXI6IGJuYi5QYXJzZXI8QT4sIHNvdXJjZTogc3RyaW5nKTogQSB7XG4gICAgY29uc3QgcmVzID0gcGFyc2VyLnBhcnNlKHNvdXJjZSk7XG4gICAgaWYgKHJlcy50eXBlID09PSBcIlBhcnNlT0tcIikge1xuICAgICAgICByZXR1cm4gcmVzLnZhbHVlO1xuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcldpdGhMb2NhdGlvbihwcmV0dHlFcnJvcihyZXMsIHNvdXJjZSksIHJlcy5sb2NhdGlvbik7XG59XG4iLCJpbXBvcnQgeyBibmIgfSBmcm9tIFwiLi4vLi4vZGVwcy50c1wiO1xuXG5pbXBvcnQgeyBuYXR1cmFsTnVtYmVyUGFyc2VyIH0gZnJvbSBcIi4vbnVtYmVyLnRzXCI7XG5pbXBvcnQgeyBwYXJzZVByZXR0eSB9IGZyb20gXCIuL3BhcnNlUHJldHR5LnRzXCI7XG5cbmltcG9ydCB7XG4gICAgQVBHTUV4cHIsXG4gICAgRnVuY0FQR01FeHByLFxuICAgIEhlYWRlcixcbiAgICBJZkFQR01FeHByLFxuICAgIExvb3BBUEdNRXhwcixcbiAgICBNYWNybyxcbiAgICBNYWluLFxuICAgIE51bWJlckFQR01FeHByLFxuICAgIFNlcUFQR01FeHByLFxuICAgIFN0cmluZ0FQR01FeHByLFxuICAgIFZhckFQR01FeHByLFxuICAgIFdoaWxlQVBHTUV4cHIsXG59IGZyb20gXCIuLi9hc3QvbW9kLnRzXCI7XG5cbi8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE2MTYwMTkwL3JlZ3VsYXItZXhwcmVzc2lvbi10by1maW5kLWMtc3R5bGUtYmxvY2stY29tbWVudHMjOn46dGV4dD0zNS0sVHJ5JTIwdXNpbmcsLSU1Qy8lNUMqKCU1QyooJTNGISU1Qy8pJTdDJTVCJTVFKiU1RCkqJTVDKiU1Qy9cbmV4cG9ydCBjb25zdCBjb21tZW50ID0gYm5iLm1hdGNoKC9cXC9cXCooXFwqKD8hXFwvKXxbXipdKSpcXCpcXC8vcykuZGVzYyhbXSAvKiDnhKHjgZcgKi8pO1xuXG4vKiog56m655m9ICovXG5leHBvcnQgY29uc3QgXzogYm5iLlBhcnNlcjx1bmRlZmluZWQ+ID0gYm5iLm1hdGNoKC9cXHMqLykuZGVzYyhbXCJzcGFjZVwiXSkuc2VwQnkoXG4gICAgY29tbWVudCxcbikubWFwKCgpID0+IHVuZGVmaW5lZCk7XG5cbmV4cG9ydCBjb25zdCBzb21lU3BhY2VzID0gYm5iLm1hdGNoKC9cXHMrLykuZGVzYyhbXCJzcGFjZVwiXSk7XG5cbi8qKlxuICog6K2Y5Yil5a2Q44Gu5q2j6KaP6KGo54++XG4gKi9cbmNvbnN0IGlkZW50aWZpZXJSZXhFeHAgPSAvW2EtekEtWl9dW2EtekEtWl8wLTldKi91O1xuZXhwb3J0IGNvbnN0IGlkZW50aWZpZXJPbmx5OiBibmIuUGFyc2VyPHN0cmluZz4gPSBibmIubWF0Y2goaWRlbnRpZmllclJleEV4cClcbiAgICAuZGVzYyhbXCJpZGVudGlmaWVyXCJdKTtcblxuZXhwb3J0IGNvbnN0IGlkZW50aWZpZXI6IGJuYi5QYXJzZXI8c3RyaW5nPiA9IF8ubmV4dChpZGVudGlmaWVyT25seSkuc2tpcChfKTtcbmV4cG9ydCBjb25zdCBpZGVudGlmaWVyV2l0aExvY2F0aW9uOiBibmIuUGFyc2VyPFtzdHJpbmcsIGJuYi5Tb3VyY2VMb2NhdGlvbl0+ID1cbiAgICBfLmNoYWluKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGJuYi5sb2NhdGlvbi5jaGFpbigobG9jKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gaWRlbnRpZmllck9ubHkuc2tpcChfKS5tYXAoKGlkZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtpZGVudCwgbG9jXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuLy8gY29tcGxldGlvbl9wYXJzZXIudHPjgajlkIjjgo/jgZvjgotcbmNvbnN0IG1hY3JvSWRlbnRpZmllclJlZ0V4cCA9IC9bYS16QS1aX11bYS16QS1aXzAtOV0qIS91O1xuXG5leHBvcnQgY29uc3QgbWFjcm9JZGVudGlmaWVyOiBibmIuUGFyc2VyPHN0cmluZz4gPSBfLm5leHQoXG4gICAgYm5iLm1hdGNoKG1hY3JvSWRlbnRpZmllclJlZ0V4cCksXG4pLnNraXAoXykuZGVzYyhbXCJtYWNybyBuYW1lXCJdKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHRva2VuKHM6IHN0cmluZyk6IGJuYi5QYXJzZXI8c3RyaW5nPiB7XG4gICAgcmV0dXJuIF8ubmV4dChibmIudGV4dChzKSkuc2tpcChfKTtcbn1cblxuLyoqIGAuYCAqL1xuZXhwb3J0IGNvbnN0IGNvbW1hID0gdG9rZW4oXCIsXCIpLmRlc2MoW1wiYCxgXCJdKTtcbi8qKiBgKGAgKi9cbmV4cG9ydCBjb25zdCBsZWZ0UGFyZW4gPSB0b2tlbihcIihcIikuZGVzYyhbXCJgKGBcIl0pO1xuLyoqIGApYCAqL1xuZXhwb3J0IGNvbnN0IHJpZ2h0UGFyZW4gPSB0b2tlbihcIilcIikuZGVzYyhbXCJgKWBcIl0pO1xuLyoqIGA7YCAqL1xuZXhwb3J0IGNvbnN0IHNlbWljb2xvbiA9IHRva2VuKFwiO1wiKS5kZXNjKFtcImA7YFwiXSk7XG5cbi8qKiBgKGAgKi9cbmV4cG9ydCBjb25zdCBjdXJseUxlZnQgPSB0b2tlbihcIntcIikuZGVzYyhbXCJge2BcIl0pO1xuLyoqIGApYCAqL1xuZXhwb3J0IGNvbnN0IGN1cmx5UmlnaHQgPSB0b2tlbihcIn1cIikuZGVzYyhbXCJgfWBcIl0pO1xuXG5leHBvcnQgY29uc3QgdmFyQVBHTUV4cHI6IGJuYi5QYXJzZXI8VmFyQVBHTUV4cHI+ID0gaWRlbnRpZmllcldpdGhMb2NhdGlvbi5tYXAoKFxuICAgIFtpZGVudCwgbG9jXSxcbikgPT4gbmV3IFZhckFQR01FeHByKGlkZW50LCBsb2MpKTtcblxuZnVuY3Rpb24gYXJnRXhwcnM8VD4oYXJnOiAoKSA9PiBibmIuUGFyc2VyPFQ+KTogYm5iLlBhcnNlcjxUW10+IHtcbiAgICByZXR1cm4gYm5iLmxhenkoKCkgPT4gYXJnKCkpLnNlcEJ5KGNvbW1hKS53cmFwKFxuICAgICAgICBsZWZ0UGFyZW4sXG4gICAgICAgIHJpZ2h0UGFyZW4sXG4gICAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZ1bmNBUEdNRXhwcigpOiBibmIuUGFyc2VyPEZ1bmNBUEdNRXhwcj4ge1xuICAgIHJldHVybiBfLm5leHQoYm5iLmxvY2F0aW9uKS5jaGFpbigobG9jYXRpb24pID0+IHtcbiAgICAgICAgcmV0dXJuIGJuYi5jaG9pY2UobWFjcm9JZGVudGlmaWVyLCBpZGVudGlmaWVyKS5jaGFpbigoaWRlbnQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhcmdFeHBycygoKSA9PiBhcGdtRXhwcigpKS5tYXAoXG4gICAgICAgICAgICAgICAgKGFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGdW5jQVBHTUV4cHIoaWRlbnQsIGFyZ3MsIGxvY2F0aW9uKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBjb25zdCBudW1iZXJBUEdNRXhwcjogYm5iLlBhcnNlcjxOdW1iZXJBUEdNRXhwcj4gPSBfLm5leHQoXG4gICAgYm5iLmxvY2F0aW9uLmNoYWluKChsb2MpID0+IHtcbiAgICAgICAgcmV0dXJuIG5hdHVyYWxOdW1iZXJQYXJzZXIubWFwKCh4KSA9PiBuZXcgTnVtYmVyQVBHTUV4cHIoeCwgbG9jKSk7XG4gICAgfSksXG4pLnNraXAoXyk7XG5cbi8vIFRPRE8gbG9jYXRpb25cbmV4cG9ydCBjb25zdCBzdHJpbmdMaXQ6IGJuYi5QYXJzZXI8c3RyaW5nPiA9IF8ubmV4dChibmIudGV4dChgXCJgKSkubmV4dChcbiAgICBibmIubWF0Y2goL1teXCJdKi8pLFxuKS5za2lwKFxuICAgIGJuYi50ZXh0KGBcImApLFxuKS5za2lwKF8pLmRlc2MoW1wic3RyaW5nXCJdKTtcbmV4cG9ydCBjb25zdCBzdHJpbmdBUEdNRXhwciA9IHN0cmluZ0xpdC5tYXAoKHgpID0+IG5ldyBTdHJpbmdBUEdNRXhwcih4KSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXFBUEdNRXhwclJhdygpOiBibmIuUGFyc2VyPEFQR01FeHByW10+IHtcbiAgICByZXR1cm4gYm5iLmxhenkoKCkgPT4gc3RhdGVtZW50KCkpLnJlcGVhdCgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VxQVBHTUV4cHIoKTogYm5iLlBhcnNlcjxTZXFBUEdNRXhwcj4ge1xuICAgIHJldHVybiBzZXFBUEdNRXhwclJhdygpLndyYXAoY3VybHlMZWZ0LCBjdXJseVJpZ2h0KS5tYXAoKHgpID0+XG4gICAgICAgIG5ldyBTZXFBUEdNRXhwcih4KVxuICAgICk7XG59XG5cbmV4cG9ydCBjb25zdCB3aGlsZUtleXdvcmQgPSBibmIuY2hvaWNlKHRva2VuKFwid2hpbGVfelwiKSwgdG9rZW4oXCJ3aGlsZV9uelwiKSkubWFwKFxuICAgICh4KSA9PiB4ID09PSBcIndoaWxlX3pcIiA/IFwiWlwiIDogXCJOWlwiLFxuKTtcblxuY29uc3QgZXhwcldpdGhQYXJlbjogYm5iLlBhcnNlcjxBUEdNRXhwcj4gPSBibmIubGF6eSgoKSA9PiBhcGdtRXhwcigpKS53cmFwKFxuICAgIGxlZnRQYXJlbixcbiAgICByaWdodFBhcmVuLFxuKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHdoaWxlQVBHTUV4cHIoKTogYm5iLlBhcnNlcjxXaGlsZUFQR01FeHByPiB7XG4gICAgcmV0dXJuIHdoaWxlS2V5d29yZC5jaGFpbigobW9kKSA9PiB7XG4gICAgICAgIHJldHVybiBleHByV2l0aFBhcmVuLmNoYWluKChjb25kKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYm5iLmxhenkoKCkgPT4gYXBnbUV4cHIoKSkubWFwKChib2R5KSA9PlxuICAgICAgICAgICAgICAgIG5ldyBXaGlsZUFQR01FeHByKG1vZCwgY29uZCwgYm9keSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9vcEFQR01FeHByKCk6IGJuYi5QYXJzZXI8TG9vcEFQR01FeHByPiB7XG4gICAgcmV0dXJuIHRva2VuKFwibG9vcFwiKS5uZXh0KGJuYi5sYXp5KCgpID0+IGFwZ21FeHByKCkpKS5tYXAoKHgpID0+XG4gICAgICAgIG5ldyBMb29wQVBHTUV4cHIoeClcbiAgICApO1xufVxuXG5leHBvcnQgY29uc3QgaWZLZXl3b3JkID0gYm5iLmNob2ljZSh0b2tlbihcImlmX3pcIiksIHRva2VuKFwiaWZfbnpcIikpLm1hcCgoeCkgPT5cbiAgICB4ID09PSBcImlmX3pcIiA/IFwiWlwiIDogXCJOWlwiXG4pO1xuXG5leHBvcnQgZnVuY3Rpb24gaWZBUEdNRXhwcigpOiBibmIuUGFyc2VyPElmQVBHTUV4cHI+IHtcbiAgICByZXR1cm4gaWZLZXl3b3JkLmNoYWluKChtb2QpID0+IHtcbiAgICAgICAgcmV0dXJuIGV4cHJXaXRoUGFyZW4uY2hhaW4oKGNvbmQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBibmIubGF6eSgoKSA9PiBhcGdtRXhwcigpKS5jaGFpbigoYm9keSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBibmIuY2hvaWNlKFxuICAgICAgICAgICAgICAgICAgICB0b2tlbihcImVsc2VcIikubmV4dChibmIubGF6eSgoKSA9PiBhcGdtRXhwcigpKSksXG4gICAgICAgICAgICAgICAgICAgIGJuYi5vayh1bmRlZmluZWQpLFxuICAgICAgICAgICAgICAgICkubWFwKChlbHNlQm9keSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IElmQVBHTUV4cHIobW9kLCBjb25kLCBib2R5LCBlbHNlQm9keSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbi8vIG1hY3JvIGYhKGEsIGIpXG5leHBvcnQgZnVuY3Rpb24gbWFjcm9IZWFkKCk6IGJuYi5QYXJzZXI8XG4gICAgeyBsb2M6IGJuYi5Tb3VyY2VMb2NhdGlvbjsgbmFtZTogc3RyaW5nOyBhcmdzOiBWYXJBUEdNRXhwcltdIH1cbj4ge1xuICAgIGNvbnN0IG1hY3JvS2V5d29yZDogYm5iLlBhcnNlcjxibmIuU291cmNlTG9jYXRpb24+ID0gXy5jaGFpbigoXykgPT4ge1xuICAgICAgICByZXR1cm4gYm5iLmxvY2F0aW9uLmNoYWluKChsb2NhdGlvbikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGJuYi50ZXh0KFwibWFjcm9cIikubmV4dChzb21lU3BhY2VzKS5tYXAoKF8pID0+IGxvY2F0aW9uKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gbWFjcm9LZXl3b3JkLmFuZChtYWNyb0lkZW50aWZpZXIpLmNoYWluKChbbG9jYXRpb24sIGlkZW50XSkgPT4ge1xuICAgICAgICByZXR1cm4gYXJnRXhwcnMoKCkgPT4gdmFyQVBHTUV4cHIpLm1hcChcbiAgICAgICAgICAgIChhcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgbG9jOiBsb2NhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogaWRlbnQsXG4gICAgICAgICAgICAgICAgICAgIGFyZ3M6IGFyZ3MsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogbWFjcm8gZiEoeCkge1xuICogICB4O1xuICogfVxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFjcm8oKTogYm5iLlBhcnNlcjxNYWNybz4ge1xuICAgIHJldHVybiBtYWNyb0hlYWQoKS5jaGFpbigoeyBsb2MsIG5hbWUsIGFyZ3MgfSkgPT4ge1xuICAgICAgICByZXR1cm4gYm5iLmxhenkoKCkgPT4gYXBnbUV4cHIoKSkubWFwKChib2R5KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IE1hY3JvKG5hbWUsIGFyZ3MsIGJvZHksIGxvYyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5jb25zdCBhbnl0aGluZ0xpbmU6IGJuYi5QYXJzZXI8c3RyaW5nPiA9IGJuYi5tYXRjaCgvLiovKTtcblxuLyog5pS56KGM44KS5ZCr44G+44Gq44GEICovXG5leHBvcnQgY29uc3QgaGVhZGVyID0gYm5iLnRleHQoXCIjXCIpLm5leHQoYm5iLm1hdGNoKC9SRUdJU1RFUlN8Q09NUE9ORU5UUy8pKVxuICAgIC5kZXNjKFtcIiNSRUdJU1RFUlNcIiwgXCIjQ09NUE9ORU5UU1wiXSkuY2hhaW4oKHgpID0+XG4gICAgICAgIGFueXRoaW5nTGluZS5tYXAoKGMpID0+IG5ldyBIZWFkZXIoeCwgYykpXG4gICAgKTtcblxuZXhwb3J0IGNvbnN0IGhlYWRlcnM6IGJuYi5QYXJzZXI8SGVhZGVyW10+ID0gXy5uZXh0KGhlYWRlcikuc2tpcChfKS5yZXBlYXQoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIG1haW4oKTogYm5iLlBhcnNlcjxNYWluPiB7XG4gICAgcmV0dXJuIG1hY3JvKCkucmVwZWF0KCkuY2hhaW4oKG1hY3JvcykgPT4ge1xuICAgICAgICByZXR1cm4gaGVhZGVycy5jaGFpbigoaCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIF8ubmV4dChzZXFBUEdNRXhwclJhdygpKS5za2lwKF8pLm1hcCgoeCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTWFpbihtYWNyb3MsIGgsIG5ldyBTZXFBUEdNRXhwcih4KSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU1haW4oc3RyOiBzdHJpbmcpOiBNYWluIHtcbiAgICByZXR1cm4gcGFyc2VQcmV0dHkobWFpbigpLCBzdHIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBnbUV4cHIoKTogYm5iLlBhcnNlcjxBUEdNRXhwcj4ge1xuICAgIHJldHVybiBibmIuY2hvaWNlKFxuICAgICAgICBsb29wQVBHTUV4cHIoKSxcbiAgICAgICAgd2hpbGVBUEdNRXhwcigpLFxuICAgICAgICBpZkFQR01FeHByKCksXG4gICAgICAgIGZ1bmNBUEdNRXhwcigpLFxuICAgICAgICBzZXFBUEdNRXhwcigpLFxuICAgICAgICB2YXJBUEdNRXhwcixcbiAgICAgICAgbnVtYmVyQVBHTUV4cHIsXG4gICAgICAgIHN0cmluZ0FQR01FeHByLFxuICAgICk7XG59XG5cbi8vIHNlcSA9IHsgc3RhdGVtZW50KiB9XG4vLyBzdGF0ZW1lbnQgPSBsb29wIHwgd2hpbGUgfCBpZiB8IChleHByIHdpdGggc2VtaWNvbG9uKTtcbi8vIGV4cHIgPSBsb29wIHwgd2hpbGUgfCBpZiB8IGZ1bmMgfCBzZXEgfCB2YXIgfCBudW0gfCBzdHJcblxuLy8gU2VxQVBHTUV4cHLjga7opoHntKBcbi8vIGVsZW1lbnQgb2YgU2VxQVBHTUV4cHJcbmV4cG9ydCBmdW5jdGlvbiBzdGF0ZW1lbnQoKTogYm5iLlBhcnNlcjxBUEdNRXhwcj4ge1xuICAgIHJldHVybiBibmIuY2hvaWNlKFxuICAgICAgICBsb29wQVBHTUV4cHIoKSxcbiAgICAgICAgd2hpbGVBUEdNRXhwcigpLFxuICAgICAgICBpZkFQR01FeHByKCksXG4gICAgICAgIGFwZ21FeHByKCkuc2tpcChzZW1pY29sb24pLFxuICAgICk7XG59XG4iLCIvKipcbiAqIExvdyBsZXZlbCBleHByZXNzaW9uXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBUEdMRXhwciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgfVxuXG4gICAgYWJzdHJhY3QgdHJhbnNmb3JtKGY6IChfOiBBUEdMRXhwcikgPT4gQVBHTEV4cHIpOiBBUEdMRXhwcjtcbn1cbiIsImltcG9ydCB7IEFQR0xFeHByIH0gZnJvbSBcIi4vY29yZS50c1wiO1xuXG5leHBvcnQgY2xhc3MgQWN0aW9uQVBHTEV4cHIgZXh0ZW5kcyBBUEdMRXhwciB7XG4gICAgY29uc3RydWN0b3IocHVibGljIHJlYWRvbmx5IGFjdGlvbnM6IHN0cmluZ1tdKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgdHJhbnNmb3JtKGY6IChfOiBBUEdMRXhwcikgPT4gQVBHTEV4cHIpOiBBUEdMRXhwciB7XG4gICAgICAgIHJldHVybiBmKHRoaXMpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEFQR0xFeHByIH0gZnJvbSBcIi4vY29yZS50c1wiO1xuXG4vKipcbiAqIFNlcXVlbnRpYWwgZXhwcmVzc2lvblxuICovXG5leHBvcnQgY2xhc3MgU2VxQVBHTEV4cHIgZXh0ZW5kcyBBUEdMRXhwciB7XG4gICAgY29uc3RydWN0b3IocHVibGljIHJlYWRvbmx5IGV4cHJzOiBBUEdMRXhwcltdKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgdHJhbnNmb3JtKGY6IChfOiBBUEdMRXhwcikgPT4gQVBHTEV4cHIpOiBBUEdMRXhwciB7XG4gICAgICAgIHJldHVybiBmKG5ldyBTZXFBUEdMRXhwcih0aGlzLmV4cHJzLm1hcCgoeCkgPT4geC50cmFuc2Zvcm0oZikpKSk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNFbXB0eUV4cHIoZXhwcjogQVBHTEV4cHIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZXhwciBpbnN0YW5jZW9mIFNlcUFQR0xFeHByICYmXG4gICAgICAgIGV4cHIuZXhwcnMuZXZlcnkoKGUpID0+IGlzRW1wdHlFeHByKGUpKTtcbn1cbiIsImltcG9ydCB7IEFQR0xFeHByIH0gZnJvbSBcIi4vY29yZS50c1wiO1xuXG4vKipcbiAqIGlmIGV4cHJlc3Npb25cbiAqL1xuZXhwb3J0IGNsYXNzIElmQVBHTEV4cHIgZXh0ZW5kcyBBUEdMRXhwciB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHB1YmxpYyByZWFkb25seSBjb25kOiBBUEdMRXhwcixcbiAgICAgICAgLyoqIFogKi9cbiAgICAgICAgcHVibGljIHJlYWRvbmx5IHRoZW5Cb2R5OiBBUEdMRXhwcixcbiAgICAgICAgLyoqIE5aICovXG4gICAgICAgIHB1YmxpYyByZWFkb25seSBlbHNlQm9keTogQVBHTEV4cHIsXG4gICAgKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgdHJhbnNmb3JtKGY6IChfOiBBUEdMRXhwcikgPT4gQVBHTEV4cHIpOiBBUEdMRXhwciB7XG4gICAgICAgIHJldHVybiBmKFxuICAgICAgICAgICAgbmV3IElmQVBHTEV4cHIoXG4gICAgICAgICAgICAgICAgdGhpcy5jb25kLnRyYW5zZm9ybShmKSxcbiAgICAgICAgICAgICAgICB0aGlzLnRoZW5Cb2R5LnRyYW5zZm9ybShmKSxcbiAgICAgICAgICAgICAgICB0aGlzLmVsc2VCb2R5LnRyYW5zZm9ybShmKSxcbiAgICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgQVBHTEV4cHIgfSBmcm9tIFwiLi9jb3JlLnRzXCI7XG5cbmV4cG9ydCBjbGFzcyBMb29wQVBHTEV4cHIgZXh0ZW5kcyBBUEdMRXhwciB7XG4gICAgcHJpdmF0ZSBraW5kOiBzdHJpbmcgPSBcImxvb3BcIjtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHVibGljIHJlYWRvbmx5IGJvZHk6IEFQR0xFeHByLFxuICAgICkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIG92ZXJyaWRlIHRyYW5zZm9ybShmOiAoXzogQVBHTEV4cHIpID0+IEFQR0xFeHByKTogQVBHTEV4cHIge1xuICAgICAgICByZXR1cm4gZihuZXcgTG9vcEFQR0xFeHByKHRoaXMuYm9keS50cmFuc2Zvcm0oZikpKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBBUEdMRXhwciB9IGZyb20gXCIuL2NvcmUudHNcIjtcblxuZXhwb3J0IGNsYXNzIFdoaWxlQVBHTEV4cHIgZXh0ZW5kcyBBUEdMRXhwciB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHB1YmxpYyByZWFkb25seSBtb2RpZmllcjogXCJaXCIgfCBcIk5aXCIsXG4gICAgICAgIHB1YmxpYyByZWFkb25seSBjb25kOiBBUEdMRXhwcixcbiAgICAgICAgcHVibGljIHJlYWRvbmx5IGJvZHk6IEFQR0xFeHByLFxuICAgICkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIG92ZXJyaWRlIHRyYW5zZm9ybShmOiAoXzogQVBHTEV4cHIpID0+IEFQR0xFeHByKTogQVBHTEV4cHIge1xuICAgICAgICByZXR1cm4gZihcbiAgICAgICAgICAgIG5ldyBXaGlsZUFQR0xFeHByKFxuICAgICAgICAgICAgICAgIHRoaXMubW9kaWZpZXIsXG4gICAgICAgICAgICAgICAgdGhpcy5jb25kLnRyYW5zZm9ybShmKSxcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkudHJhbnNmb3JtKGYpLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBBUEdMRXhwciB9IGZyb20gXCIuL2NvcmUudHNcIjtcblxuZXhwb3J0IGNsYXNzIEJyZWFrQVBHTEV4cHIgZXh0ZW5kcyBBUEdMRXhwciB7XG4gICAgcHJpdmF0ZSBraW5kID0gXCJicmVha1wiO1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSBsZXZlbCBkZWZhdWx0IGlzIDFcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVhZG9ubHkgbGV2ZWw6IG51bWJlciB8IHVuZGVmaW5lZCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIG92ZXJyaWRlIHRyYW5zZm9ybShmOiAoXzogQVBHTEV4cHIpID0+IEFQR0xFeHByKTogQVBHTEV4cHIge1xuICAgICAgICByZXR1cm4gZih0aGlzKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBBY3Rpb25BUEdMRXhwciB9IGZyb20gXCIuL2FzdC9tb2QudHNcIjtcblxuLyoqXG4gKiBBY3Rpb25zXG4gKi9cbmV4cG9ydCBjbGFzcyBBIHtcbiAgICAvLyBVXG4gICAgc3RhdGljIGluY1UobjogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBBLm5vblJldHVybihgSU5DIFUke259YCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGluY1VNdWx0aSguLi5hcmdzOiBudW1iZXJbXSkge1xuICAgICAgICByZXR1cm4gbmV3IEFjdGlvbkFQR0xFeHByKFsuLi5hcmdzLm1hcCgoeCkgPT4gYElOQyBVJHt4fWApLCBcIk5PUFwiXSk7XG4gICAgfVxuXG4gICAgc3RhdGljIHRkZWNVKG46IG51bWJlcikge1xuICAgICAgICByZXR1cm4gQS5zaW5nbGUoYFRERUMgVSR7bn1gKTtcbiAgICB9XG5cbiAgICAvLyBBRERcbiAgICBzdGF0aWMgYWRkQTEoKSB7XG4gICAgICAgIHJldHVybiBBLm5vblJldHVybihgQUREIEExYCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGFkZEIwKCkge1xuICAgICAgICByZXR1cm4gQS5zaW5nbGUoXCJBREQgQjBcIik7XG4gICAgfVxuXG4gICAgc3RhdGljIGFkZEIxKCkge1xuICAgICAgICByZXR1cm4gQS5zaW5nbGUoXCJBREQgQjFcIik7XG4gICAgfVxuXG4gICAgLy8gQjJEXG4gICAgc3RhdGljIGluY0IyRFgoKSB7XG4gICAgICAgIHJldHVybiBBLm5vblJldHVybihcIklOQyBCMkRYXCIpO1xuICAgIH1cblxuICAgIHN0YXRpYyB0ZGVjQjJEWCgpIHtcbiAgICAgICAgcmV0dXJuIEEuc2luZ2xlKFwiVERFQyBCMkRYXCIpO1xuICAgIH1cblxuICAgIHN0YXRpYyBpbmNCMkRZKCkge1xuICAgICAgICByZXR1cm4gQS5ub25SZXR1cm4oXCJJTkMgQjJEWVwiKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgdGRlY0IyRFkoKSB7XG4gICAgICAgIHJldHVybiBBLnNpbmdsZShcIlRERUMgQjJEWVwiKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcmVhZEIyRCgpIHtcbiAgICAgICAgcmV0dXJuIEEuc2luZ2xlKFwiUkVBRCBCMkRcIik7XG4gICAgfVxuXG4gICAgc3RhdGljIHNldEIyRCgpIHtcbiAgICAgICAgcmV0dXJuIEEubm9uUmV0dXJuKFwiU0VUIEIyRFwiKTtcbiAgICB9XG5cbiAgICAvLyBCXG4gICAgc3RhdGljIGluY0IobjogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBBLm5vblJldHVybihgSU5DIEIke259YCk7XG4gICAgfVxuXG4gICAgc3RhdGljIHRkZWNCKG46IG51bWJlcikge1xuICAgICAgICByZXR1cm4gQS5zaW5nbGUoYFRERUMgQiR7bn1gKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcmVhZEIobjogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBBLnNpbmdsZShgUkVBRCBCJHtufWApO1xuICAgIH1cblxuICAgIHN0YXRpYyBzZXRCKG46IG51bWJlcikge1xuICAgICAgICByZXR1cm4gQS5ub25SZXR1cm4oYFNFVCBCJHtufWApO1xuICAgIH1cblxuICAgIHN0YXRpYyBoYWx0T1VUKCkge1xuICAgICAgICByZXR1cm4gQS5zaW5nbGUoXCJIQUxUX09VVFwiKTtcbiAgICB9XG5cbiAgICAvLyBNVUxcbiAgICBzdGF0aWMgbXVsMCgpIHtcbiAgICAgICAgcmV0dXJuIEEuc2luZ2xlKFwiTVVMIDBcIik7XG4gICAgfVxuXG4gICAgc3RhdGljIG11bDEoKSB7XG4gICAgICAgIHJldHVybiBBLnNpbmdsZShcIk1VTCAxXCIpO1xuICAgIH1cblxuICAgIC8vIE5PUFxuICAgIHN0YXRpYyBub3AoKSB7XG4gICAgICAgIHJldHVybiBBLnNpbmdsZShcIk5PUFwiKTtcbiAgICB9XG5cbiAgICAvLyBPVVRQVVRcbiAgICBzdGF0aWMgb3V0cHV0KGM6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gQS5ub25SZXR1cm4oYE9VVFBVVCAke2N9YCk7XG4gICAgfVxuXG4gICAgLy8gU1VCXG4gICAgc3RhdGljIHN1YkExKCkge1xuICAgICAgICByZXR1cm4gQS5ub25SZXR1cm4oYFNVQiBBMWApO1xuICAgIH1cblxuICAgIHN0YXRpYyBzdWJCMCgpIHtcbiAgICAgICAgcmV0dXJuIEEuc2luZ2xlKGBTVUIgQjBgKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgc3ViQjEoKSB7XG4gICAgICAgIHJldHVybiBBLnNpbmdsZShgU1VCIEIxYCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgbm9uUmV0dXJuKGFjdDogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBuZXcgQWN0aW9uQVBHTEV4cHIoW2FjdCwgXCJOT1BcIl0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIHNpbmdsZShhY3Q6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gbmV3IEFjdGlvbkFQR0xFeHByKFthY3RdKTtcbiAgICB9XG59XG4iLCJpbXBvcnQge1xuICAgIEFQR01FeHByLFxuICAgIEVycm9yV2l0aExvY2F0aW9uLFxuICAgIGZvcm1hdExvY2F0aW9uQXQsXG4gICAgRnVuY0FQR01FeHByLFxuICAgIElmQVBHTUV4cHIsXG4gICAgTG9vcEFQR01FeHByLFxuICAgIE51bWJlckFQR01FeHByLFxuICAgIFNlcUFQR01FeHByLFxuICAgIFN0cmluZ0FQR01FeHByLFxuICAgIFZhckFQR01FeHByLFxuICAgIFdoaWxlQVBHTUV4cHIsXG59IGZyb20gXCIuLi9hcGdtL2FzdC9tb2QudHNcIjtcblxuaW1wb3J0IHtcbiAgICBBUEdMRXhwcixcbiAgICBCcmVha0FQR0xFeHByLFxuICAgIElmQVBHTEV4cHIsXG4gICAgTG9vcEFQR0xFeHByLFxuICAgIFNlcUFQR0xFeHByLFxuICAgIFdoaWxlQVBHTEV4cHIsXG59IGZyb20gXCIuLi9hcGdsL2FzdC9tb2QudHNcIjtcbmltcG9ydCB7IEEgfSBmcm9tIFwiLi4vYXBnbC9hY3Rpb25zLnRzXCI7XG5cbmZ1bmN0aW9uIHRyYW5zcGlsZUVtcHR5QXJnRnVuYyhmdW5jRXhwcjogRnVuY0FQR01FeHByLCBleHByOiBBUEdMRXhwcikge1xuICAgIGlmIChmdW5jRXhwci5hcmdzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3JXaXRoTG9jYXRpb24oXG4gICAgICAgICAgICBgYXJndW1lbnQgZ2l2ZW4gdG8gXCIke2Z1bmNFeHByLm5hbWV9XCIke1xuICAgICAgICAgICAgICAgIGZvcm1hdExvY2F0aW9uQXQoZnVuY0V4cHIubG9jYXRpb24pXG4gICAgICAgICAgICB9YCxcbiAgICAgICAgICAgIGZ1bmNFeHByLmxvY2F0aW9uLFxuICAgICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gZXhwcjtcbn1cblxuZnVuY3Rpb24gdHJhbnNwaWxlTnVtQXJnRnVuYyhcbiAgICBmdW5jRXhwcjogRnVuY0FQR01FeHByLFxuICAgIGV4cHI6IChfOiBudW1iZXIpID0+IEFQR0xFeHByLFxuKSB7XG4gICAgaWYgKGZ1bmNFeHByLmFyZ3MubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcldpdGhMb2NhdGlvbihcbiAgICAgICAgICAgIGBudW1iZXIgb2YgYXJndW1lbnRzIGlzIG5vdCAxOiBcIiR7ZnVuY0V4cHIubmFtZX1cIiR7XG4gICAgICAgICAgICAgICAgZm9ybWF0TG9jYXRpb25BdChmdW5jRXhwci5sb2NhdGlvbilcbiAgICAgICAgICAgIH1gLFxuICAgICAgICAgICAgZnVuY0V4cHIubG9jYXRpb24sXG4gICAgICAgICk7XG4gICAgfVxuICAgIGNvbnN0IGFyZyA9IGZ1bmNFeHByLmFyZ3NbMF07XG4gICAgaWYgKCEoYXJnIGluc3RhbmNlb2YgTnVtYmVyQVBHTUV4cHIpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcldpdGhMb2NhdGlvbihcbiAgICAgICAgICAgIGBhcmd1bWVudCBpcyBub3QgYSBudW1iZXI6IFwiJHtmdW5jRXhwci5uYW1lfVwiJHtcbiAgICAgICAgICAgICAgICBmb3JtYXRMb2NhdGlvbkF0KGZ1bmNFeHByLmxvY2F0aW9uKVxuICAgICAgICAgICAgfWAsXG4gICAgICAgICAgICBmdW5jRXhwci5sb2NhdGlvbixcbiAgICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIGV4cHIoYXJnLnZhbHVlKTtcbn1cblxuZnVuY3Rpb24gdHJhbnNwaWxlU3RyaW5nQXJnRnVuYyhcbiAgICBmdW5jRXhwcjogRnVuY0FQR01FeHByLFxuICAgIGV4cHI6IChfOiBzdHJpbmcpID0+IEFQR0xFeHByLFxuKSB7XG4gICAgaWYgKGZ1bmNFeHByLmFyZ3MubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcldpdGhMb2NhdGlvbihcbiAgICAgICAgICAgIGBudW1iZXIgb2YgYXJndW1lbnRzIGlzIG5vdCAxOiBcIiR7ZnVuY0V4cHIubmFtZX1cIiR7XG4gICAgICAgICAgICAgICAgZm9ybWF0TG9jYXRpb25BdChmdW5jRXhwci5sb2NhdGlvbilcbiAgICAgICAgICAgIH1gLFxuICAgICAgICAgICAgZnVuY0V4cHIubG9jYXRpb24sXG4gICAgICAgICk7XG4gICAgfVxuICAgIGNvbnN0IGFyZyA9IGZ1bmNFeHByLmFyZ3NbMF07XG4gICAgaWYgKCEoYXJnIGluc3RhbmNlb2YgU3RyaW5nQVBHTUV4cHIpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcldpdGhMb2NhdGlvbihcbiAgICAgICAgICAgIGBhcmd1bWVudCBpcyBub3QgYSBzdHJpbmc6IFwiJHtmdW5jRXhwci5uYW1lfVwiJHtcbiAgICAgICAgICAgICAgICBmb3JtYXRMb2NhdGlvbkF0KGZ1bmNFeHByLmxvY2F0aW9uKVxuICAgICAgICAgICAgfWAsXG4gICAgICAgICAgICBmdW5jRXhwci5sb2NhdGlvbixcbiAgICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIGV4cHIoYXJnLnZhbHVlKTtcbn1cblxuZXhwb3J0IGNvbnN0IGVtcHR5QXJnRnVuY3M6IE1hcDxzdHJpbmcsIEFQR0xFeHByPiA9IG5ldyBNYXAoW1xuICAgIFtcIm5vcFwiLCBBLm5vcCgpXSxcbiAgICAvLyBCMkRcbiAgICBbXCJpbmNfYjJkeFwiLCBBLmluY0IyRFgoKV0sXG4gICAgW1wiaW5jX2IyZHlcIiwgQS5pbmNCMkRZKCldLFxuICAgIFtcInRkZWNfYjJkeFwiLCBBLnRkZWNCMkRYKCldLFxuICAgIFtcInRkZWNfYjJkeVwiLCBBLnRkZWNCMkRZKCldLFxuICAgIFtcInJlYWRfYjJkXCIsIEEucmVhZEIyRCgpXSxcbiAgICBbXCJzZXRfYjJkXCIsIEEuc2V0QjJEKCldLFxuICAgIC8vIEFERFxuICAgIFtcImFkZF9hMVwiLCBBLmFkZEExKCldLFxuICAgIFtcImFkZF9iMFwiLCBBLmFkZEIwKCldLFxuICAgIFtcImFkZF9iMVwiLCBBLmFkZEIxKCldLFxuICAgIC8vIFNVQlxuICAgIFtcInN1Yl9hMVwiLCBBLnN1YkExKCldLFxuICAgIFtcInN1Yl9iMFwiLCBBLnN1YkIwKCldLFxuICAgIFtcInN1Yl9iMVwiLCBBLnN1YkIxKCldLFxuICAgIC8vIE1VTFxuICAgIFtcIm11bF8wXCIsIEEubXVsMCgpXSxcbiAgICBbXCJtdWxfMVwiLCBBLm11bDEoKV0sXG4gICAgLy8gSEFMVF9PVVRcbiAgICBbXCJoYWx0X291dFwiLCBBLmhhbHRPVVQoKV0sXG5dKTtcblxuZXhwb3J0IGNvbnN0IG51bUFyZ0Z1bmNzOiBNYXA8c3RyaW5nLCAoXzogbnVtYmVyKSA9PiBBUEdMRXhwcj4gPSBuZXcgTWFwKFtcbiAgICAvLyBVXG4gICAgW1wiaW5jX3VcIiwgQS5pbmNVXSxcbiAgICBbXCJ0ZGVjX3VcIiwgQS50ZGVjVV0sXG4gICAgLy8gQlxuICAgIFtcImluY19iXCIsIEEuaW5jQl0sXG4gICAgW1widGRlY19iXCIsIEEudGRlY0JdLFxuICAgIFtcInJlYWRfYlwiLCBBLnJlYWRCXSxcbiAgICBbXCJzZXRfYlwiLCBBLnNldEJdLFxuXSk7XG5cbmV4cG9ydCBjb25zdCBzdHJBcmdGdW5jczogTWFwPHN0cmluZywgKF86IHN0cmluZykgPT4gQVBHTEV4cHI+ID0gbmV3IE1hcChbXG4gICAgLy8gT1VUUFVUXG4gICAgW1wib3V0cHV0XCIsIEEub3V0cHV0XSxcbl0pO1xuXG5mdW5jdGlvbiB0cmFuc3BpbGVGdW5jQVBHTUV4cHIoZnVuY0V4cHI6IEZ1bmNBUEdNRXhwcik6IEFQR0xFeHByIHtcbiAgICBjb25zdCBlbXB0eU9yVW5kZWZpbmVkID0gZW1wdHlBcmdGdW5jcy5nZXQoZnVuY0V4cHIubmFtZSk7XG4gICAgaWYgKGVtcHR5T3JVbmRlZmluZWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdHJhbnNwaWxlRW1wdHlBcmdGdW5jKGZ1bmNFeHByLCBlbXB0eU9yVW5kZWZpbmVkKTtcbiAgICB9XG5cbiAgICBjb25zdCBudW1BcmdPclVuZGVmaW5lZCA9IG51bUFyZ0Z1bmNzLmdldChmdW5jRXhwci5uYW1lKTtcbiAgICBpZiAobnVtQXJnT3JVbmRlZmluZWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdHJhbnNwaWxlTnVtQXJnRnVuYyhmdW5jRXhwciwgbnVtQXJnT3JVbmRlZmluZWQpO1xuICAgIH1cblxuICAgIGNvbnN0IHN0ckFyZ09yVW5kZWZpbmVkID0gc3RyQXJnRnVuY3MuZ2V0KGZ1bmNFeHByLm5hbWUpO1xuICAgIGlmIChzdHJBcmdPclVuZGVmaW5lZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB0cmFuc3BpbGVTdHJpbmdBcmdGdW5jKGZ1bmNFeHByLCBzdHJBcmdPclVuZGVmaW5lZCk7XG4gICAgfVxuXG4gICAgc3dpdGNoIChmdW5jRXhwci5uYW1lKSB7XG4gICAgICAgIC8vIGJyZWFrXG4gICAgICAgIGNhc2UgXCJicmVha1wiOiB7XG4gICAgICAgICAgICBpZiAoZnVuY0V4cHIuYXJncy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEJyZWFrQVBHTEV4cHIodW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zcGlsZU51bUFyZ0Z1bmMoXG4gICAgICAgICAgICAgICAgICAgIGZ1bmNFeHByLFxuICAgICAgICAgICAgICAgICAgICAoeCkgPT4gbmV3IEJyZWFrQVBHTEV4cHIoeCksXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1hY3JvXG5cbiAgICAgICAgY2FzZSBcInJlcGVhdFwiOiB7XG4gICAgICAgICAgICBpZiAoZnVuY0V4cHIuYXJncy5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3JXaXRoTG9jYXRpb24oXG4gICAgICAgICAgICAgICAgICAgIGBcInJlcGVhdFwiIHRha2VzIHR3byBhcmd1bWVudHMke1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0TG9jYXRpb25BdChmdW5jRXhwci5sb2NhdGlvbilcbiAgICAgICAgICAgICAgICAgICAgfWAsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmNFeHByLmxvY2F0aW9uLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBuID0gZnVuY0V4cHIuYXJnc1swXTtcbiAgICAgICAgICAgIGlmICghKG4gaW5zdGFuY2VvZiBOdW1iZXJBUEdNRXhwcikpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3JXaXRoTG9jYXRpb24oXG4gICAgICAgICAgICAgICAgICAgIGBmaXJzdCBhcmd1bWVudCBvZiBcInJlcGVhdFwiIG11c3QgYmUgYSBudW1iZXIke1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0TG9jYXRpb25BdChmdW5jRXhwci5sb2NhdGlvbilcbiAgICAgICAgICAgICAgICAgICAgfWAsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmNFeHByLmxvY2F0aW9uLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBleHByID0gZnVuY0V4cHIuYXJnc1sxXTtcbiAgICAgICAgICAgIGNvbnN0IGFwZ2wgPSB0cmFuc3BpbGVBUEdNRXhwcihleHByKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgU2VxQVBHTEV4cHIoQXJyYXkobi52YWx1ZSkuZmlsbCgwKS5tYXAoKCkgPT4gYXBnbCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yV2l0aExvY2F0aW9uKFxuICAgICAgICBgVW5rbm93biBmdW5jdGlvbjogXCIke2Z1bmNFeHByLm5hbWV9XCIke1xuICAgICAgICAgICAgZm9ybWF0TG9jYXRpb25BdChmdW5jRXhwci5sb2NhdGlvbilcbiAgICAgICAgfWAsXG4gICAgICAgIGZ1bmNFeHByLmxvY2F0aW9uLFxuICAgICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc3BpbGVBUEdNRXhwcihlOiBBUEdNRXhwcik6IEFQR0xFeHByIHtcbiAgICBjb25zdCB0ID0gdHJhbnNwaWxlQVBHTUV4cHI7XG4gICAgaWYgKGUgaW5zdGFuY2VvZiBGdW5jQVBHTUV4cHIpIHtcbiAgICAgICAgcmV0dXJuIHRyYW5zcGlsZUZ1bmNBUEdNRXhwcihlKTtcbiAgICB9IGVsc2UgaWYgKGUgaW5zdGFuY2VvZiBJZkFQR01FeHByKSB7XG4gICAgICAgIGlmIChlLm1vZGlmaWVyID09PSBcIlpcIikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBJZkFQR0xFeHByKFxuICAgICAgICAgICAgICAgIHQoZS5jb25kKSxcbiAgICAgICAgICAgICAgICB0KGUudGhlbkJvZHkpLFxuICAgICAgICAgICAgICAgIGUuZWxzZUJvZHkgPT09IHVuZGVmaW5lZCA/IG5ldyBTZXFBUEdMRXhwcihbXSkgOiB0KGUuZWxzZUJvZHkpLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgSWZBUEdMRXhwcihcbiAgICAgICAgICAgICAgICB0KGUuY29uZCksXG4gICAgICAgICAgICAgICAgZS5lbHNlQm9keSA9PT0gdW5kZWZpbmVkID8gbmV3IFNlcUFQR0xFeHByKFtdKSA6IHQoZS5lbHNlQm9keSksXG4gICAgICAgICAgICAgICAgdChlLnRoZW5Cb2R5KSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGUgaW5zdGFuY2VvZiBMb29wQVBHTUV4cHIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBMb29wQVBHTEV4cHIodChlLmJvZHkpKTtcbiAgICB9IGVsc2UgaWYgKGUgaW5zdGFuY2VvZiBOdW1iZXJBUEdNRXhwcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3JXaXRoTG9jYXRpb24oXG4gICAgICAgICAgICBgbnVtYmVyIGlzIG5vdCBhbGxvd2VkOiAke2UudmFsdWV9JHtmb3JtYXRMb2NhdGlvbkF0KGUubG9jYXRpb24pfWAsXG4gICAgICAgICAgICBlLmxvY2F0aW9uLFxuICAgICAgICApO1xuICAgIH0gZWxzZSBpZiAoZSBpbnN0YW5jZW9mIFNlcUFQR01FeHByKSB7XG4gICAgICAgIHJldHVybiBuZXcgU2VxQVBHTEV4cHIoZS5leHBycy5tYXAoKHgpID0+IHQoeCkpKTtcbiAgICB9IGVsc2UgaWYgKGUgaW5zdGFuY2VvZiBTdHJpbmdBUEdNRXhwcikge1xuICAgICAgICB0aHJvdyBFcnJvcihgc3RyaW5nIGlzIG5vdCBhbGxvd2VkOiAke2UucHJldHR5KCl9YCk7XG4gICAgfSBlbHNlIGlmIChlIGluc3RhbmNlb2YgVmFyQVBHTUV4cHIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yV2l0aExvY2F0aW9uKFxuICAgICAgICAgICAgYG1hY3JvIHZhcmlhYmxlIGlzIG5vdCBhbGxvd2VkOiB2YXJpYWJsZSBcIiR7ZS5uYW1lfVwiJHtcbiAgICAgICAgICAgICAgICBmb3JtYXRMb2NhdGlvbkF0KGUubG9jYXRpb24pXG4gICAgICAgICAgICB9YCxcbiAgICAgICAgICAgIGUubG9jYXRpb24sXG4gICAgICAgICk7XG4gICAgfSBlbHNlIGlmIChlIGluc3RhbmNlb2YgV2hpbGVBUEdNRXhwcikge1xuICAgICAgICByZXR1cm4gbmV3IFdoaWxlQVBHTEV4cHIoZS5tb2RpZmllciwgdChlLmNvbmQpLCB0KGUuYm9keSkpO1xuICAgIH1cblxuICAgIHRocm93IEVycm9yKFwiaW50ZXJuYWwgZXJyb3JcIik7XG59XG4iLCJpbXBvcnQge1xuICAgIEFjdGlvbkFQR0xFeHByLFxuICAgIEFQR0xFeHByLFxuICAgIEJyZWFrQVBHTEV4cHIsXG4gICAgSWZBUEdMRXhwcixcbiAgICBpc0VtcHR5RXhwcixcbiAgICBMb29wQVBHTEV4cHIsXG4gICAgU2VxQVBHTEV4cHIsXG4gICAgV2hpbGVBUEdMRXhwcixcbn0gZnJvbSBcIi4uL2FwZ2wvYXN0L21vZC50c1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRyYW5zcGlsZXJPcHRpb25zIHtcbiAgICBwcmVmaXg/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBDb250ZXh0IHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgLyoqXG4gICAgICAgICAqIGlucHV044GL44KJ5aeL44G+44KL44Kz44Oe44Oz44OJ44KS5Ye65Yqb44GZ44KLXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgcmVhZG9ubHkgaW5wdXQ6IHN0cmluZyxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWHuuWKm+eKtuaFi1xuICAgICAgICAgKi9cbiAgICAgICAgcHVibGljIHJlYWRvbmx5IG91dHB1dDogc3RyaW5nLFxuICAgICAgICAvKipcbiAgICAgICAgICogaW5wdXTjga7jgrPjg57jg7Pjg4njga7lhaXliptcbiAgICAgICAgICogWuOAgU5a44Gu5aC05ZCI44Gv5pyA5Yid44Gu6KaB57Sg44Gr5YiG5bKQ44Gu44Kz44Oe44Oz44OJ44KS5Ye65Yqb44GZ44KL44GT44GoXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgcmVhZG9ubHkgaW5wdXRaTlo6IFwiKlwiIHwgXCJaXCIgfCBcIk5aXCIsXG4gICAgKSB7fVxufVxuXG50eXBlIExpbmUgPSBzdHJpbmc7XG5cbmV4cG9ydCBjbGFzcyBUcmFuc3BpbGVyIHtcbiAgICBwcml2YXRlIGlkID0gMDtcbiAgICBwcml2YXRlIGxvb3BGaW5hbFN0YXRlczogc3RyaW5nW10gPSBbXTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IHByZWZpeDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogVHJhbnNwaWxlck9wdGlvbnMgPSB7fSkge1xuICAgICAgICB0aGlzLnByZWZpeCA9IG9wdGlvbnMucHJlZml4ID8/IFwiU1RBVEVfXCI7XG4gICAgfVxuXG4gICAgZ2V0RnJlc2hOYW1lKCk6IHN0cmluZyB7XG4gICAgICAgIHRoaXMuaWQrKztcbiAgICAgICAgcmV0dXJuIGAke3RoaXMucHJlZml4fSR7dGhpcy5pZH1gO1xuICAgIH1cblxuICAgIGVtaXRMaW5lKFxuICAgICAgICB7IGN1cnJlbnRTdGF0ZSwgcHJldk91dHB1dCwgbmV4dFN0YXRlLCBhY3Rpb25zIH06IHtcbiAgICAgICAgICAgIGN1cnJlbnRTdGF0ZTogc3RyaW5nO1xuICAgICAgICAgICAgcHJldk91dHB1dDogXCJaXCIgfCBcIk5aXCIgfCBcIipcIiB8IFwiWlpcIjtcbiAgICAgICAgICAgIG5leHRTdGF0ZTogc3RyaW5nO1xuICAgICAgICAgICAgYWN0aW9uczogc3RyaW5nW107XG4gICAgICAgIH0sXG4gICAgKTogTGluZVtdIHtcbiAgICAgICAgaWYgKGFjdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcImFjdGlvbiBtdXN0IGJlIG5vbmVtcHR5XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIGAke2N1cnJlbnRTdGF0ZX07ICR7cHJldk91dHB1dH07ICR7bmV4dFN0YXRlfTsgJHtcbiAgICAgICAgICAgICAgICBhY3Rpb25zLmpvaW4oXCIsIFwiKVxuICAgICAgICAgICAgfWAsXG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgZW1pdFRyYW5zaXRpb24oXG4gICAgICAgIGN1cnJlbnQ6IHN0cmluZyxcbiAgICAgICAgbmV4dDogc3RyaW5nLFxuICAgICAgICBpbnB1dFpOWjogXCIqXCIgfCBcIlpcIiB8IFwiTlpcIiA9IFwiKlwiLFxuICAgICk6IExpbmVbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVtaXRMaW5lKHtcbiAgICAgICAgICAgIGN1cnJlbnRTdGF0ZTogY3VycmVudCxcbiAgICAgICAgICAgIHByZXZPdXRwdXQ6IGlucHV0Wk5aLFxuICAgICAgICAgICAgbmV4dFN0YXRlOiBuZXh0LFxuICAgICAgICAgICAgYWN0aW9uczogW1wiTk9QXCJdLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0cmFuc3BpbGUoZXhwcjogQVBHTEV4cHIpOiBMaW5lW10ge1xuICAgICAgICBjb25zdCBpbml0aWFsU3RhdGUgPSBcIklOSVRJQUxcIjtcbiAgICAgICAgY29uc3Qgc2Vjb25kU3RhdGUgPSB0aGlzLmdldEZyZXNoTmFtZSgpICsgXCJfSU5JVElBTFwiO1xuICAgICAgICBjb25zdCBpbml0aWFsID0gdGhpcy5lbWl0VHJhbnNpdGlvbihpbml0aWFsU3RhdGUsIHNlY29uZFN0YXRlKTtcblxuICAgICAgICBjb25zdCBlbmRTdGF0ZSA9IHRoaXMucHJlZml4ICsgXCJFTkRcIjtcblxuICAgICAgICBjb25zdCBib2R5ID0gdGhpcy50cmFuc3BpbGVFeHByKFxuICAgICAgICAgICAgbmV3IENvbnRleHQoc2Vjb25kU3RhdGUsIGVuZFN0YXRlLCBcIipcIiksXG4gICAgICAgICAgICBleHByLFxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGVuZCA9IHRoaXMuZW1pdExpbmUoe1xuICAgICAgICAgICAgY3VycmVudFN0YXRlOiBlbmRTdGF0ZSxcbiAgICAgICAgICAgIHByZXZPdXRwdXQ6IFwiKlwiLFxuICAgICAgICAgICAgbmV4dFN0YXRlOiBlbmRTdGF0ZSxcbiAgICAgICAgICAgIGFjdGlvbnM6IFtcIkhBTFRfT1VUXCJdLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gWy4uLmluaXRpYWwsIC4uLmJvZHksIC4uLmVuZF07XG4gICAgfVxuXG4gICAgdHJhbnNwaWxlRXhwcihjdHg6IENvbnRleHQsIGV4cHI6IEFQR0xFeHByKTogTGluZVtdIHtcbiAgICAgICAgaWYgKGV4cHIgaW5zdGFuY2VvZiBBY3Rpb25BUEdMRXhwcikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNwaWxlQWN0aW9uQVBHTEV4cHIoY3R4LCBleHByKTtcbiAgICAgICAgfSBlbHNlIGlmIChleHByIGluc3RhbmNlb2YgU2VxQVBHTEV4cHIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zcGlsZVNlcUFQR0xFeHByKGN0eCwgZXhwcik7XG4gICAgICAgIH0gZWxzZSBpZiAoZXhwciBpbnN0YW5jZW9mIElmQVBHTEV4cHIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zcGlsZUlmQVBHTEV4cHIoY3R4LCBleHByKTtcbiAgICAgICAgfSBlbHNlIGlmIChleHByIGluc3RhbmNlb2YgTG9vcEFQR0xFeHByKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy50cmFuc3BpbGVMb29wQVBHTEV4cHIoY3R4LCBleHByKTtcbiAgICAgICAgfSBlbHNlIGlmIChleHByIGluc3RhbmNlb2YgV2hpbGVBUEdMRXhwcikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNwaWxlV2hpbGVBUEdMRXhwcihjdHgsIGV4cHIpO1xuICAgICAgICB9IGVsc2UgaWYgKGV4cHIgaW5zdGFuY2VvZiBCcmVha0FQR0xFeHByKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy50cmFuc3BpbGVCcmVha0FQR0xFeHByKGN0eCwgZXhwcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcInVua25vd24gZXhwclwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRyYW5zcGlsZUFjdGlvbkFQR0xFeHByKFxuICAgICAgICBjdHg6IENvbnRleHQsXG4gICAgICAgIGFjdGlvbkV4cHI6IEFjdGlvbkFQR0xFeHByLFxuICAgICk6IExpbmVbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVtaXRMaW5lKHtcbiAgICAgICAgICAgIGN1cnJlbnRTdGF0ZTogY3R4LmlucHV0LFxuICAgICAgICAgICAgcHJldk91dHB1dDogY3R4LmlucHV0Wk5aLFxuICAgICAgICAgICAgbmV4dFN0YXRlOiBjdHgub3V0cHV0LFxuICAgICAgICAgICAgYWN0aW9uczogYWN0aW9uRXhwci5hY3Rpb25zLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0cmFuc3BpbGVTZXFBUEdMRXhwcihjdHg6IENvbnRleHQsIHNlcUV4cHI6IFNlcUFQR0xFeHByKTogTGluZVtdIHtcbiAgICAgICAgLy8gbGVuZ3RoID09PSAwXG4gICAgICAgIGlmIChpc0VtcHR5RXhwcihzZXFFeHByKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW1pdFRyYW5zaXRpb24oY3R4LmlucHV0LCBjdHgub3V0cHV0LCBjdHguaW5wdXRaTlopO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlcUV4cHIuZXhwcnMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICBjb25zdCBleHByID0gc2VxRXhwci5leHByc1swXTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zcGlsZUV4cHIoXG4gICAgICAgICAgICAgICAgY3R4LFxuICAgICAgICAgICAgICAgIGV4cHIsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHNlcTogTGluZVtdID0gW107XG4gICAgICAgIGxldCBzdGF0ZSA9IGN0eC5pbnB1dDtcbiAgICAgICAgZm9yIChjb25zdCBbaSwgZXhwcl0gb2Ygc2VxRXhwci5leHBycy5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb3V0cHV0U3RhdGUgPSB0aGlzLmdldEZyZXNoTmFtZSgpO1xuICAgICAgICAgICAgICAgIHNlcSA9IHNlcS5jb25jYXQodGhpcy50cmFuc3BpbGVFeHByKFxuICAgICAgICAgICAgICAgICAgICBuZXcgQ29udGV4dChzdGF0ZSwgb3V0cHV0U3RhdGUsIGN0eC5pbnB1dFpOWiksXG4gICAgICAgICAgICAgICAgICAgIGV4cHIsXG4gICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICAgICAgc3RhdGUgPSBvdXRwdXRTdGF0ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaSA9PT0gc2VxRXhwci5leHBycy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgLy8g5pyA5b6M44Gvb3V0cHV0XG4gICAgICAgICAgICAgICAgc2VxID0gc2VxLmNvbmNhdCh0aGlzLnRyYW5zcGlsZUV4cHIoXG4gICAgICAgICAgICAgICAgICAgIG5ldyBDb250ZXh0KHN0YXRlLCBjdHgub3V0cHV0LCBcIipcIiksXG4gICAgICAgICAgICAgICAgICAgIGV4cHIsXG4gICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IG91dHB1dFN0YXRlID0gdGhpcy5nZXRGcmVzaE5hbWUoKTtcbiAgICAgICAgICAgICAgICBzZXEgPSBzZXEuY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zcGlsZUV4cHIoXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgQ29udGV4dChzdGF0ZSwgb3V0cHV0U3RhdGUsIFwiKlwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cHIsXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IG91dHB1dFN0YXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNlcTtcbiAgICB9XG5cbiAgICB0cmFuc3BpbGVJZkFQR0xFeHByKGN0eDogQ29udGV4dCwgaWZFeHByOiBJZkFQR0xFeHByKTogTGluZVtdIHtcbiAgICAgICAgaWYgKGlzRW1wdHlFeHByKGlmRXhwci50aGVuQm9keSkgJiYgaXNFbXB0eUV4cHIoaWZFeHByLmVsc2VCb2R5KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNwaWxlRXhwcihjdHgsIGlmRXhwci5jb25kKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbmRFbmRTdGF0ZSA9IHRoaXMuZ2V0RnJlc2hOYW1lKCk7XG4gICAgICAgIGNvbnN0IGNvbmQgPSB0aGlzLnRyYW5zcGlsZUV4cHIoXG4gICAgICAgICAgICBuZXcgQ29udGV4dChjdHguaW5wdXQsIGNvbmRFbmRTdGF0ZSwgY3R4LmlucHV0Wk5aKSxcbiAgICAgICAgICAgIGlmRXhwci5jb25kLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBbeiwgLi4udGhlbl0gPSB0aGlzLnRyYW5zcGlsZUV4cHIoXG4gICAgICAgICAgICBuZXcgQ29udGV4dChjb25kRW5kU3RhdGUsIGN0eC5vdXRwdXQsIFwiWlwiKSxcbiAgICAgICAgICAgIGlmRXhwci50aGVuQm9keSxcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgW256LCAuLi5lbF0gPSB0aGlzLnRyYW5zcGlsZUV4cHIoXG4gICAgICAgICAgICBuZXcgQ29udGV4dChjb25kRW5kU3RhdGUsIGN0eC5vdXRwdXQsIFwiTlpcIiksXG4gICAgICAgICAgICBpZkV4cHIuZWxzZUJvZHksXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gWuOBqE5a44KS6Zqj44Gr44GZ44KLXG4gICAgICAgIHJldHVybiBbLi4uY29uZCwgeiwgbnosIC4uLnRoZW4sIC4uLmVsXTtcbiAgICB9XG5cbiAgICB0cmFuc3BpbGVMb29wQVBHTEV4cHIoY3R4OiBDb250ZXh0LCBsb29wRXhwcjogTG9vcEFQR0xFeHByKTogTGluZVtdIHtcbiAgICAgICAgY29uc3QgbG9vcFN0YXRlID0gY3R4LmlucHV0Wk5aID09PSBcIipcIlxuICAgICAgICAgICAgPyBjdHguaW5wdXRcbiAgICAgICAgICAgIDogdGhpcy5nZXRGcmVzaE5hbWUoKTtcbiAgICAgICAgbGV0IHRyYW5zOiBMaW5lW10gPSBbXTtcblxuICAgICAgICBpZiAoY3R4LmlucHV0Wk5aICE9PSBcIipcIikge1xuICAgICAgICAgICAgdHJhbnMgPSB0cmFucy5jb25jYXQoXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0VHJhbnNpdGlvbihjdHguaW5wdXQsIGxvb3BTdGF0ZSwgY3R4LmlucHV0Wk5aKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvb3BGaW5hbFN0YXRlcy5wdXNoKGN0eC5vdXRwdXQpO1xuXG4gICAgICAgIGNvbnN0IGJvZHkgPSB0aGlzLnRyYW5zcGlsZUV4cHIoXG4gICAgICAgICAgICBuZXcgQ29udGV4dChsb29wU3RhdGUsIGxvb3BTdGF0ZSwgXCIqXCIpLFxuICAgICAgICAgICAgbG9vcEV4cHIuYm9keSxcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLmxvb3BGaW5hbFN0YXRlcy5wb3AoKTtcblxuICAgICAgICByZXR1cm4gWy4uLnRyYW5zLCAuLi5ib2R5XTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDkuK3ouqvjgYznqbrjga53aGlsZeOBq+OBpOOBhOOBpuacgOmBqeWMllxuICAgICAqL1xuICAgIHRyYW5zcGlsZVdoaWxlQVBHTEV4cHJCb2R5RW1wdHkoXG4gICAgICAgIGN0eDogQ29udGV4dCxcbiAgICAgICAgY29uZDogQVBHTEV4cHIsXG4gICAgICAgIG1vZGlmaWVyOiBcIlpcIiB8IFwiTlpcIixcbiAgICApOiBMaW5lW10ge1xuICAgICAgICBjb25zdCBjb25kU3RhcnRTdGF0ZSA9IGN0eC5pbnB1dFpOWiA9PT0gXCIqXCJcbiAgICAgICAgICAgID8gY3R4LmlucHV0XG4gICAgICAgICAgICA6IHRoaXMuZ2V0RnJlc2hOYW1lKCk7XG4gICAgICAgIGxldCB0cmFuczogTGluZVtdID0gW107XG4gICAgICAgIGlmIChjdHguaW5wdXRaTlogIT09IFwiKlwiKSB7XG4gICAgICAgICAgICB0cmFucyA9IHRyYW5zLmNvbmNhdChcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXRUcmFuc2l0aW9uKGN0eC5pbnB1dCwgY29uZFN0YXJ0U3RhdGUsIGN0eC5pbnB1dFpOWiksXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY29uZEVuZFN0YXRlID0gdGhpcy5nZXRGcmVzaE5hbWUoKTtcbiAgICAgICAgY29uc3QgY29uZFJlcyA9IHRoaXMudHJhbnNwaWxlRXhwcihcbiAgICAgICAgICAgIG5ldyBDb250ZXh0KGNvbmRTdGFydFN0YXRlLCBjb25kRW5kU3RhdGUsIFwiKlwiKSxcbiAgICAgICAgICAgIGNvbmQsXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgelJlcyA9IHRoaXMuZW1pdExpbmUoe1xuICAgICAgICAgICAgY3VycmVudFN0YXRlOiBjb25kRW5kU3RhdGUsXG4gICAgICAgICAgICBwcmV2T3V0cHV0OiBcIlpcIixcbiAgICAgICAgICAgIG5leHRTdGF0ZTogbW9kaWZpZXIgPT09IFwiWlwiID8gY29uZFN0YXJ0U3RhdGUgOiBjdHgub3V0cHV0LFxuICAgICAgICAgICAgYWN0aW9uczogW1wiTk9QXCJdLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBuelJlcyA9IHRoaXMuZW1pdExpbmUoe1xuICAgICAgICAgICAgY3VycmVudFN0YXRlOiBjb25kRW5kU3RhdGUsXG4gICAgICAgICAgICBwcmV2T3V0cHV0OiBcIk5aXCIsXG4gICAgICAgICAgICBuZXh0U3RhdGU6IG1vZGlmaWVyID09PSBcIlpcIiA/IGN0eC5vdXRwdXQgOiBjb25kU3RhcnRTdGF0ZSxcbiAgICAgICAgICAgIGFjdGlvbnM6IFtcIk5PUFwiXSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIFsuLi50cmFucywgLi4uY29uZFJlcywgLi4uelJlcywgLi4ubnpSZXNdO1xuICAgIH1cblxuICAgIHRyYW5zcGlsZVdoaWxlQVBHTEV4cHIoY3R4OiBDb250ZXh0LCB3aGlsZUV4cHI6IFdoaWxlQVBHTEV4cHIpOiBMaW5lW10ge1xuICAgICAgICBpZiAoaXNFbXB0eUV4cHIod2hpbGVFeHByLmJvZHkpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy50cmFuc3BpbGVXaGlsZUFQR0xFeHByQm9keUVtcHR5KFxuICAgICAgICAgICAgICAgIGN0eCxcbiAgICAgICAgICAgICAgICB3aGlsZUV4cHIuY29uZCxcbiAgICAgICAgICAgICAgICB3aGlsZUV4cHIubW9kaWZpZXIsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGNvbmQ6IExpbmVbXSA9IFtdO1xuICAgICAgICBjb25zdCBjb25kU3RhcnRTdGF0ZSA9IGN0eC5pbnB1dFpOWiA9PT0gXCIqXCJcbiAgICAgICAgICAgID8gY3R4LmlucHV0XG4gICAgICAgICAgICA6IHRoaXMuZ2V0RnJlc2hOYW1lKCk7XG4gICAgICAgIGlmIChjdHguaW5wdXRaTlogIT09IFwiKlwiKSB7XG4gICAgICAgICAgICBjb25kID0gY29uZC5jb25jYXQoXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0VHJhbnNpdGlvbihjdHguaW5wdXQsIGNvbmRTdGFydFN0YXRlLCBjdHguaW5wdXRaTlopLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbmRFbmRTdGF0ZSA9IHRoaXMuZ2V0RnJlc2hOYW1lKCk7XG4gICAgICAgIGNvbmQgPSBjb25kLmNvbmNhdCh0aGlzLnRyYW5zcGlsZUV4cHIoXG4gICAgICAgICAgICBuZXcgQ29udGV4dChjb25kU3RhcnRTdGF0ZSwgY29uZEVuZFN0YXRlLCBcIipcIiksXG4gICAgICAgICAgICB3aGlsZUV4cHIuY29uZCxcbiAgICAgICAgKSk7XG5cbiAgICAgICAgY29uc3QgYm9keVN0YXJ0U3RhdGUgPSB0aGlzLmdldEZyZXNoTmFtZSgpICsgXCJfV0hJTEVfQk9EWVwiO1xuXG4gICAgICAgIGNvbnN0IHpSZXMgPSB0aGlzLmVtaXRMaW5lKHtcbiAgICAgICAgICAgIGN1cnJlbnRTdGF0ZTogY29uZEVuZFN0YXRlLFxuICAgICAgICAgICAgcHJldk91dHB1dDogXCJaXCIsXG4gICAgICAgICAgICBuZXh0U3RhdGU6IHdoaWxlRXhwci5tb2RpZmllciA9PT0gXCJaXCIgPyBib2R5U3RhcnRTdGF0ZSA6IGN0eC5vdXRwdXQsXG4gICAgICAgICAgICBhY3Rpb25zOiBbXCJOT1BcIl0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IG56UmVzID0gdGhpcy5lbWl0TGluZSh7XG4gICAgICAgICAgICBjdXJyZW50U3RhdGU6IGNvbmRFbmRTdGF0ZSxcbiAgICAgICAgICAgIHByZXZPdXRwdXQ6IFwiTlpcIixcbiAgICAgICAgICAgIG5leHRTdGF0ZTogd2hpbGVFeHByLm1vZGlmaWVyID09PSBcIlpcIiA/IGN0eC5vdXRwdXQgOiBib2R5U3RhcnRTdGF0ZSxcbiAgICAgICAgICAgIGFjdGlvbnM6IFtcIk5PUFwiXSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5sb29wRmluYWxTdGF0ZXMucHVzaChjdHgub3V0cHV0KTtcblxuICAgICAgICBjb25zdCBib2R5ID0gdGhpcy50cmFuc3BpbGVFeHByKFxuICAgICAgICAgICAgbmV3IENvbnRleHQoYm9keVN0YXJ0U3RhdGUsIGNvbmRTdGFydFN0YXRlLCBcIipcIiksXG4gICAgICAgICAgICB3aGlsZUV4cHIuYm9keSxcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLmxvb3BGaW5hbFN0YXRlcy5wb3AoKTtcblxuICAgICAgICAvLyB6UmVz44GobnpSZXPjga8x6KGMXG4gICAgICAgIHJldHVybiBbLi4uY29uZCwgLi4uelJlcywgLi4ubnpSZXMsIC4uLmJvZHldO1xuICAgIH1cblxuICAgIHRyYW5zcGlsZUJyZWFrQVBHTEV4cHIoY3R4OiBDb250ZXh0LCBicmVha0V4cHI6IEJyZWFrQVBHTEV4cHIpOiBMaW5lW10ge1xuICAgICAgICBjb25zdCBsZXZlbCA9IGJyZWFrRXhwci5sZXZlbCA/PyAxO1xuXG4gICAgICAgIGlmIChsZXZlbCA8IDEpIHtcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwiYnJlYWsgbGV2ZWwgaXMgbGVzcyB0aGFuIDFcIik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmaW5hbFN0YXRlID1cbiAgICAgICAgICAgIHRoaXMubG9vcEZpbmFsU3RhdGVzW3RoaXMubG9vcEZpbmFsU3RhdGVzLmxlbmd0aCAtIGxldmVsXTtcblxuICAgICAgICBpZiAoZmluYWxTdGF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAobGV2ZWwgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcihcImJyZWFrIG91dHNpZGUgd2hpbGUgb3IgbG9vcFwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIFwiYnJlYWsgbGV2ZWwgaXMgZ3JlYXRlciB0aGFuIG51bWJlciBvZiBuZXN0cyBvZiB3aGlsZSBvciBsb29wXCIsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmVtaXRUcmFuc2l0aW9uKGN0eC5pbnB1dCwgZmluYWxTdGF0ZSwgY3R4LmlucHV0Wk5aKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc3BpbGVBUEdMKFxuICAgIGV4cHI6IEFQR0xFeHByLFxuICAgIG9wdGlvbnM6IFRyYW5zcGlsZXJPcHRpb25zID0ge30sXG4pOiBMaW5lW10ge1xuICAgIHJldHVybiBuZXcgVHJhbnNwaWxlcihvcHRpb25zKS50cmFuc3BpbGUoZXhwcik7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gZHVwczxUPihhczogVFtdKTogVFtdIHtcbiAgICBjb25zdCBzZXQ6IFNldDxUPiA9IG5ldyBTZXQoKTtcbiAgICBjb25zdCBkczogVFtdID0gW107XG4gICAgZm9yIChjb25zdCBhIG9mIGFzKSB7XG4gICAgICAgIGlmIChzZXQuaGFzKGEpKSB7XG4gICAgICAgICAgICBkcy5wdXNoKGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0LmFkZChhKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZHM7XG59XG4iLCJpbXBvcnQge1xuICAgIEFQR01FeHByLFxuICAgIEVycm9yV2l0aExvY2F0aW9uLFxuICAgIGZvcm1hdExvY2F0aW9uQXQsXG4gICAgRnVuY0FQR01FeHByLFxuICAgIE1hY3JvLFxuICAgIE1haW4sXG4gICAgVmFyQVBHTUV4cHIsXG59IGZyb20gXCIuLi9hc3QvbW9kLnRzXCI7XG5pbXBvcnQgeyBkdXBzIH0gZnJvbSBcIi4vX2R1cHMudHNcIjtcblxuZnVuY3Rpb24gYXJndW1lbnRzTWVzc2FnZShudW06IG51bWJlcik6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke251bX0gYXJndW1lbnQke251bSA9PT0gMSA/IFwiXCIgOiBcInNcIn1gO1xufVxuXG4vKipcbiAqIG1hY3Jv44GuYm9keeOBq+ePvuOCjOOCi+WkieaVsOOCkuWRvOOBs+WHuuOBl+OBn+W8leaVsOOBp+e9ruOBjeaPm+OBiFxuICovXG5mdW5jdGlvbiByZXBsYWNlVmFySW5Cb2J5KG1hY3JvOiBNYWNybywgZnVuY0V4cHI6IEZ1bmNBUEdNRXhwcik6IEFQR01FeHByIHtcbiAgICBjb25zdCBleHBycyA9IGZ1bmNFeHByLmFyZ3M7XG4gICAgaWYgKGV4cHJzLmxlbmd0aCAhPT0gbWFjcm8uYXJncy5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yV2l0aExvY2F0aW9uKFxuICAgICAgICAgICAgYGFyZ3VtZW50IGxlbmd0aCBtaXNtYXRjaDogXCIke21hY3JvLm5hbWV9XCJgICtcbiAgICAgICAgICAgICAgICBgIGV4cGVjdCAke2FyZ3VtZW50c01lc3NhZ2UobWFjcm8uYXJncy5sZW5ndGgpfSBidXQgZ2l2ZW4gJHtcbiAgICAgICAgICAgICAgICAgICAgYXJndW1lbnRzTWVzc2FnZShleHBycy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgfSR7Zm9ybWF0TG9jYXRpb25BdChmdW5jRXhwci5sb2NhdGlvbil9YCxcbiAgICAgICAgICAgIGZ1bmNFeHByLmxvY2F0aW9uLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IG5hbWVUb0V4cHI6IE1hcDxzdHJpbmcsIEFQR01FeHByPiA9IG5ldyBNYXAoXG4gICAgICAgIG1hY3JvLmFyZ3MubWFwKChhLCBpKSA9PiBbYS5uYW1lLCBleHByc1tpXV0pLFxuICAgICk7XG5cbiAgICByZXR1cm4gbWFjcm8uYm9keS50cmFuc2Zvcm0oKHgpID0+IHtcbiAgICAgICAgaWYgKHggaW5zdGFuY2VvZiBWYXJBUEdNRXhwcikge1xuICAgICAgICAgICAgY29uc3QgZXhwciA9IG5hbWVUb0V4cHIuZ2V0KHgubmFtZSk7XG4gICAgICAgICAgICBpZiAoZXhwciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yV2l0aExvY2F0aW9uKFxuICAgICAgICAgICAgICAgICAgICBgc2NvcGUgZXJyb3I6IFwiJHt4Lm5hbWV9XCIke2Zvcm1hdExvY2F0aW9uQXQoeC5sb2NhdGlvbil9YCxcbiAgICAgICAgICAgICAgICAgICAgeC5sb2NhdGlvbixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGV4cHI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4geDtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5leHBvcnQgY2xhc3MgTWFjcm9FeHBhbmRlciB7XG4gICAgcHJpdmF0ZSByZWFkb25seSBtYWNyb01hcDogTWFwPHN0cmluZywgTWFjcm8+O1xuICAgIHByaXZhdGUgY291bnQgPSAwO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgbWF4Q291bnQ6IG51bWJlciA9IDEwMDAwMDtcbiAgICBwdWJsaWMgcmVhZG9ubHkgbWFpbjogTWFpbjtcbiAgICBjb25zdHJ1Y3RvcihtYWluOiBNYWluKSB7XG4gICAgICAgIHRoaXMubWFpbiA9IG1haW47XG4gICAgICAgIHRoaXMubWFjcm9NYXAgPSBuZXcgTWFwKG1haW4ubWFjcm9zLm1hcCgobSkgPT4gW20ubmFtZSwgbV0pKTtcbiAgICAgICAgaWYgKHRoaXMubWFjcm9NYXAuc2l6ZSA8IG1haW4ubWFjcm9zLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgZHMgPSBkdXBzKG1haW4ubWFjcm9zLm1hcCgoeCkgPT4geC5uYW1lKSk7XG4gICAgICAgICAgICBjb25zdCBkID0gZHNbMF07XG4gICAgICAgICAgICBjb25zdCBsb2NhdGlvbiA9IG1haW4ubWFjcm9zLnNsaWNlKCkucmV2ZXJzZSgpLmZpbmQoKHgpID0+XG4gICAgICAgICAgICAgICAgeC5uYW1lID09PSBkXG4gICAgICAgICAgICApPy5sb2NhdGlvbjtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcldpdGhMb2NhdGlvbihcbiAgICAgICAgICAgICAgICBgVGhlcmUgaXMgYSBtYWNybyB3aXRoIHRoZSBzYW1lIG5hbWU6IFwiJHtkfVwiYCArXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdExvY2F0aW9uQXQobG9jYXRpb24pLFxuICAgICAgICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cGFuZCgpOiBBUEdNRXhwciB7XG4gICAgICAgIHJldHVybiB0aGlzLmV4cGFuZEV4cHIodGhpcy5tYWluLnNlcUV4cHIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZXhwYW5kRXhwcihleHByOiBBUEdNRXhwcik6IEFQR01FeHByIHtcbiAgICAgICAgaWYgKHRoaXMubWF4Q291bnQgPCB0aGlzLmNvdW50KSB7XG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcInRvbyBtYW55IG1hY3JvIGV4cGFuc2lvblwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvdW50Kys7XG4gICAgICAgIHJldHVybiBleHByLnRyYW5zZm9ybSgoeCkgPT4gdGhpcy5leHBhbmRPbmNlKHgpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGV4cGFuZE9uY2UoeDogQVBHTUV4cHIpOiBBUEdNRXhwciB7XG4gICAgICAgIGlmICh4IGluc3RhbmNlb2YgRnVuY0FQR01FeHByKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5leHBhbmRGdW5jQVBHTUV4cHIoeCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4geDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZXhwYW5kRnVuY0FQR01FeHByKGZ1bmNFeHByOiBGdW5jQVBHTUV4cHIpOiBBUEdNRXhwciB7XG4gICAgICAgIGNvbnN0IG1hY3JvID0gdGhpcy5tYWNyb01hcC5nZXQoZnVuY0V4cHIubmFtZSk7XG4gICAgICAgIGlmIChtYWNybyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zdCBleHBhbmRlZCA9IHJlcGxhY2VWYXJJbkJvYnkobWFjcm8sIGZ1bmNFeHByKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmV4cGFuZEV4cHIoZXhwYW5kZWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmNFeHByO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhwYW5kKG1haW46IE1haW4pOiBBUEdNRXhwciB7XG4gICAgcmV0dXJuIG5ldyBNYWNyb0V4cGFuZGVyKG1haW4pLmV4cGFuZCgpO1xufVxuIiwiaW1wb3J0IHsgQWN0aW9uQVBHTEV4cHIsIEFQR0xFeHByLCBTZXFBUEdMRXhwciB9IGZyb20gXCIuLi9hc3QvbW9kLnRzXCI7XG5pbXBvcnQgeyBBY3Rpb24sIEhhbHRPdXRBY3Rpb24sIE5vcEFjdGlvbiwgcGFyc2VBY3Rpb24gfSBmcm9tIFwiLi4vLi4vZGVwcy50c1wiO1xuXG4vKipcbiAqIOacgOmBqeWMllxuICovXG5leHBvcnQgZnVuY3Rpb24gb3B0aW1pemUoZXhwcjogQVBHTEV4cHIpOiBBUEdMRXhwciB7XG4gICAgcmV0dXJuIGV4cHIudHJhbnNmb3JtKG9wdGltaXplT25jZSk7XG59XG5cbmZ1bmN0aW9uIG9wdGltaXplT25jZShleHByOiBBUEdMRXhwcik6IEFQR0xFeHByIHtcbiAgICBpZiAoZXhwciBpbnN0YW5jZW9mIFNlcUFQR0xFeHByKSB7XG4gICAgICAgIHJldHVybiBvcHRpbWl6ZVNlcUFQR0xFeHByKGV4cHIpO1xuICAgIH1cbiAgICByZXR1cm4gZXhwcjtcbn1cblxuZnVuY3Rpb24gbWVyZ2UoXG4gICAgYXM6IHJlYWRvbmx5IEFjdGlvbltdLFxuICAgIGJzOiByZWFkb25seSBBY3Rpb25bXSxcbik6IEFjdGlvbltdIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAoYXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBicy5zbGljZSgpO1xuICAgIH1cblxuICAgIGlmIChicy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGFzLnNsaWNlKCk7XG4gICAgfVxuXG4gICAgaWYgKGFzLnNvbWUoKHgpID0+IHggaW5zdGFuY2VvZiBIYWx0T3V0QWN0aW9uKSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGlmIChicy5zb21lKCh4KSA9PiB4IGluc3RhbmNlb2YgSGFsdE91dEFjdGlvbikpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjb25zdCBhc1dpdGhvdXROT1AgPSBhcy5maWx0ZXIoKHgpID0+ICEoeCBpbnN0YW5jZW9mIE5vcEFjdGlvbikpO1xuICAgIGNvbnN0IGJzV2l0aG91dE5PUCA9IGJzLmZpbHRlcigoeCkgPT4gISh4IGluc3RhbmNlb2YgTm9wQWN0aW9uKSk7XG5cbiAgICBjb25zdCBhc1dpdGhvdXROT1BOb25SZXR1cm4gPSBhc1dpdGhvdXROT1AuZXZlcnkoKGEpID0+XG4gICAgICAgICFhLmRvZXNSZXR1cm5WYWx1ZSgpXG4gICAgKTtcblxuICAgIGNvbnN0IGJzV2l0aG91dE5PUE5vblJldHVybiA9IGJzV2l0aG91dE5PUC5ldmVyeSgoYikgPT5cbiAgICAgICAgIWIuZG9lc1JldHVyblZhbHVlKClcbiAgICApO1xuXG4gICAgaWYgKCFhc1dpdGhvdXROT1BOb25SZXR1cm4gJiYgIWJzV2l0aG91dE5PUE5vblJldHVybikge1xuICAgICAgICAvLyDkuKHmlrnjgajjgoLlgKTjgpLov5TjgZfjgabjgYTjgozjgbDjg57jg7zjgrjkuI3lj69cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjb25zdCBkaXN0aW5jdENvbXBvbmVudCA9IGFzV2l0aG91dE5PUC5ldmVyeSgoYSkgPT4ge1xuICAgICAgICByZXR1cm4gYnNXaXRob3V0Tk9QLmV2ZXJ5KChiKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gIWEuaXNTYW1lQ29tcG9uZW50KGIpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGlmICghZGlzdGluY3RDb21wb25lbnQpIHtcbiAgICAgICAgLy8g5ZCM44GY44Kz44Oz44Od44O844ON44Oz44OI44GM44GC44KM44Gw44Oe44O844K45LiN5Y+vXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY29uc3QgbWVyZ2VkID0gYXNXaXRob3V0Tk9QLmNvbmNhdChic1dpdGhvdXROT1ApO1xuICAgIGlmIChhc1dpdGhvdXROT1BOb25SZXR1cm4gJiYgYnNXaXRob3V0Tk9QTm9uUmV0dXJuKSB7XG4gICAgICAgIC8vIOS4oeaWueOBqOOCguWApOOCkui/lOOBleOBquOBkeOCjOOBsE5PUOOCkui/veWKoFxuICAgICAgICBtZXJnZWQucHVzaChuZXcgTm9wQWN0aW9uKCkpO1xuICAgIH1cblxuICAgIHJldHVybiBtZXJnZWQ7XG59XG5cbmZ1bmN0aW9uIHRvQWN0aW9ucyhhY3Rpb25FeHByOiBBY3Rpb25BUEdMRXhwcik6IEFjdGlvbltdIHtcbiAgICByZXR1cm4gYWN0aW9uRXhwci5hY3Rpb25zLmZsYXRNYXAoKHgpID0+IHtcbiAgICAgICAgY29uc3QgYSA9IHBhcnNlQWN0aW9uKHgpO1xuICAgICAgICByZXR1cm4gYSAhPT0gdW5kZWZpbmVkID8gW2FdIDogW107XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIG9wdGltaXplU2VxQVBHTEV4cHIoc2VxRXhwcjogU2VxQVBHTEV4cHIpOiBTZXFBUEdMRXhwciB7XG4gICAgY29uc3QgbmV3RXhwcnM6IEFQR0xFeHByW10gPSBbXTtcblxuICAgIGxldCBpdGVtczogQWN0aW9uW10gPSBbXTtcblxuICAgIGNvbnN0IHB1dEl0ZW1zID0gKCkgPT4ge1xuICAgICAgICBpZiAoaXRlbXMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICBuZXdFeHBycy5wdXNoKG5ldyBBY3Rpb25BUEdMRXhwcihpdGVtcy5tYXAoKHgpID0+IHgucHJldHR5KCkpKSk7XG4gICAgICAgICAgICBpdGVtcyA9IFtdO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGZvciAoY29uc3QgZXhwciBvZiBzZXFFeHByLmV4cHJzKSB7XG4gICAgICAgIGlmIChleHByIGluc3RhbmNlb2YgQWN0aW9uQVBHTEV4cHIpIHtcbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbnM6IEFjdGlvbltdID0gdG9BY3Rpb25zKGV4cHIpO1xuICAgICAgICAgICAgY29uc3QgbWVyZ2VkID0gbWVyZ2UoaXRlbXMsIGFjdGlvbnMpO1xuICAgICAgICAgICAgaWYgKG1lcmdlZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcHV0SXRlbXMoKTtcbiAgICAgICAgICAgICAgICBpdGVtcyA9IGFjdGlvbnM7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGl0ZW1zID0gbWVyZ2VkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHV0SXRlbXMoKTtcbiAgICAgICAgICAgIG5ld0V4cHJzLnB1c2goZXhwcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHV0SXRlbXMoKTtcbiAgICByZXR1cm4gbmV3IFNlcUFQR0xFeHByKG5ld0V4cHJzKTtcbn1cbiIsImltcG9ydCB7IEFQR0xFeHByLCBTZXFBUEdMRXhwciB9IGZyb20gXCIuLi9hc3QvbW9kLnRzXCI7XG5cbi8qKlxuICog5pyA6YGp5YyWXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcHRpbWl6ZVNlcShleHByOiBBUEdMRXhwcik6IEFQR0xFeHByIHtcbiAgICByZXR1cm4gZXhwci50cmFuc2Zvcm0ob3B0aW1pemVPbmNlKTtcbn1cblxuZnVuY3Rpb24gb3B0aW1pemVPbmNlKGV4cHI6IEFQR0xFeHByKTogQVBHTEV4cHIge1xuICAgIGlmIChleHByIGluc3RhbmNlb2YgU2VxQVBHTEV4cHIpIHtcbiAgICAgICAgcmV0dXJuIG9wdGltaXplU2VxQVBHTEV4cHIoZXhwcik7XG4gICAgfVxuICAgIHJldHVybiBleHByO1xufVxuXG5mdW5jdGlvbiBvcHRpbWl6ZVNlcUFQR0xFeHByKHNlcUV4cHI6IFNlcUFQR0xFeHByKTogU2VxQVBHTEV4cHIge1xuICAgIGxldCBuZXdFeHByczogQVBHTEV4cHJbXSA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBleHByIG9mIHNlcUV4cHIuZXhwcnMpIHtcbiAgICAgICAgaWYgKGV4cHIgaW5zdGFuY2VvZiBTZXFBUEdMRXhwcikge1xuICAgICAgICAgICAgbmV3RXhwcnMgPSBuZXdFeHBycy5jb25jYXQoZXhwci5leHBycyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXdFeHBycy5wdXNoKGV4cHIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBTZXFBUEdMRXhwcihuZXdFeHBycyk7XG59XG4iLCJpbXBvcnQgeyBtYWNyb0hlYWQgfSBmcm9tIFwiLi9tb2QudHNcIjtcblxuaW50ZXJmYWNlIE1hY3JvRGVjbCB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGFyZ3M6IHN0cmluZ1tdO1xufVxuXG4vKipcbiAqIOODjeOCueODiOacquWvvuW/nFxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlQ29tbWVudChzcmM6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgbGV0IHJlcyA9IFwiXCI7XG4gICAgbGV0IGlzQ29tbWVudCA9IGZhbHNlO1xuICAgIGxldCBpID0gMDtcbiAgICB3aGlsZSAoaSA8IHNyYy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgYyA9IHNyY1tpXTtcbiAgICAgICAgY29uc3QgYzIgPSBzcmNbaSArIDFdO1xuICAgICAgICBpZiAoYyA9PT0gXCIvXCIgJiYgYzIgPT09IFwiKlwiKSB7XG4gICAgICAgICAgICBpICs9IDI7XG4gICAgICAgICAgICBpc0NvbW1lbnQgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGMgPT09IFwiKlwiICYmIGMyID09PSBcIi9cIikge1xuICAgICAgICAgICAgaXNDb21tZW50ID0gZmFsc2U7XG4gICAgICAgICAgICBpICs9IDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoIWlzQ29tbWVudCkge1xuICAgICAgICAgICAgICAgIHJlcyArPSBjO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcztcbn1cblxuLyoqXG4gKiDjgqjjg4fjgqPjgr/oo5zlroznlKjjg5Hjg7zjgrXjg7xcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBsZXRpb25QYXJzZXIoc3JjOiBzdHJpbmcpOiBNYWNyb0RlY2xbXSB7XG4gICAgY29uc3QgYXJyYXk6IE1hY3JvRGVjbFtdID0gW107XG4gICAgLy8gbm9uLWdyZWVkeVxuICAgIC8vIG1vZC50c+OBqOODnuOCr+ODreWQjeOBruato+imj+ihqOePvuOCkuWQiOOCj+OBm+OCi+OBk+OBqFxuICAgIGNvbnN0IE1BQ1JPX0RFQ0xfUkVHRVhQID1cbiAgICAgICAgLyhtYWNyb1xccysoW2EtekEtWl9dW2EtekEtWl8wLTldKj8hKVxccypcXCguKj9cXCkpL2dzO1xuICAgIGNvbnN0IHBvc3NpYmxlTWFjcm9EZWNscyA9IHJlbW92ZUNvbW1lbnQoc3JjKS5tYXRjaEFsbChNQUNST19ERUNMX1JFR0VYUCk7XG4gICAgZm9yIChcbiAgICAgICAgY29uc3QgbWF0Y2ggb2YgcG9zc2libGVNYWNyb0RlY2xzXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IG1hY3JvSGVhZCgpLnBhcnNlKG1hdGNoWzBdKTtcbiAgICAgICAgaWYgKHJlc3VsdC50eXBlID09PSBcIlBhcnNlT0tcIikge1xuICAgICAgICAgICAgYXJyYXkucHVzaCh7XG4gICAgICAgICAgICAgICAgbmFtZTogcmVzdWx0LnZhbHVlLm5hbWUsXG4gICAgICAgICAgICAgICAgYXJnczogcmVzdWx0LnZhbHVlLmFyZ3MubWFwKCh4KSA9PiB4Lm5hbWUpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYXJyYXk7XG59XG4iLCJpbXBvcnQgeyBwYXJzZU1haW4gfSBmcm9tIFwiLi4vYXBnbS9wYXJzZXIvbW9kLnRzXCI7XG5pbXBvcnQge1xuICAgIGVtcHR5QXJnRnVuY3MsXG4gICAgbnVtQXJnRnVuY3MsXG4gICAgc3RyQXJnRnVuY3MsXG4gICAgdHJhbnNwaWxlQVBHTUV4cHIsXG59IGZyb20gXCIuLi9hcGdtX3RvX2FwZ2wvdHJhbnNwaWxlci50c1wiO1xuXG4vLyBmb3IgZWRpdG9yXG4vLyBkZW5vLWZtdC1pZ25vcmVcbmV4cG9ydCB7IGVtcHR5QXJnRnVuY3MsIG51bUFyZ0Z1bmNzLCBzdHJBcmdGdW5jcyB9XG5cbmV4cG9ydCB7IGNvbXBsZXRpb25QYXJzZXIgfSBmcm9tIFwiLi4vYXBnbS9wYXJzZXIvY29tcGxldGlvbl9wYXJzZXIudHNcIjtcblxuaW1wb3J0IHtcbiAgICB0cmFuc3BpbGVBUEdMLFxuICAgIHR5cGUgVHJhbnNwaWxlck9wdGlvbnMsXG59IGZyb20gXCIuLi9hcGdsX3RvX2FwZ3NlbWJseS9tb2QudHNcIjtcbmltcG9ydCB7IGV4cGFuZCB9IGZyb20gXCIuLi9hcGdtL21hY3JvL2V4cGFuZGVyLnRzXCI7XG5pbXBvcnQgeyBvcHRpbWl6ZSB9IGZyb20gXCIuLi9hcGdsL2FjdGlvbl9vcHRpbWl6ZXIvbW9kLnRzXCI7XG5pbXBvcnQgeyBvcHRpbWl6ZVNlcSB9IGZyb20gXCIuLi9hcGdsL3NlcV9vcHRpbWl6ZXIvbW9kLnRzXCI7XG5cbmZ1bmN0aW9uIGxvZ2dlZDxULCBTPihcbiAgICBmOiAoXzogVCkgPT4gUyxcbiAgICB4OiBULFxuICAgIGxvZ01lc3NhZ2U6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCxcbik6IFMge1xuICAgIGNvbnN0IHkgPSBmKHgpO1xuICAgIGlmIChsb2dNZXNzYWdlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc29sZS5sb2cobG9nTWVzc2FnZSwgSlNPTi5zdHJpbmdpZnkoeSwgbnVsbCwgXCIgIFwiKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnRlZ3JhdGlvbihcbiAgICBzdHI6IHN0cmluZyxcbiAgICBvcHRpb25zOiBUcmFuc3BpbGVyT3B0aW9ucyA9IHt9LFxuICAgIGxvZyA9IGZhbHNlLFxuKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IGFwZ20gPSBsb2dnZWQocGFyc2VNYWluLCBzdHIsIGxvZyA/IFwiYXBnbVwiIDogdW5kZWZpbmVkKTtcbiAgICBjb25zdCBleHBhbmRlZCA9IGxvZ2dlZChleHBhbmQsIGFwZ20sIGxvZyA/IFwiYXBnbSBleHBhbmVkXCIgOiB1bmRlZmluZWQpO1xuICAgIGNvbnN0IGFwZ2wgPSBsb2dnZWQodHJhbnNwaWxlQVBHTUV4cHIsIGV4cGFuZGVkLCBsb2cgPyBcImFwZ2xcIiA6IHVuZGVmaW5lZCk7XG4gICAgY29uc3Qgc2VxT3B0aW1pemVkQVBHTCA9IGxvZ2dlZChcbiAgICAgICAgb3B0aW1pemVTZXEsXG4gICAgICAgIGFwZ2wsXG4gICAgICAgIGxvZyA/IFwib3B0aW1pemVkIGFwZ2wgc2VxXCIgOiB1bmRlZmluZWQsXG4gICAgKTtcbiAgICBjb25zdCBvcHRpbWl6ZWRBUEdMID0gbG9nZ2VkKFxuICAgICAgICBvcHRpbWl6ZSxcbiAgICAgICAgc2VxT3B0aW1pemVkQVBHTCxcbiAgICAgICAgbG9nID8gXCJvcHRpbWl6ZWQgYXBnbCBhY3Rpb25cIiA6IHVuZGVmaW5lZCxcbiAgICApO1xuICAgIGNvbnN0IGFwZ3MgPSB0cmFuc3BpbGVBUEdMKG9wdGltaXplZEFQR0wsIG9wdGlvbnMpO1xuXG4gICAgY29uc3QgY29tbWVudCA9IFtcbiAgICAgICAgXCIjIFN0YXRlICAgIElucHV0ICAgIE5leHQgc3RhdGUgICAgQWN0aW9uc1wiLFxuICAgICAgICBcIiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIsXG4gICAgXTtcbiAgICBjb25zdCBoZWFkID0gYXBnbS5oZWFkZXJzLm1hcCgoeCkgPT4geC50b1N0cmluZygpKTtcbiAgICByZXR1cm4gaGVhZC5jb25jYXQoY29tbWVudCwgYXBncyk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxNQUFNO0lBQ1YsWUFBWSxNQUFNLENBQUU7UUFDbEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7S0FDdEI7SUFDRCxLQUFLLENBQUMsS0FBSyxFQUFFO1FBQ1gsTUFBTSxTQUFTLEdBQUc7WUFBQyxLQUFLLEVBQUUsQ0FBQztZQUFFLElBQUksRUFBRSxDQUFDO1lBQUUsTUFBTSxFQUFFLENBQUM7U0FBQyxBQUFDO1FBQ2pELE1BQU0sT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDO1lBQUMsS0FBSztZQUFFLFFBQVEsRUFBRSxTQUFTO1NBQUMsQ0FBQyxBQUFDO1FBQzFELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxBQUFDO1FBQzlDLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxVQUFVLEVBQUU7WUFDOUIsT0FBTztnQkFDTCxJQUFJLEVBQUUsU0FBUztnQkFDZixLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUs7YUFDcEIsQ0FBQztTQUNIO1FBQ0QsT0FBTztZQUNMLElBQUksRUFBRSxXQUFXO1lBQ2pCLFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUTtZQUN6QixRQUFRLEVBQUUsTUFBTSxDQUFDLFFBQVE7U0FDMUIsQ0FBQztLQUNIO0lBQ0QsUUFBUSxDQUFD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
