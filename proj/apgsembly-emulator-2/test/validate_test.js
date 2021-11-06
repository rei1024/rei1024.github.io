// @ts-check

import { NopAction } from "../src/actions/NopAction.js";
import { OutputAction } from "../src/actions/OutputAction.js";
import { Command } from "../src/Command.js";
import { validateNoDuplicatedAction, validateNoSameComponent } from "../src/validate.js";
import { assertEquals, test } from "./deps.js";

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
