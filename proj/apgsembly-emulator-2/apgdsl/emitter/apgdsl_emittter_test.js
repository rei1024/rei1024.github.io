import { test, assertEquals } from "../../test/deps.js";
import { Emitter } from "./apgdsl_emitter.js";
import { Command, OutputAction, NopAction } from "../apgdsl_deps.js";

test('apgdsl emitter output', () => {
    const emitter = new Emitter();
    emitter.emitFunction('START', { kind: 'function', name: 'output', args: [{ kind: 'string', value: 'a' }] });
    assertEquals(
        emitter.getCommands(),
        [
            new Command({
                actions: [new OutputAction('a'), new NopAction()],
                input: '*',
                nextState: 'STATE0',
                state: 'START'
            })
        ]
    );
});

test('apgdsl emitter tdec_u', () => {
    const emitter = new Emitter();
    emitter.emitFunction('START', { kind: 'function', name: 'tdec_u', args: [{ kind: 'number', value: 0 }] });
    assertEquals(
        emitter.getCommands().map(c => c.pretty()).join('\n'),
        'START; *; STATE0; TDEC U0'
    );
});

test('apgdsl emitter inc_u', () => {
    const emitter = new Emitter();
    emitter.emitFunction('START', { kind: 'function', name: 'inc_u', args: [ { kind: 'number', value: 0 }] });
    assertEquals(
        emitter.getCommands().map(c => c.pretty()).join('\n'),
        'START; *; STATE0; INC U0, NOP'
    );
});

test('apgdsl emitter seq', () => {
    const emitter = new Emitter();
    emitter.emitExpr('START', { kind: 'sequence', exprs: [
        { kind: 'function', name: 'output', args: [ { kind: 'string', value: 'a' }] },
        { kind: 'function', name: 'output', args: [ { kind: 'string', value: 'b' }] }
    ] });
    assertEquals(
        emitter.getCommands().map(c => c.pretty()).join('\n'),
`START; *; STATE0; OUTPUT a, NOP
STATE0; *; STATE1; OUTPUT b, NOP
`.trim()
    );
});
