// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

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
        return this.and(parserB).map(([a])=>a
        );
    }
    next(parserB) {
        return this.and(parserB).map(([, b])=>b
        );
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
                ]
            );
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
const decimalNaturalParser = mod.match(/[0-9]+/).desc([
    "number"
]).map((x)=>parseInt(x, 10)
);
const hexadecimalNaturalParser = mod.match(/0x[0-9]+/).desc([
    "hexadecimal number", 
]).map((x)=>parseInt(x, 16)
);
const naturalNumberParser = hexadecimalNaturalParser.or(decimalNaturalParser).desc([
    "number"
]);
function prettyError(fail1, source) {
    const lines = source.split(/\n|\r\n/);
    const above = lines[fail1.location.line - 2];
    const errorLine = lines[fail1.location.line - 1];
    const below = lines[fail1.location.line];
    const arrowLine = " ".repeat(Math.max(0, fail1.location.column - 1)) + "^";
    const errorLines = [
        ...above === undefined ? [] : [
            above
        ],
        errorLine,
        arrowLine,
        ...below === undefined ? [] : [
            below
        ], 
    ].map((x)=>"| " + x
    );
    return [
        `parse error at line ${fail1.location.line} column ${fail1.location.column}:`,
        `  expected ${fail1.expected.join(", ")}`,
        ``,
        ...errorLines, 
    ].join("\n");
}
function parsePretty(parser, source) {
    const res = parser.parse(source);
    if (res.type === "ParseOK") {
        return res.value;
    }
    throw Error(prettyError(res, source));
}
class APGMExpr {
    constructor(){}
}
function formatLocationAt(location1) {
    if (location1 !== undefined) {
        return ` at line ${location1.line} column ${location1.column}`;
    } else {
        return "";
    }
}
class FuncAPGMExpr extends APGMExpr {
    name;
    args;
    location;
    transform(f) {
        return f(new FuncAPGMExpr(this.name, this.args.map((x)=>x.transform(f)
        ), this.location));
    }
    constructor(name, args, location2){
        super();
        this.name = name;
        this.args = args;
        this.location = location2;
    }
}
class IfAPGMExpr extends APGMExpr {
    modifier;
    cond;
    thenBody;
    elseBody;
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
}
class LoopAPGMExpr extends APGMExpr {
    body;
    constructor(body){
        super();
        this.body = body;
    }
    transform(f) {
        return f(new LoopAPGMExpr(this.body.transform(f)));
    }
}
class Macro {
    name;
    args;
    body;
    location;
    constructor(name, args, body, location3){
        this.name = name;
        this.args = args;
        this.body = body;
        this.location = location3;
    }
}
class Main {
    macros;
    headers;
    seqExpr;
    constructor(macros, headers1, seqExpr){
        this.macros = macros;
        this.headers = headers1;
        this.seqExpr = seqExpr;
        if (macros.length >= 1) {
            if (!(macros[0] instanceof Macro)) {
                throw TypeError("internal error");
            }
        }
    }
}
class Header {
    name;
    content;
    constructor(name, content){
        this.name = name;
        this.content = content;
    }
    toString() {
        const space = this.content.startsWith(" ") ? "" : " ";
        return `#${this.name}${space}${this.content}`;
    }
}
class NumberAPGMExpr extends APGMExpr {
    value;
    constructor(value){
        super();
        this.value = value;
    }
    transform(f) {
        return f(this);
    }
}
class StringAPGMExpr extends APGMExpr {
    value;
    constructor(value){
        super();
        this.value = value;
    }
    transform(f) {
        return f(this);
    }
}
class SeqAPGMExpr extends APGMExpr {
    exprs;
    constructor(exprs){
        super();
        this.exprs = exprs;
    }
    transform(f) {
        return f(new SeqAPGMExpr(this.exprs.map((x)=>x.transform(f)
        )));
    }
}
class VarAPGMExpr extends APGMExpr {
    name;
    constructor(name){
        super();
        this.name = name;
    }
    transform(f) {
        return f(this);
    }
}
class WhileAPGMExpr extends APGMExpr {
    modifier;
    cond;
    body;
    constructor(modifier, cond, body){
        super();
        this.modifier = modifier;
        this.cond = cond;
        this.body = body;
    }
    transform(f) {
        return f(new WhileAPGMExpr(this.modifier, this.cond.transform(f), this.body.transform(f)));
    }
}
const comment = mod.match(/\/\*(\*(?!\/)|[^*])*\*\//s).desc([]);
const _ = mod.match(/\s*/).desc([
    "space"
]).sepBy(comment).map(()=>undefined
);
const someSpaces = mod.match(/\s+/).desc([
    "space"
]);
const identifierRexExp = /[a-zA-Z_][a-zA-Z_0-9]*/u;
const identifierOnly = mod.match(identifierRexExp).desc([
    "identifier"
]);
const identifier = _.next(identifierOnly).skip(_);
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
const varAPGMExpr = identifier.map((x)=>new VarAPGMExpr(x)
);
function funcAPGMExpr() {
    return mod.location.chain((location4)=>{
        return mod.choice(macroIdentifier, identifier).chain((ident)=>{
            return mod.lazy(()=>apgmExpr()
            ).sepBy(comma).wrap(leftParen, rightParen).map((args)=>{
                return new FuncAPGMExpr(ident, args, location4);
            });
        });
    });
}
const numberAPGMExpr = _.next(naturalNumberParser.map((x)=>new NumberAPGMExpr(x)
)).skip(_);
const stringLit = _.next(mod.text(`"`)).next(mod.match(/[^"]*/)).skip(mod.text(`"`)).skip(_).desc([
    "string"
]);
const stringAPGMExpr = stringLit.map((x)=>new StringAPGMExpr(x)
);
function seqAPGMExprRaw() {
    return mod.lazy(()=>statement()
    ).repeat();
}
function seqAPGMExpr() {
    return seqAPGMExprRaw().wrap(token("{"), token("}")).map((x)=>new SeqAPGMExpr(x)
    );
}
const whileKeyword = mod.choice(token("while_z"), token("while_nz")).map((x)=>x === "while_z" ? "Z" : "NZ"
);
const exprWithParen = mod.lazy(()=>apgmExpr()
).wrap(leftParen, rightParen);
function whileAPGMExpr() {
    return whileKeyword.chain((mod1)=>{
        return exprWithParen.chain((cond)=>{
            return mod.lazy(()=>apgmExpr()
            ).map((body)=>new WhileAPGMExpr(mod1, cond, body)
            );
        });
    });
}
function loopAPGMExpr() {
    return token("loop").next(mod.lazy(()=>apgmExpr()
    )).map((x)=>new LoopAPGMExpr(x)
    );
}
const ifKeyword = mod.choice(token("if_z"), token("if_nz")).map((x)=>x === "if_z" ? "Z" : "NZ"
);
function ifAPGMExpr() {
    return ifKeyword.chain((mod2)=>{
        return exprWithParen.chain((cond)=>{
            return mod.lazy(()=>apgmExpr()
            ).chain((body)=>{
                return mod.choice(token("else").next(mod.lazy(()=>apgmExpr()
                )), mod.ok(undefined)).map((elseBody)=>{
                    return new IfAPGMExpr(mod2, cond, body, elseBody);
                });
            });
        });
    });
}
function macro() {
    return _.chain((_)=>{
        return mod.location.chain((location5)=>{
            return mod.text("macro").skip(someSpaces).next(macroIdentifier).chain((ident)=>{
                return leftParen.next(varAPGMExpr.sepBy(comma).skip(rightParen)).chain((args)=>{
                    return mod.lazy(()=>apgmExpr()
                    ).map((body)=>{
                        return new Macro(ident, args, body, location5);
                    });
                });
            });
        });
    });
}
const header = mod.text("#").next(mod.match(/REGISTERS|COMPONENTS/)).desc([
    "#REGISTERS",
    "#COMPONENT"
]).chain((x)=>mod.match(/.*/).map((c)=>new Header(x, c)
    )
);
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
    actions;
    constructor(actions){
        super();
        this.actions = actions;
    }
}
class SeqAPGLExpr extends APGLExpr {
    exprs;
    constructor(exprs){
        super();
        this.exprs = exprs;
    }
}
class IfAPGLExpr extends APGLExpr {
    cond;
    thenBody;
    elseBody;
    constructor(cond, thenBody, elseBody){
        super();
        this.cond = cond;
        this.thenBody = thenBody;
        this.elseBody = elseBody;
    }
}
class LoopAPGLExpr extends APGLExpr {
    body;
    kind = "loop";
    constructor(body){
        super();
        this.body = body;
    }
}
class WhileAPGLExpr extends APGLExpr {
    modifier;
    cond;
    body;
    constructor(modifier, cond, body){
        super();
        this.modifier = modifier;
        this.cond = cond;
        this.body = body;
    }
}
class BreakAPGLExpr extends APGLExpr {
    level;
    kind = "break";
    constructor(level){
        super();
        this.level = level;
        if (level !== undefined && level < 1) {
            throw Error("break level is less than 1");
        }
    }
}
class A {
    static incU(n) {
        return A.nonReturn(`INC U${n}`);
    }
    static incUMulti(...args) {
        return new ActionAPGLExpr([
            ...args.map((x)=>`INC U${x}`
            ),
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
        throw Error(`argument given to "${funcExpr.name}"${formatLocationAt(funcExpr.location)}`);
    }
    return expr;
}
function transpileNumArgFunc(funcExpr, expr) {
    if (funcExpr.args.length !== 1) {
        throw Error(`number of argument is not 1: "${funcExpr.name}"${formatLocationAt(funcExpr.location)}`);
    }
    const arg = funcExpr.args[0];
    if (!(arg instanceof NumberAPGMExpr)) {
        throw Error(`argument is not a number: "${funcExpr.name}"${formatLocationAt(funcExpr.location)}`);
    }
    return expr(arg.value);
}
function transpileStringArgFunc(funcExpr, expr) {
    if (funcExpr.args.length !== 1) {
        throw Error(`number of argument is not 1: "${funcExpr.name}"${formatLocationAt(funcExpr.location)}`);
    }
    const arg = funcExpr.args[0];
    if (!(arg instanceof StringAPGMExpr)) {
        throw Error(`argument is not a number: "${funcExpr.name}"${formatLocationAt(funcExpr.location)}`);
    }
    return expr(arg.value);
}
function transpileFuncAPGMExpr(funcExpr) {
    const e = (a)=>transpileEmptyArgFunc(funcExpr, a)
    ;
    const n = (a)=>transpileNumArgFunc(funcExpr, a)
    ;
    const s = (a)=>transpileStringArgFunc(funcExpr, a)
    ;
    switch(funcExpr.name){
        case "inc_u":
            return n((x)=>A.incU(x)
            );
        case "tdec_u":
            return n((x)=>A.tdecU(x)
            );
        case "inc_b":
            return n((x)=>A.incB(x)
            );
        case "tdec_b":
            return n((x)=>A.tdecB(x)
            );
        case "read_b":
            return n((x)=>A.readB(x)
            );
        case "set_b":
            return n((x)=>A.setB(x)
            );
        case "inc_b2dx":
            return e(A.incB2DX());
        case "inc_b2dy":
            return e(A.incB2DY());
        case "tdec_b2dx":
            return e(A.tdecB2DX());
        case "tdec_b2dy":
            return e(A.tdecB2DY());
        case "read_b2d":
            return e(A.readB2D());
        case "set_b2d":
            return e(A.setB2D());
        case "add_a1":
            return e(A.addA1());
        case "add_b0":
            return e(A.addB0());
        case "add_b1":
            return e(A.addB1());
        case "sub_a1":
            return e(A.subA1());
        case "sub_b0":
            return e(A.subB0());
        case "sub_b1":
            return e(A.subB1());
        case "mul_0":
            return e(A.mul0());
        case "mul_1":
            return e(A.mul1());
        case "nop":
            return e(A.nop());
        case "halt_out":
            return e(A.haltOUT());
        case "output":
            return s((x)=>A.output(x)
            );
        case "break":
            {
                if (funcExpr.args.length === 0) {
                    return e(new BreakAPGLExpr(undefined));
                } else {
                    return n((x)=>new BreakAPGLExpr(x)
                    );
                }
            }
        case "repeat":
            {
                if (funcExpr.args.length !== 2) {
                    throw Error(`"repeat" takes two arguments${formatLocationAt(funcExpr.location)}`);
                }
                const n = funcExpr.args[0];
                if (!(n instanceof NumberAPGMExpr)) {
                    throw Error(`first argument of "repeat" must be a number${formatLocationAt(funcExpr.location)}`);
                }
                const expr = funcExpr.args[1];
                const apgl = transpileAPGMExpr(expr);
                return new SeqAPGLExpr(Array(n.value).fill(0).map(()=>apgl
                ));
            }
    }
    throw Error(`Unknown function: "${funcExpr.name}"${formatLocationAt(funcExpr.location)}`);
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
        throw Error(`number is not allowed: ${e.value}`);
    } else if (e instanceof SeqAPGMExpr) {
        return new SeqAPGLExpr(e.exprs.map((x)=>t(x)
        ));
    } else if (e instanceof StringAPGMExpr) {
        throw Error(`string is not allowed: ${e.value}`);
    } else if (e instanceof VarAPGMExpr) {
        throw Error(`macro variable is not allowed: ${e.name}`);
    } else if (e instanceof WhileAPGMExpr) {
        return new WhileAPGLExpr(e.modifier, t(e.cond), t(e.body));
    }
    throw Error("internal error");
}
function isEmptyExpr(expr) {
    return expr instanceof SeqAPGLExpr && expr.exprs.length === 0;
}
class Transpiler {
    lines = [];
    id = 0;
    loopFinalStates = [];
    prefix = "STATE";
    constructor(){}
    getFreshName() {
        this.id++;
        return `${this.prefix}_${this.id}`;
    }
    emitLine({ currentState , prevOutput , nextState , actions  }) {
        if (actions.length === 0) {
            throw Error("action must be nonempty");
        }
        this.lines.push(`${currentState}; ${prevOutput}; ${nextState}; ${actions.join(", ")}`);
    }
    transition(current, next) {
        this.emitLine({
            currentState: current,
            prevOutput: "*",
            nextState: next,
            actions: [
                "NOP"
            ]
        });
    }
    transpile(expr) {
        const initialState = "INITIAL";
        const secondState = this.getFreshName() + "_INITIAL";
        this.transition(initialState, secondState);
        const endState = this.transpileExpr(secondState, expr);
        this.emitLine({
            currentState: endState,
            prevOutput: "*",
            nextState: endState,
            actions: [
                "HALT_OUT"
            ]
        });
        return this.lines;
    }
    transpileExpr(state, expr) {
        if (expr instanceof ActionAPGLExpr) {
            return this.transpileActionAPGLExpr(state, expr);
        } else if (expr instanceof SeqAPGLExpr) {
            return this.transpileSeqAPGLExpr(state, expr);
        } else if (expr instanceof IfAPGLExpr) {
            return this.transpileIfAPGLExpr(state, expr);
        } else if (expr instanceof LoopAPGLExpr) {
            return this.transpileLoopAPGLExpr(state, expr);
        } else if (expr instanceof WhileAPGLExpr) {
            return this.transpileWhileAPGLExpr(state, expr);
        } else if (expr instanceof BreakAPGLExpr) {
            return this.transpileBreakAPGLExpr(state, expr);
        }
        throw Error("error");
    }
    transpileActionAPGLExpr(state, actionExpr) {
        const nextState = this.getFreshName();
        this.emitLine({
            currentState: state,
            prevOutput: "*",
            nextState: nextState,
            actions: actionExpr.actions
        });
        return nextState;
    }
    transpileSeqAPGLExpr(state, seqExpr) {
        for (const expr of seqExpr.exprs){
            state = this.transpileExpr(state, expr);
        }
        return state;
    }
    transpileIfAPGLExpr(state, ifExpr) {
        if (isEmptyExpr(ifExpr.elseBody)) {
            return this.transpileIfAPGLExprOnlyZ(state, ifExpr.cond, ifExpr.thenBody);
        }
        if (isEmptyExpr(ifExpr.thenBody)) {
            return this.transpileIfAPGLExprOnlyNZ(state, ifExpr.cond, ifExpr.elseBody);
        }
        const condEndState = this.transpileExpr(state, ifExpr.cond);
        const thenStartState = this.getFreshName() + "_IF_Z";
        const elseStartState = this.getFreshName() + "_IF_NZ";
        this.emitLine({
            currentState: condEndState,
            prevOutput: "Z",
            nextState: thenStartState,
            actions: [
                "NOP"
            ]
        });
        this.emitLine({
            currentState: condEndState,
            prevOutput: "NZ",
            nextState: elseStartState,
            actions: [
                "NOP"
            ]
        });
        const thenEndState = this.transpileExpr(thenStartState, ifExpr.thenBody);
        const elseEndState = this.transpileExpr(elseStartState, ifExpr.elseBody);
        this.transition(thenEndState, elseEndState);
        return elseEndState;
    }
    transpileIfAPGLExprOnlyZ(state, cond, body) {
        const condEndState = this.transpileExpr(state, cond);
        const thenStartState = this.getFreshName() + "_IF_Z";
        const endState = this.transpileExpr(thenStartState, body);
        this.emitLine({
            currentState: condEndState,
            prevOutput: "Z",
            nextState: thenStartState,
            actions: [
                "NOP"
            ]
        });
        this.emitLine({
            currentState: condEndState,
            prevOutput: "NZ",
            nextState: endState,
            actions: [
                "NOP"
            ]
        });
        return endState;
    }
    transpileIfAPGLExprOnlyNZ(state, cond, body) {
        const condEndState = this.transpileExpr(state, cond);
        const bodyStartState = this.getFreshName() + "_IF_NZ";
        const endState = this.transpileExpr(bodyStartState, body);
        this.emitLine({
            currentState: condEndState,
            prevOutput: "Z",
            nextState: endState,
            actions: [
                "NOP"
            ]
        });
        this.emitLine({
            currentState: condEndState,
            prevOutput: "NZ",
            nextState: bodyStartState,
            actions: [
                "NOP"
            ]
        });
        return endState;
    }
    transpileLoopAPGLExpr(state, loopExpr) {
        const breakState = this.getFreshName() + "_LOOP_BREAK";
        this.loopFinalStates.push(breakState);
        const nextState = this.transpileExpr(state, loopExpr.body);
        this.loopFinalStates.pop();
        this.emitLine({
            currentState: nextState,
            prevOutput: "*",
            nextState: state,
            actions: [
                "NOP"
            ]
        });
        return breakState;
    }
    transpileWhileAPGLExpr(state, whileExpr) {
        const condEndState = this.transpileExpr(state, whileExpr.cond);
        const bodyStartState = this.getFreshName() + "_WHILE_BODY";
        const finalState = this.getFreshName() + "_WHILE_END";
        this.emitLine({
            currentState: condEndState,
            prevOutput: "Z",
            nextState: whileExpr.modifier === "Z" ? bodyStartState : finalState,
            actions: [
                "NOP"
            ]
        });
        this.emitLine({
            currentState: condEndState,
            prevOutput: "NZ",
            nextState: whileExpr.modifier === "Z" ? finalState : bodyStartState,
            actions: [
                "NOP"
            ]
        });
        this.loopFinalStates.push(finalState);
        const bodyEndState = this.transpileExpr(bodyStartState, whileExpr.body);
        this.loopFinalStates.pop();
        this.emitLine({
            currentState: bodyEndState,
            prevOutput: "*",
            nextState: state,
            actions: [
                "NOP"
            ]
        });
        return finalState;
    }
    transpileBreakAPGLExpr(state, breakExpr) {
        if (breakExpr.level !== undefined && breakExpr.level < 1) {
            throw Error("break level is less than 1");
        }
        if (breakExpr.level === undefined || breakExpr.level === 1) {
            const breakState = this.loopFinalStates[this.loopFinalStates.length - 1];
            if (breakState === undefined) {
                throw Error("break outside while or loop");
            }
            this.transition(state, breakState);
        } else {
            const breakState = this.loopFinalStates[this.loopFinalStates.length - breakExpr.level];
            if (breakState === undefined) {
                throw Error("break level is greater than number of nest of while or loop");
            }
            this.transition(state, breakState);
        }
        return this.getFreshName() + "_BREAK_UNUSED";
    }
}
function transpileAPGL(expr) {
    return new Transpiler().transpile(expr);
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
class MacroExpander {
    macroMap;
    count = 0;
    maxCount = 100000;
    main;
    constructor(main1){
        this.main = main1;
        this.macroMap = new Map(main1.macros.map((m)=>[
                m.name,
                m
            ]
        ));
        if (this.macroMap.size < main1.macros.length) {
            const ds = dups(main1.macros.map((x)=>x.name
            ));
            const d = ds[0];
            const location6 = main1.macros.slice().reverse().find((x)=>x.name === d
            )?.location;
            throw Error('duplicate definition of macro: "' + d + '"' + formatLocationAt(location6));
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
        return expr.transform((x)=>this.expandOnce(x)
        );
    }
    expandOnce(x) {
        if (x instanceof FuncAPGMExpr) {
            return this.expandFuncAPGMExpr(x);
        } else {
            return x;
        }
    }
    expandFuncAPGMExpr(funcExpr) {
        if (this.macroMap.has(funcExpr.name)) {
            const macro1 = this.macroMap.get(funcExpr.name);
            if (macro1 === undefined) throw Error("internal error");
            const expanded = this.replaceVarInBoby(macro1, funcExpr);
            return this.expandExpr(expanded);
        } else {
            return funcExpr;
        }
    }
    error() {
        throw Error("Internal error");
    }
    replaceVarInBoby(macro2, funcExpr) {
        const exprs = funcExpr.args;
        if (exprs.length !== macro2.args.length) {
            throw Error(`argument length mismatch: "${macro2.name}"${formatLocationAt(funcExpr.location)}`);
        }
        const map = new Map(macro2.args.map((a, i)=>[
                a.name,
                exprs[i] ?? this.error()
            ]
        ));
        return macro2.body.transform((x)=>{
            if (x instanceof VarAPGMExpr) {
                const expr = map.get(x.name);
                if (expr === undefined) {
                    throw Error(`scope error: "${x.name}"${formatLocationAt(funcExpr.location)}`);
                }
                return expr;
            } else {
                return x;
            }
        });
    }
}
function expand(main2) {
    return new MacroExpander(main2).expand();
}
function integration(str, log = false) {
    const apgm = parseMain(str);
    if (log) {
        console.log("apgm", JSON.stringify(apgm, null, "  "));
    }
    const expanded = expand(apgm);
    if (log) {
        console.log("apgm expaned", JSON.stringify(expanded, null, "  "));
    }
    const apgl = transpileAPGMExpr(expanded);
    if (log) {
        console.log("apgl", JSON.stringify(apgl, null, "  "));
    }
    const apgs = transpileAPGL(apgl);
    const comment1 = [
        "# State    Input    Next state    Actions",
        "# ---------------------------------------", 
    ];
    const head = apgm.headers.map((x)=>x.toString()
    );
    return head.concat(comment1, apgs);
}
export { integration as integration };
