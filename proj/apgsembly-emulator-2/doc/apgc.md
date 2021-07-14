### Un
* `inc_u(n)`
* `tdec_u(n)`

### Bn
* `inc_b(n)`
* `tdec_b(n)`
* `set_b(n)`
* `read_b(n)`

### B2D
* `inc_b2dx()`
* `inc_b2dx()`

* `tdec_b2dx()`
* `tdec_b2dy()`

* `read_b2d()`
* `set_b2d()`

### ADD
* `add_b1()`

### MUL
* `mul_0()`
* `mul_1()`

### OUTPUT
* `output("1")`

* `output("1", "2")`

### NOP
* `nop()`

### HALT_OUT
* `halt_out()`

## if文とwhile文のalternativeな表記
* これに変更する

```

if_zero(read_b(3)) {

}

if_zero(read_b2dx()) {

} else {

}

while_non_zero(read_b(3)) {

}

loop {

}

```

```
label("START"); # APGC_LABEL_STATEでNOP
goto("START");
```

### git hooks
```
cp git_hooks_sample/pre-commit .git/hooks/pre-commit
chmod a+x .git/hooks/pre-commit
```
