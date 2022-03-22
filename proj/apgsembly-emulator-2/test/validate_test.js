// @ts-check

import { NopAction } from "../src/actions/NopAction.js";
import { OutputAction } from "../src/actions/OutputAction.js";
import { HaltOutAction } from "../src/actions/HaltOutAction.js";
import { URegAction, U_INC } from "../src/actions/URegAction.js";
import { Command } from "../src/Command.js";
import { validateNoSameComponent } from "../src/validators/no_same_component.js";
import { validateActionReturnOnce } from "../src/validators/action_return_once.js";
import { validateNoDuplicatedAction } from "../src/validators/no_dup_action.js";
import { validateAll } from "../src/validate.js";
import { assertEquals, test } from "./deps.js";

test('validateAll', () => {
    assertEquals(validateAll([
        new Command({
            state: "INITIAL",
            input: "ZZ",
            nextState: "A0",
            actions: [new URegAction(U_INC, 0), new URegAction(U_INC, 0), new NopAction()]
        })
    ]), `Duplicated actions "INC U0" in "INITIAL; ZZ; A0; INC U0, INC U0, NOP"
Actions "INC U0" and "INC U0" use same component in "INITIAL; ZZ; A0; INC U0, INC U0, NOP"`);
});

test('validateActionReturnOnce HALT_OUT', () => {
    const err = validateActionReturnOnce([
        new Command({
            state: "INITIAL",
            input: "ZZ",
            nextState: "A0",
            actions: [new HaltOutAction(), new HaltOutAction()]
        })
    ]);
    // FIXME: とりあえず無視
    assertEquals(err, undefined);
});

test('validateNoSameComponent NOP NOP', () => {
    const err = validateNoSameComponent([
        new Command({
            state: "INITIAL",
            input: "ZZ",
            nextState: "A0",
            actions: [new NopAction(), new NopAction()]
        })
    ]);
    if (err === undefined) {
        throw Error('expected error');
    } else {
        assertEquals(
            err,
            [`Actions "NOP" and "NOP" use same component in "INITIAL; ZZ; A0; NOP, NOP"`]
        );
    }
});

test('validateNoDuplicatedAction NOP NOP', () => {
    const err = validateNoDuplicatedAction([
        new Command({
            state: "INITIAL",
            input: "ZZ",
            nextState: "A0",
            actions: [new NopAction(), new NopAction()]
        })
    ]);
    if (err === undefined) {
        throw Error('expected error');
    } else {
        assertEquals(
            err,
            [`Duplicated actions "NOP" in "INITIAL; ZZ; A0; NOP, NOP"`]
        );
    }
});

test('validateNoDuplicatedAction NOP, OUTPUT 1, NOP', () => {
    const err = validateNoDuplicatedAction([
        new Command({
            state: "INITIAL",
            input: "ZZ",
            nextState: "A0",
            actions: [new NopAction(), new OutputAction("1"), new NopAction()]
        })
    ]);
    if (err === undefined) {
        throw Error('expected error');
    } else {
        assertEquals(
            err,
            [`Duplicated actions "NOP" in "INITIAL; ZZ; A0; NOP, OUTPUT 1, NOP"`]
        );
    }
});
