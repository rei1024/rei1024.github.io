import { completionParser, removeComment } from "./completion_parser.ts";
import { assertEquals, test } from "../../deps_test.ts";

test("parser: removeComment empty", () => {
    assertEquals(removeComment(""), "");
});

test("parser: removeComment", () => {
    assertEquals(removeComment("abc"), "abc");
});

test("parser: removeComment comment", () => {
    assertEquals(removeComment("abc /* def */ hij"), "abc  hij");

    assertEquals(removeComment("abc /* def */ /* xyz */ hij"), "abc   hij");

    assertEquals(
        removeComment("abc /* def */ 123 /* xyz */ hij"),
        "abc  123  hij",
    );

    assertEquals(removeComment("/**/"), "");
    assertEquals(removeComment("/**/a"), "a");
    assertEquals(removeComment("a/**/"), "a");

    // ネスト未対応
    assertEquals(removeComment("/* a /* b */ c */"), " c ");
});

test("parser: completionParser empty", () => {
    assertEquals(completionParser(``), []);
});

test("parser: completionParser simple", () => {
    assertEquals(completionParser(`macro f!() {}`), [{
        name: "f!",
        args: [],
    }]);
});

test("parser: completionParser partial", () => {
    // partial program
    assertEquals(completionParser(`macro f!() {} {`), [{
        name: "f!",
        args: [],
    }]);
});

test("parser: completionParser", () => {
    // multiple
    assertEquals(
        completionParser(`macro f!() {}
    macro g!() {}`),
        [
            {
                name: "f!",
                args: [],
            },
            {
                name: "g!",
                args: [],
            },
        ],
    );

    // args 1
    assertEquals(completionParser(`macro f!(a) {}`), [{
        name: "f!",
        args: ["a"],
    }]);

    // args 2
    assertEquals(completionParser(`macro f!(a,b) {}`), [{
        name: "f!",
        args: ["a", "b"],
    }]);

    // args space
    assertEquals(completionParser(`macro f!(a, b) {}`), [{
        name: "f!",
        args: ["a", "b"],
    }]);

    // args line break
    assertEquals(
        completionParser(`macro f!(
        a,
        b
    ) {}`),
        [{
            name: "f!",
            args: ["a", "b"],
        }],
    );

    // args multiple line break
    assertEquals(
        completionParser(`macro f!(
        a,
        b
    ) {}

    macro g!(
        x,
        y
    ) {}
    `),
        [
            {
                name: "f!",
                args: ["a", "b"],
            },
            {
                name: "g!",
                args: ["x", "y"],
            },
        ],
    );

    assertEquals(
        completionParser(`
        macro my_output(y) {
            output(y);
        }

        macro my_output!(x) {
            output(x);
        }

        /* using macro */
        my_output!("0");`),
        [{
            name: "my_output!",
            args: ["x"],
        }],
    );

    assertEquals(
        completionParser(`
        /*
    # macro

    ## syntax
    macro <macro_name>(<macro_variable>*) <expression>
*/

/* macro declaration */
/* name of macro must end with "!" */
macro my_output!(x) {
    output(x);
}

/* using macro */
my_output!("0");

`),
        [{
            name: "my_output!",
            args: ["x"],
        }],
    );

    assertEquals(
        completionParser(`
macro f!

macro my_output!(x) {
    output(x);
}

/* using macro */
my_output!("0");

`),
        [{
            name: "my_output!",
            args: ["x"],
        }],
    );
});
