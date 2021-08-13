// while_zero and while_non_zero

main = [
    inc_u(0),
    inc_u(0),
    inc_u(0),
    // Execute the second argument while the first argument does not return 0
    while_non_zero(tdec_u(0), [
        output('1') // if U0 is not zero
    ]),

    // Execute the second argument while the first argument returns 0
    while_zero(nop(), [
        output('0'),
        halt_out()
    ])
]
