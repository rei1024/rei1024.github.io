import { assertEquals, test } from "../../test/deps.js";
import { Line } from "./Line.js";

test('parse Line', () => {
    assertEquals(Line.parse('0 0 _ r 1o'), Line.make('0', '0', '_', 'r', '1o'));

    assertEquals(Line.parse('1 a b r 2 !'), Line.make('1', 'a', 'b', 'r', '2'));

    assertEquals(Line.parse('0 0 _ r 1o; abc def'), Line.make('0', '0', '_', 'r', '1o'));

    assertEquals(Line.parse(''), undefined);

    assertEquals(Line.parse(' '), undefined);

    assertEquals(Line.parse('; a'), undefined);

    assertEquals(Line.parse('a b ; a'), new Error('must have 5 components but it has 2 at "a b ; a".'));

    assertEquals(Line.parse('0 0 _ x 1o'), new Error(`direction should be 'l', 'r' or '*'`));

    assertEquals(Line.parse('  0   0 _   r  1o '), Line.make('0', '0', '_', 'r', '1o'));
});

test('pretty Line', () => {
    const str = '1 0 _ r 1o';
    assertEquals(Line.parse(str).pretty(), str);
});
