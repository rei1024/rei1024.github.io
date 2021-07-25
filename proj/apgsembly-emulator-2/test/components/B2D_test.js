import { B2DAction } from "../../src/actions/B2DAction.js";
import { B2D } from "../../src/components/B2D.js";
import { assertEquals, assertThrows, test } from "../deps.js";

test("B2D read initial", () => {
    const x = new B2D();
    assertEquals(x.read(), 0);
});

test("B2D set read", () => {
    const x = new B2D();
    x.set();
    assertEquals(x.read(), 1);
});

test("B2D set read twice", () => {
    const x = new B2D();
    x.set();
    assertEquals(x.read(), 1);
    assertEquals(x.read(), 0);
});

test("B2D incB2DX", () => {
    const x = new B2D();
    assertEquals(x.incB2DX(), undefined);
    assertEquals(x.x, 1);
    assertEquals(x.y, 0);
});

test("B2D incB2DY", () => {
    const x = new B2D();
    assertEquals(x.incB2DY(), undefined);
    assertEquals(x.x, 0);
    assertEquals(x.y, 1);
});

test("B2D tdec X", () => {
    const x = new B2D();
    assertEquals(x.incB2DX(), undefined);
    assertEquals(x.x, 1);
    assertEquals(x.y, 0);
    assertEquals(x.tdecB2DX(), 1);
    assertEquals(x.x, 0);
    assertEquals(x.y, 0);
});

test("B2D tdec Y", () => {
    const x = new B2D();
    assertEquals(x.incB2DY(), undefined);
    assertEquals(x.x, 0);
    assertEquals(x.y, 1);
    assertEquals(x.tdecB2DY(), 1);
    assertEquals(x.x, 0);
    assertEquals(x.y, 0);
});


test("B2D tdec 0", () => {
    const x = new B2D();
    assertEquals(x.tdecB2DX(), 0);
    assertEquals(x.tdecB2DY(), 0);
    assertEquals(x.x, 0);
    assertEquals(x.y, 0);
});

test("B2D incB2DX set", () => {
    const x = new B2D();
    assertEquals(x.incB2DX(), undefined);
    assertEquals(x.x, 1);
    assertEquals(x.y, 0);
    x.set();
    assertEquals(x.read(), 1);
});

test("B2D incB2DX read", () => {
    const x = new B2D();
    assertEquals(x.incB2DX(), undefined);
    assertEquals(x.x, 1);
    assertEquals(x.y, 0);
    assertEquals(x.read(), 0);
});

test("B2D incB2DX read", () => {
    const x = new B2D();
    assertEquals(x.incB2DX(), undefined);
    assertEquals(x.incB2DY(), undefined);
    assertEquals(x.x, 1);
    assertEquals(x.y, 1);
    assertEquals(x.read(), 0);
});

test("B2D incB2DX read set", () => {
    const x = new B2D();
    x.incB2DX();
    x.incB2DY();
    assertEquals(x.read(), 0);
    x.set();
    assertEquals(x.read(), 1);
});


test("B2D set Error", () => {
    const x = new B2D();
    x.set();
    assertThrows(() => {
        x.set();
    });
});

test("B2D toString", () => {
    const x = new B2D();
    assertEquals(x.toString(), "0");
});

// action
test("B2D action INC B2DX", () => {
    const x = new B2D();
    x.action(B2DAction.parse('INC B2DX'));
    assertEquals(x.x, 1);
});

test("B2D action INC B2DY", () => {
    const x = new B2D();
    x.action(B2DAction.parse('INC B2DY'));
    assertEquals(x.y, 1);
});

test("B2D action TDEC B2DX", () => {
    const x = new B2D();
    const res = x.action(B2DAction.parse('TDEC B2DX'));
    assertEquals(res, 0);
});

test("B2D action TDEC B2DY", () => {
    const x = new B2D();
    const res = x.action(B2DAction.parse('TDEC B2DY'));
    assertEquals(res, 0);
});

test("B2D action READ B2D", () => {
    const x = new B2D();
    const res = x.action(B2DAction.parse('READ B2D'));
    assertEquals(res, 0);
});

test("B2D action SET B2D", () => {
    const x = new B2D();
    const res = x.action(B2DAction.parse('SET B2D'));
    assertEquals(res, undefined);
    assertEquals(x.read(), 1);
});
