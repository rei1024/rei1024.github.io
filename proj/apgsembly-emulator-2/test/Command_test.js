// @ts-check

import { URegAction } from "../src/actions/URegAction.js";
import {
    Command,
    ComponentsHeader,
    Define,
    EmptyLine,
    Enddef,
    Include,
    Insert,
    parseProgramLine,
    RegistersHeader,
} from "../src/Command.js";
import { assertEquals, test, throwError } from "./deps.js";

test("Command parse", () => {
    const str = `INITIAL; ZZ; DIR0; TDEC U2`;
    const res = parseProgramLine(str);
    if (res instanceof Command) {
        assertEquals(res.state, "INITIAL");
        assertEquals(res.input, "ZZ");
        assertEquals(res.nextState, "DIR0");
        assertEquals(res.actions, [
            URegAction.parse("TDEC U2") ?? throwError(),
        ]);
    } else {
        throw Error("parse error " + str);
    }
});

test("Command parse line", () => {
    const str = `INITIAL; ZZ; DIR0; TDEC U2`;
    const res = parseProgramLine(str, 42);
    if (res instanceof Command) {
        assertEquals(res.line, 42);
    } else {
        throw Error("parse error " + str);
    }
});

test("Command parse empty line", () => {
    const str = ``;
    const res = parseProgramLine(str);
    if (!(res instanceof EmptyLine)) {
        throw Error("parse error " + str);
    }
});

test("Command parse multi action", () => {
    const str = `INITIAL; ZZ; DIR0; TDEC U2, INC U3`;
    const res = parseProgramLine(str);
    if (res instanceof Command) {
        assertEquals(res.state, "INITIAL");
        assertEquals(res.input, "ZZ");
        assertEquals(res.nextState, "DIR0");
        assertEquals(
            res.actions,
            [
                URegAction.parse("TDEC U2") ?? throwError(),
                URegAction.parse("INC U3") ?? throwError(),
            ],
        );
    } else {
        throw Error("parse error " + str);
    }
});

test("Command parse unknown action", () => {
    const str = `INITIAL; ZZ; DIR0; UNKNOWN`;
    const res = parseProgramLine(str);
    if (typeof res === "string") {
        assertEquals(
            res,
            'Unknown action "UNKNOWN" in "INITIAL; ZZ; DIR0; UNKNOWN"',
        );
    } else {
        throw Error("expect parse error " + str);
    }
});

test("Command parse unknown input", () => {
    const str = `INITIAL; XXXXX; DIR0; INC U3`;
    const res = parseProgramLine(str);
    if (typeof res === "string") {
        assertEquals(
            res,
            'Unknown input "XXXXX" in "INITIAL; XXXXX; DIR0; INC U3". Expect "Z", "NZ", "ZZ" or "*"',
        );
    } else {
        throw Error("expect parse error " + str);
    }
});

test("Command parse pretty", () => {
    const str = `INITIAL; ZZ; DIR0; TDEC U2`;
    const res = parseProgramLine(str);
    if (res instanceof Command) {
        assertEquals(res.pretty(), str);
    } else {
        throw Error("parse error " + str);
    }
});

test("Command REGISTERS", () => {
    const str = "#REGISTERS {}";
    const res = parseProgramLine(str);
    if (res instanceof RegistersHeader) {
        assertEquals(res.content, "{}");
    } else {
        throw Error("parse error " + str);
    }
});

test("Command REGISTERS space", () => {
    const str = "#REGISTERS{}";
    const res = parseProgramLine(str);
    if (res instanceof RegistersHeader) {
        assertEquals(res.content, "{}");
    } else {
        throw Error("parse error " + str);
    }
});

test("Command COMPONENTS", () => {
    const str = "#COMPONENTS B2";
    const res = parseProgramLine(str);
    if (res instanceof ComponentsHeader) {
        assertEquals(res.content, "B2");
    } else {
        throw Error("parse error " + str);
    }
});

test("Command COMPONENTS space", () => {
    const str = "#COMPONENTSB2";
    const res = parseProgramLine(str);
    if (res instanceof ComponentsHeader) {
        assertEquals(res.content, "B2");
    } else {
        throw Error("parse error " + str);
    }
});

test("Command #DEFINE", () => {
    const str = "#DEFINE Bxx = Byy { zero = N }";
    const res = parseProgramLine(str);
    if (res instanceof Define) {
        assertEquals(res.defaultReplacements, [{
            needle: "zero",
            replacement: "N",
        }]);
        assertEquals(res.name, "Bxx = Byy");
        assertEquals(res.pretty(), str);
    } else {
        throw Error("parse error " + str);
    }
});

test("Command #DEFINE 2", () => {
    const str = "#DEFINE Bxx = Byy { zero = N; two = Y }";
    const res = parseProgramLine(str);
    if (res instanceof Define) {
        assertEquals(res.defaultReplacements, [{
            needle: "zero",
            replacement: "N",
        }, {
            needle: "two",
            replacement: "Y",
        }]);
        assertEquals(res.name, "Bxx = Byy");
        assertEquals(res.pretty(), str);
    } else {
        throw Error("parse error " + str);
    }
});

test("Command #DEFINE 0", () => {
    const str = "#DEFINE Bxx = Byy";
    const res = parseProgramLine(str);
    if (res instanceof Define) {
        assertEquals(res.defaultReplacements, []);
        assertEquals(res.name, "Bxx = Byy");
        assertEquals(res.pretty(), "#DEFINE Bxx = Byy");
    } else {
        throw Error("parse error " + str);
    }
});

test("Command #INSERT", () => {
    const str = "#INSERT Bxx += Byy { xx = 1; yy = 0 }";
    const res = parseProgramLine(str);
    if (res instanceof Insert) {
        assertEquals(res.replacements, [
            { needle: "xx", replacement: "1" },
            { needle: "yy", replacement: "0" },
        ]);
        assertEquals(res.templateName, "Bxx += Byy");
        assertEquals(res.pretty(), str);
    } else {
        throw Error("parse error " + str);
    }
});

test("Command #ENDDEF", () => {
    const str = "#ENDDEF";
    const res = parseProgramLine(str);
    if (res instanceof Enddef) {
        return;
    } else {
        throw Error("parse error " + str);
    }
});

test("Command #INCLUDE", () => {
    const str = "#INCLUDE test.apglib";
    const res = parseProgramLine(str);
    if (res instanceof Include) {
        assertEquals(res.filename, "test.apglib");
    } else {
        throw Error("parse error " + str);
    }
});
