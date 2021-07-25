
import {
    APGCProgram,
    APGCExpressionStatement,
    APGCStatements, 
    FunctionCallExpression,
    IfStatement,
    WhileStatement,
    NumberExpression,
    StringExpression,
} from "../types/apgc_types.js";
import {
    apgcProgramParser, 
    functionCallExpressionParser,
    identifierParser,
    numberExpressionParser,
    stringExpressionParser
} from "./apgc_parser.js";

import { assertEquals, test } from "../../test/deps.js";

test('numberExpressionParser', () => {
    assertEquals(numberExpressionParser.parseToValueOrUndefined("123"), new NumberExpression(123));
    assertEquals(numberExpressionParser.parseToValueOrUndefined("abc"), undefined);
});

test('identifierParser', () => {
    assertEquals(identifierParser.parseToValueOrUndefined('a0'), "a0");
    assertEquals(identifierParser.parseToValueOrUndefined('0a'), undefined);
    assertEquals(identifierParser.parseToValueOrUndefined(''), undefined);

    assertEquals(identifierParser.parseToValueOrUndefined('Abc0'), "Abc0");
});

test('identifierParser _', () => {
    assertEquals(identifierParser.parseToValueOrUndefined('a_0'), "a_0");
    assertEquals(identifierParser.parseToValueOrUndefined('a_3_'), "a_3_");
    assertEquals(identifierParser.parseToValueOrUndefined('a_0_2'), "a_0_2");

    assertEquals(identifierParser.parseToValueOrUndefined('_a_0_2'), "_a_0_2");
    assertEquals(identifierParser.parseToValueOrUndefined('_'), "_");
});

test('functionCallStatement output(1)', () => {
    const str = "output(1)";
    assertEquals(functionCallExpressionParser().parseToValueOrUndefined(str), new FunctionCallExpression('output', [new NumberExpression(1)]));
});

test('functionCallStatement output( 1)', () => {
    const str = "output( 1)";
    assertEquals(functionCallExpressionParser().parseToValueOrUndefined(str), new FunctionCallExpression('output', [new NumberExpression(1)]));
});

test('functionCallStatement output(1 )', () => {
    const str = "output(1 )";
    assertEquals(functionCallExpressionParser().parseToValueOrUndefined(str), new FunctionCallExpression('output', [new NumberExpression(1)]));
});

test('functionCallStatement output(1,2)', () => {
    const str = "output(1,2)";
    assertEquals(functionCallExpressionParser().parseToValueOrUndefined(str), new FunctionCallExpression('output', [new NumberExpression(1), new NumberExpression(2)]));
});

test('functionCallStatement output()', () => {
    const str = 'output()';
    assertEquals(functionCallExpressionParser().parseToValueOrUndefined(str), new FunctionCallExpression('output', []));
});

test('functionCallStatement output("1")', () => {
    const str = 'output("1")';
    assertEquals(functionCallExpressionParser().parseToValueOrUndefined(str), new FunctionCallExpression('output', [new StringExpression("1")]));
});

test('functionCallStatement output(1, "a", "bb", 3, 4 , 5 )', () => {
    const str = 'output(1, "a", "bb", 3, 4 , 5 )';
    assertEquals(
        functionCallExpressionParser().parseToValueOrUndefined(str),
        new FunctionCallExpression('output', [
            new NumberExpression(1),
            new StringExpression('a'),
            new StringExpression('bb'),
            new NumberExpression(3),
            new NumberExpression(4),
            new NumberExpression(5)
        ])
    );
});

test('stringExpression', () => {
    assertEquals(stringExpressionParser.parseToValueOrUndefined(`"abc"`), new StringExpression('abc'));

    assertEquals(stringExpressionParser.parseToValueOrUndefined(`""`), new StringExpression(''));
    assertEquals(stringExpressionParser.parseToValueOrUndefined(``), undefined);
    assertEquals(stringExpressionParser.parseToValueOrUndefined(`"`), undefined);
    assertEquals(stringExpressionParser.parseToValueOrUndefined(`abc`), undefined);

    assertEquals(stringExpressionParser.parseToValueOrUndefined(`"\\""`), new StringExpression('"'));
    assertEquals(stringExpressionParser.parseToValueOrUndefined(`"abc\\"def"`), new StringExpression('abc"def'));
});

