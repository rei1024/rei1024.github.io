// if_zero and if_non_zero

main = [
    inc_u(0),
    if_zero(tdec_u(0), [
        output('0') // if U0 is zero
    ], [
        output('1') // if U0 is not zero
    ]),

    if_non_zero(tdec_u(0), [
        output('1') // if U0 is not zero
    ], [
        output('0') // if U0 is zero
    ]),

    // omit else
    if_zero(tdec_u(0), [
        output('2')
    ])
]
