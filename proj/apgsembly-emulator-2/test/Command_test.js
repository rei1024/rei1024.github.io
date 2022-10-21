// @ts-check

import { URegAction } from "../src/actions/URegAction.js";
import {
    Command,
    ComponentsHeader,
    EmptyLine,
    RegistersHeader,
    parseProgramLine,
} from "../src/Command.js";
import { assertEquals, test } from "./deps.js";

test('Command parse', () => {
    const str = `INITIAL; ZZ; DIR0; TDEC U2`;
    const res = parseProgramLine(str);
    if (res instanceof Command) {
        assertEquals(res.state, 'INITIAL');
        assertEquals(res.input, 'ZZ');
        assertEquals(res.nextState, 'DIR0');
        assertEquals(res.actions, [URegAction.parse('TDEC U2')]);
    } else {
        throw Error('parse error ' + str);
    }
});

test('Command parse line', () => {
    const str = `INITIAL; ZZ; DIR0; TDEC U2`;
    const res = parseProgramLine(str, 42);
    if (res instanceof Command) {
        assertEquals(res.line, 42);
    } else {
        throw Error('parse error ' + str);
    }
});

test('Command parse empty line', () => {
    const str = ``;
    const res = parseProgramLine(str);
    if (!(res instanceof EmptyLine)) {
        throw Error('parse error ' + str);
    }
});

test('Command parse multi action', () => {
    const str = `INITIAL; ZZ; DIR0; TDEC U2, INC U3`;
    const res = parseProgramLine(str);
    if (res instanceof Command) {
        assertEquals(res.state, 'INITIAL');
        assertEquals(res.input, 'ZZ');
        assertEquals(res.nextState, 'DIR0');
        assertEquals(
            res.actions,
            [URegAction.parse('TDEC U2'), URegAction.parse('INC U3')]
        );
    } else {
        throw Error('parse error ' + str);
    }
});

test('Command parse unknown action', () => {
    const str = `INITIAL; ZZ; DIR0; UNKNOWN`;
    const res = parseProgramLine(str);
    if (typeof res === "string") {
        assertEquals(
            res,
            'Unknown action "UNKNOWN" in "INITIAL; ZZ; DIR0; UNKNOWN"'
        );
    } else {
        throw Error('expect parse error ' + str);
    }
});

test('Command parse unknown input', () => {
    const str = `INITIAL; XXXXX; DIR0; INC U3`;
    const res = parseProgramLine(str);
    if (typeof res === "string") {
        assertEquals(
            res,
            'Unknown input "XXXXX" in "INITIAL; XXXXX; DIR0; INC U3". Expect "Z", "NZ", "ZZ" or "*"'
        );
    } else {
        throw Error('expect parse error ' + str);
    }
});

test('Command parse pretty', () => {
    const str = `INITIAL; ZZ; DIR0; TDEC U2`;
    const res = parseProgramLine(str);
    if (res instanceof Command) {
        assertEquals(res.pretty(), str);
    } else {
        throw Error('parse error ' + str);
    }
});

test('Command REGISTERS', () => {
    const str = '#REGISTERS {}';
    const res = parseProgramLine(str);
    if (res instanceof RegistersHeader) {
        assertEquals(res.content, '{}');
    } else {
        throw Error('parse error ' + str);
    }
});

test('Command REGISTERS space', () => {
    const str = '#REGISTERS{}';
    const res = parseProgramLine(str);
    if (res instanceof RegistersHeader) {
        assertEquals(res.content, '{}');
    } else {
        throw Error('parse error ' + str);
    }
});

test('Command COMPONENTS', () => {
    const str = '#COMPONENTS B2';
    const res = parseProgramLine(str);
    if (res instanceof ComponentsHeader) {
        assertEquals(res.content, 'B2');
    } else {
        throw Error('parse error ' + str);
    }
});

test('Command COMPONENTS space', () => {
    const str = '#COMPONENTSB2';
    const res = parseProgramLine(str);
    if (res instanceof ComponentsHeader) {
        assertEquals(res.content, 'B2');
    } else {
        throw Error('parse error ' + str);
    }
});