test('apgcProgramParser', () => {
    const str = `
output(1);
output(2, 3);    
`;
    assertEquals(apgcProgramParser(str), new APGCProgram(
        new APGCStatements(
            [
                new APGCExpressionStatement(
                    new FunctionCallExpression(
                        'output',
                        [new NumberExpression(1)]
                    )
                ),
                new APGCExpressionStatement(
                    new FunctionCallExpression(
                        'output',
                        [
                            new NumberExpression(2),
                            new NumberExpression(3),
                        ]
                    )
                )
            ]
        )
    ));
});

test('apgcProgramParser comment', () => {
    const str = `
// abc // abc
output(1); // abc
// abc`;
    assertEquals(apgcProgramParser(str), new APGCProgram(
        new APGCStatements(
            [
                new APGCExpressionStatement(
                    new FunctionCallExpression(
                        'output',
                        [new NumberExpression(1)]
                    )
                )
            ]
        )
    ));
});

test('apgcProgramParser if_zero', () => {
    const str = `
if_zero(tdec_u(0) ) {
    output(1);
} else {
    output(2);  
}
`;
    assertEquals(apgcProgramParser(str), new APGCProgram(
        new APGCStatements(
            [
                new IfStatement(
                    "zero",
                    new FunctionCallExpression('tdec_u', [new NumberExpression(0)]),
                    new APGCStatements(
                        [
                            new APGCExpressionStatement(
                                new FunctionCallExpression('output', [new NumberExpression(1)])
                            )  
                        ]
                    ),
                    new APGCStatements(
                        [
                            new APGCExpressionStatement(
                                new FunctionCallExpression('output', [new NumberExpression(2)])
                            )
                        ]
                    )
                )
            ]
        )
    ));
});

test('apgcProgramParser if_zero empty else', () => {
    const str = `
if_zero(tdec_u(0)) {
    output(1);
}
`;
    assertEquals(apgcProgramParser(str), new APGCProgram(
        new APGCStatements(
            [
                new IfStatement(
                    "zero",
                    new FunctionCallExpression('tdec_u', [new NumberExpression(0)]),
                    new APGCStatements(
                        [
                            new APGCExpressionStatement(
                                new FunctionCallExpression('output', [new NumberExpression(1)])
                            )  
                        ]
                    ),
                    new APGCStatements(
                        []
                    )
                )
            ]
        )
    ));
});

test('apgcProgramParser while_non_zero', () => {
    const str = `
while_non_zero(tdec_u(0)) {
    output(1);
}
`;
    assertEquals(apgcProgramParser(str), new APGCProgram(
        new APGCStatements(
            [
                new WhileStatement(
                    "non_zero",
                    new FunctionCallExpression('tdec_u', [new NumberExpression(0)]),
                    new APGCStatements(
                        [
                            new APGCExpressionStatement(
                                new FunctionCallExpression('output', [new NumberExpression(1)])
                            )  
                        ]
                    )
                )
            ]
        )
    ));
});

test('apgcProgramParser while_zero', () => {
    const str = `
while_zero(tdec_u(0)) {
    output(1);
}
`;
    assertEquals(apgcProgramParser(str), new APGCProgram(
        new APGCStatements(
            [
                new WhileStatement(
                    "zero",
                    new FunctionCallExpression('tdec_u', [new NumberExpression(0)]),
                    new APGCStatements(
                        [
                            new APGCExpressionStatement(
                                new FunctionCallExpression('output', [new NumberExpression(1)])
                            )  
                        ]
                    )
                )
            ]
        )
    ));
});
