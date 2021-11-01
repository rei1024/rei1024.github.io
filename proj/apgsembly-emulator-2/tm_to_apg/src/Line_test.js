import { assertEquals, test } from "../../test/deps.js";
import { Line, isHaltState } from "./Line.js";

test('parse Line', () => {
    assertEquals(Line.parse('0 0 _ r 1o'), Line.make('0', '0', '_', 'r', '1o'));

    assertEquals(Line.parse('0 0 _ R 1o'), Line.make('0', '0', '_', 'r', '1o'));

    assertEquals(Line.parse('0 0 _ L 1o'), Line.make('0', '0', '_', 'l', '1o'));

    assertEquals(Line.parse('1 a b r 2 !'), Line.make('1', 'a', 'b', 'r', '2'));

    assertEquals(Line.parse('0 0 _ r 1o; abc def'), Line.make('0', '0', '_', 'r', '1o'));

    assertEquals(Line.parse('0 0 _ r 1o !; abc def'), Line.make('0', '0', '_', 'r', '1o'));

    assertEquals(Line.parse(''), undefined);

    assertEquals(Line.parse(' '), undefined);

    assertEquals(Line.parse('; a'), undefined);

    assertEquals(Line.parse('a b ; a'), new Error('must have 5 components but it has 2 at "a b ; a".'));

    assertEquals(Line.parse('0 0 _ x 1o'), new Error(`direction should be 'l', 'r' or '*'`));

    assertEquals(Line.parse('  0   0 _   r  1o '), Line.make('0', '0', '_', 'r', '1o'));
});

test('pretty Line', () => {
    /**
     *
     * @param {string} str
     */
    function v(str) {
        const line = Line.parse(str);
        if (line === undefined) {
            throw new Error('line is undefined');
        }
        if (line instanceof Error) {
            throw line;
        }
        assertEquals(line.pretty(), str);
    }
    v('1 0 _ r 1o');
    v('1 a b r 2');
    v('* * b r 2');
    v('* _ b r 2');
    v('_ * b r 2');
    v('* * * * *');
});

test('isHaltState', () => {
    assertEquals(isHaltState('halt_x'), true);

    assertEquals(isHaltState('halt'), true);

    assertEquals(isHaltState('non_halt_x'), false);

    assertEquals(isHaltState('Halt_x'), true);

    assertEquals(isHaltState('HALT'), true);
    assertEquals(isHaltState('HALTED'), true);
});
