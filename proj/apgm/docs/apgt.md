# APGT language

- statically typed
- binary number
- function
- reference?

## syntax

- haskell
- ts

## MVP

```ts
let x = 3;

function outputNat(x: Nat): void;

function calc(x: Nat, y: Nat, z: Nat): Nat {
    return x * y + z;
}

function main() {
    for (let i = 0; i < 10; i++) {
        outputNat(calc(1, 2, 3));
    }
    for (const i of range(0, 10)) { // special construct
        outputNat(calc(1, 2, 3));
    }
}

main();
```
