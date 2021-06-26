import { URegAction } from "../src/actions/URegAction.js";
import { Command, ComponentsHeader, RegistersHeader } from "../src/Command.js";
import { assertEquals } from "./deps.js";

Deno.test('Command parse', () => {
    const str = `INITIAL; ZZ; DIR0; TDEC U2`;
    const res = Command.parse(str);
    if (res instanceof Command) {
        assertEquals(res.state, 'INITIAL');
        assertEquals(res.input, 'ZZ');
        assertEquals(res.nextState, 'DIR0');
        assertEquals(res.actions, [URegAction.parse('TDEC U2')]);
    } else {
        throw Error('parse error ' + str);
    }
});

Deno.test('Command parse multi action', () => {
    const str = `INITIAL; ZZ; DIR0; TDEC U2, INC U3`;
    const res = Command.parse(str);
    if (res instanceof Command) {
        assertEquals(res.state, 'INITIAL');
        assertEquals(res.input, 'ZZ');
        assertEquals(res.nextState, 'DIR0');
        assertEquals(res.actions, [URegAction.parse('TDEC U2'), URegAction.parse('INC U3')]);
    } else {
        throw Error('parse error ' + str);
    }
});

Deno.test('Command parse unkown action', () => {
    const str = `INITIAL; ZZ; DIR0; UNKOWN`;
    const res = Command.parse(str);
    if (typeof res === "string") {
        assertEquals(res, 'unkown action "UNKOWN" at "INITIAL; ZZ; DIR0; UNKOWN"');
    } else {
        throw Error('expect parse error ' + str);
    }
});

Deno.test('Command parse empty action', () => {
    const str = `INITIAL; ZZ; DIR0;`;
    const res = Command.parse(str);
    if (typeof res === "string") {
        
    } else {
        throw Error('expect parse error ' + str);
    }
});

Deno.test('Command parse unkown input', () => {
    const str = `INITIAL; XXXXX; DIR0; INC U3`;
    const res = Command.parse(str);
    if (typeof res === "string") {
        assertEquals(res, 'unkown input "XXXXX" at "INITIAL; XXXXX; DIR0; INC U3"');
    } else {
        throw Error('expect parse error ' + str);
    }
});

Deno.test('Command parse pretty', () => {
    const str = `INITIAL; ZZ; DIR0; TDEC U2`;
    const res = Command.parse(str);
    if (res instanceof Command) {
        assertEquals(res.pretty(), str);
    } else {
        throw Error('parse error ' + str);
    }
});

Deno.test('Command REGISTERS', () => {
    const str = '#REGISTERS {}';
    const res = Command.parse(str);
    if (res instanceof RegistersHeader) {
        assertEquals(res.content, '{}');
    } else {
        throw Error('parse error ' + str);
    }
});

Deno.test('Command REGISTERS space', () => {
    const str = '#REGISTERS{}';
    const res = Command.parse(str);
    if (res instanceof RegistersHeader) {
        assertEquals(res.content, '{}');
    } else {
        throw Error('parse error ' + str);
    }
});

Deno.test('Command COMPONENTS', () => {
    const str = '#COMPONENTS B2';
    const res = Command.parse(str);
    if (res instanceof ComponentsHeader) {
        assertEquals(res.content, 'B2');
    } else {
        throw Error('parse error ' + str);
    }
});

Deno.test('Command COMPONENTS space', () => {
    const str = '#COMPONENTSB2';
    const res = Command.parse(str);
    if (res instanceof ComponentsHeader) {
        assertEquals(res.content, 'B2');
    } else {
        throw Error('parse error ' + str);
    }
});
