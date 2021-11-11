import { bnb } from "../deps.ts";

import {
    APGMExpr,
    FuncAPGMExpr,
    Header,
    IfAPGMExpr,
    LoopAPGMExpr,
    Macro,
    Main,
    NumberAPGMExpr,
    SeqAPGMExpr,
    StringAPGMExpr,
    VarAPGMExpr,
    WhileAPGMExpr,
} from "./ast/mod.ts";

// https://stackoverflow.com/questions/16160190/regular-expression-to-find-c-style-block-comments#:~:text=35-,Try%20using,-%5C/%5C*(%5C*(%3F!%5C/)%7C%5B%5E*%5D)*%5C*%5C/
export const comment = bnb.match(/\/\*(\*(?!\/)|[^*])*\*\//s).desc(["comment"]);

/** 空白 */
export const _: bnb.Parser<undefined> = bnb.match(/\s*/).desc(["space"]).sepBy(
    comment,
).map((x) => undefined);

export const someSpaces = bnb.match(/\s+/).desc(["space"]);

/**
 * 識別子の正規表現
 */
const identifierRexExp = /[a-zA-Z_][a-zA-Z_0-9]*/u;
export const identifierOnly: bnb.Parser<string> = bnb.match(identifierRexExp)
    .desc(["identifier"]);

export const identifier: bnb.Parser<string> = _.next(identifierOnly).skip(_);

const macroIdentifierRegExp = /[a-zA-Z_][a-zA-Z_0-9]*!/u;

export const macroIdentifier: bnb.Parser<string> = _.next(
    bnb.match(macroIdentifierRegExp),
).skip(_).desc(["macro name"]);

export function token(s: string): bnb.Parser<string> {
    return _.next(bnb.text(s)).skip(_);
}

export const comma = token(",");
export const leftParen = token("(");
export const rightParen = token(")");

export const varAPGMExpr = identifier.map((x) => new VarAPGMExpr(x));

export function funcAPGMExpr(): bnb.Parser<FuncAPGMExpr> {
    return bnb.choice(macroIdentifier, identifier).chain((ident) => {
        return leftParen.next(
            bnb.lazy(() => apgmExpr()).sepBy(comma).skip(rightParen),
        ).map(
            (args) => {
                return new FuncAPGMExpr(ident, args);
            },
        );
    });
}

export const numberAPGMExpr = bnb.match(/[0-9]+/).desc(["number"]).map((x) =>
    new NumberAPGMExpr(Number(x))
);
export const stringLit = _.next(bnb.text(`"`)).next(bnb.match(/[^"]*/)).skip(
    bnb.text(`"`),
).skip(_).desc(["string"]);
export const stringAPGMExpr = stringLit.map((x) => new StringAPGMExpr(x));

export function seqAPGMExprRaw() {
    return bnb.lazy(() => statement()).repeat();
}

export function seqAPGMExpr() {
    return token("{").next(seqAPGMExprRaw()).skip(token("}")).map((x) =>
        new SeqAPGMExpr(x)
    );
}

export const whileKeyword = bnb.choice(token("while_z"), token("while_nz")).map(
    (x) => x === "while_z" ? "Z" : "NZ",
);

export function whileAPGMExpr() {
    return whileKeyword.chain((mod) => {
        return token("(").next(bnb.lazy(() => apgmExpr())).skip(token(")"))
            .chain((cond) => {
                return bnb.lazy(() => apgmExpr()).map((body) =>
                    new WhileAPGMExpr(mod, cond, body)
                );
            });
    });
}

export function loopAPGMExpr() {
    return token("loop").next(bnb.lazy(() => apgmExpr())).map((x) =>
        new LoopAPGMExpr(x)
    );
}

export const ifKeyword = bnb.choice(token("if_z"), token("if_nz")).map((x) =>
    x === "if_z" ? "Z" : "NZ"
);

export function ifAPGMExpr() {
    return ifKeyword.chain((mod) => {
        return token("(").next(bnb.lazy(() => apgmExpr())).skip(token(")"))
            .chain((cond) => {
                return bnb.lazy(() => apgmExpr()).chain((body) => {
                    return bnb.choice(
                        token("else").next(bnb.lazy(() => apgmExpr())),
                        bnb.ok(undefined),
                    ).map((eleBody) => {
                        return new IfAPGMExpr(mod, cond, body, eleBody);
                    });
                });
            });
    });
}

/**
 * macro f(x) {
 *   x;
 * }
 */
export function macro() {
    return _.next(bnb.text("macro")).skip(someSpaces).next(macroIdentifier)
        .chain((ident) => {
            return leftParen.next(varAPGMExpr.sepBy(comma).skip(rightParen))
                .chain((args) => {
                    return bnb.lazy(() => apgmExpr()).map((body) => {
                        return new Macro(ident, args, body);
                    });
                });
        });
}

/* 改行を含まない */
export const header = bnb.text("#").next(bnb.match(/REGISTERS|COMPONENTS/))
    .desc(["#REGISTERS", "#COMPONENT"]).chain((x) =>
        bnb.match(/.*/).map((c) => new Header(x, c))
    );

export const headers = _.next(header).skip(_).repeat();

export function main() {
    return headers.chain((h) => {
        return macro().repeat().chain((macros) => {
            return _.next(seqAPGMExprRaw()).skip(_).map((x) => {
                return new Main(h, macros, new SeqAPGMExpr(x));
            });
        });
    });
}

export function tryParseMain(str: string): Main {
    return main().tryParse(str);
}

export function apgmExpr(): bnb.Parser<APGMExpr> {
    return bnb.choice(
        loopAPGMExpr(),
        whileAPGMExpr(),
        ifAPGMExpr(),
        funcAPGMExpr(),
        seqAPGMExpr(),
        varAPGMExpr,
        numberAPGMExpr,
        stringAPGMExpr,
    );
}

// seq = { statement* }
// statement = loop | while | if | (expr with semicolon);
// expr = loop | while | if | func | seq | var | num | str

// SeqAPGMExprの要素
// element of SeqAPGMExpr
export function statement(): bnb.Parser<APGMExpr> {
    return bnb.choice(
        loopAPGMExpr(),
        whileAPGMExpr(),
        ifAPGMExpr(),
        apgmExpr().skip(token(";")),
    );
}
