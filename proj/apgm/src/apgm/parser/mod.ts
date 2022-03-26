import { bnb } from "../../deps.ts";

import { naturalNumberParser } from "./number.ts";
import { parsePretty } from "./parsePretty.ts";

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
} from "../ast/mod.ts";

// https://stackoverflow.com/questions/16160190/regular-expression-to-find-c-style-block-comments#:~:text=35-,Try%20using,-%5C/%5C*(%5C*(%3F!%5C/)%7C%5B%5E*%5D)*%5C*%5C/
export const comment = bnb.match(/\/\*(\*(?!\/)|[^*])*\*\//s).desc([] /* 無し */);

/** 空白 */
export const _: bnb.Parser<undefined> = bnb.match(/\s*/).desc(["space"]).sepBy(
    comment,
).map(() => undefined);

export const someSpaces = bnb.match(/\s+/).desc(["space"]);

/**
 * 識別子の正規表現
 */
const identifierRexExp = /[a-zA-Z_][a-zA-Z_0-9]*/u;
export const identifierOnly: bnb.Parser<string> = bnb.match(identifierRexExp)
    .desc(["identifier"]);

export const identifier: bnb.Parser<string> = _.next(identifierOnly).skip(_);
export const identifierWithLocation: bnb.Parser<[string, bnb.SourceLocation]> =
    _.chain(() => {
        return bnb.location.chain((loc) => {
            return identifierOnly.skip(_).map((ident) => {
                return [ident, loc];
            });
        });
    });

const macroIdentifierRegExp = /[a-zA-Z_][a-zA-Z_0-9]*!/u;

export const macroIdentifier: bnb.Parser<string> = _.next(
    bnb.match(macroIdentifierRegExp),
).skip(_).desc(["macro name"]);

export function token(s: string): bnb.Parser<string> {
    return _.next(bnb.text(s)).skip(_);
}

/** `.` */
export const comma = token(",").desc(["`,`"]);
/** `(` */
export const leftParen = token("(").desc(["`(`"]);
/** `)` */
export const rightParen = token(")").desc(["`)`"]);
/** `;` */
export const semicolon = token(";").desc(["`;`"]);

/** `(` */
export const curlyLeft = token("{").desc(["`{`"]);
/** `)` */
export const curlyRight = token("}").desc(["`}`"]);

export const varAPGMExpr: bnb.Parser<VarAPGMExpr> = identifierWithLocation.map((
    x,
) => new VarAPGMExpr(x[0], x[1]));

function argExprs<T>(arg: () => bnb.Parser<T>): bnb.Parser<T[]> {
    return bnb.lazy(() => arg()).sepBy(comma).wrap(
        leftParen,
        rightParen,
    );
}

export function funcAPGMExpr(): bnb.Parser<FuncAPGMExpr> {
    return _.next(bnb.location).chain((location) => {
        return bnb.choice(macroIdentifier, identifier).chain((ident) => {
            return argExprs(() => apgmExpr()).map(
                (args) => {
                    return new FuncAPGMExpr(ident, args, location);
                },
            );
        });
    });
}

export const numberAPGMExpr: bnb.Parser<NumberAPGMExpr> = _.next(
    bnb.location.chain((loc) => {
        return naturalNumberParser.map((x) => new NumberAPGMExpr(x, loc));
    }),
).skip(_);

// TODO location
export const stringLit: bnb.Parser<string> = _.next(bnb.text(`"`)).next(
    bnb.match(/[^"]*/),
).skip(
    bnb.text(`"`),
).skip(_).desc(["string"]);
export const stringAPGMExpr = stringLit.map((x) => new StringAPGMExpr(x));

export function seqAPGMExprRaw(): bnb.Parser<APGMExpr[]> {
    return bnb.lazy(() => statement()).repeat();
}

export function seqAPGMExpr(): bnb.Parser<SeqAPGMExpr> {
    return seqAPGMExprRaw().wrap(curlyLeft, curlyRight).map((x) =>
        new SeqAPGMExpr(x)
    );
}

export const whileKeyword = bnb.choice(token("while_z"), token("while_nz")).map(
    (x) => x === "while_z" ? "Z" : "NZ",
);

const exprWithParen: bnb.Parser<APGMExpr> = bnb.lazy(() => apgmExpr()).wrap(
    leftParen,
    rightParen,
);

export function whileAPGMExpr() {
    return whileKeyword.chain((mod) => {
        return exprWithParen.chain((cond) => {
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
        return exprWithParen.chain((cond) => {
            return bnb.lazy(() => apgmExpr()).chain((body) => {
                return bnb.choice(
                    token("else").next(bnb.lazy(() => apgmExpr())),
                    bnb.ok(undefined),
                ).map((elseBody) => {
                    return new IfAPGMExpr(mod, cond, body, elseBody);
                });
            });
        });
    });
}

// macro f!(a, b)
export function macroHead(): bnb.Parser<
    { loc: bnb.SourceLocation; name: string; args: VarAPGMExpr[] }
> {
    const macroKeyword: bnb.Parser<bnb.SourceLocation> = _.chain((_) => {
        return bnb.location.chain((location) => {
            return bnb.text("macro").next(someSpaces).map((_) => location);
        });
    });

    return macroKeyword.and(macroIdentifier).chain(([location, ident]) => {
        return argExprs(() => varAPGMExpr).map(
            (args) => {
                return {
                    loc: location,
                    name: ident,
                    args: args,
                };
            },
        );
    });
}

/**
 * macro f!(x) {
 *   x;
 * }
 */
export function macro(): bnb.Parser<Macro> {
    return macroHead().chain(({ loc, name, args }) => {
        return bnb.lazy(() => apgmExpr()).map((body) => {
            return new Macro(name, args, body, loc);
        });
    });
}

/* 改行を含まない */
export const header = bnb.text("#").next(bnb.match(/REGISTERS|COMPONENTS/))
    .desc(["#REGISTERS", "#COMPONENTS"]).chain((x) =>
        bnb.match(/.*/).map((c) => new Header(x, c))
    );

export const headers = _.next(header).skip(_).repeat();

export function main(): bnb.Parser<Main> {
    return macro().repeat().chain((macros) => {
        return headers.chain((h) => {
            return _.next(seqAPGMExprRaw()).skip(_).map((x) => {
                return new Main(macros, h, new SeqAPGMExpr(x));
            });
        });
    });
}

export function parseMain(str: string): Main {
    return parsePretty(main(), str);
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
        apgmExpr().skip(semicolon),
    );
}
