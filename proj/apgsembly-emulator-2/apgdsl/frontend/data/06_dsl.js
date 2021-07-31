// Declare functions for DSL.

/**
 * Set a value of Un to 0
 * @param {number} n 
 */
function set_u_to_0(n) {
    return [
        while_non_zero(tdec_u(n))
    ]
}

/**
 * ```
 * to = to + from
 * from = 0
 * ```
 * @param {number} from
 * @param {number} to 
 */
function move_u(from, to) {
    return [
        while_non_zero(tdec_u(from), [
            inc_u(to)
        ])
    ]
}

main = [
    inc_u(0),
    inc_u(0),
    inc_u(0),
    // U0 is 3
    set_u_to_0(0),
    // U0 is 0

    inc_u(1),
    inc_u(1),
    inc_u(1),
    inc_u(2),
    // U1 is 3, U2 is 1
    move_u(1, 2) // U2 = U1 + U2, U1 = 0
    // U1 is 0, U2 is 4
]
