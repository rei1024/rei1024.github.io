// @ts-check

// deno run docs/data_next/pi.js
import process from "node:process";

/**
 * @param {number} N
 */
function calcPi(N) {
    let u0 = 0n;
    let u1 = 1n;
    let u2 = 0n;
    // const u6 = 6n;
    let u8 = 0n;
    let u4 = 0n;
    let u3 = 0n;
    let b0 = 2n;
    let b1 = 0n;
    let b2 = 1n;
    let b3 = 0n;

    let res = "";

    for (let i = 0; i < N; i++) {
        for (let j = 0; j < 4; j++) {
            // console.log({
            //     j,
            //     u0,
            //     u1,
            //     u4,
            //     b0,
            //     b1,
            //     b2,
            //     b3,
            // });
            u0 += 1n;
            u1 += 2n;

            // A
            b3 = b1;
            b1 = b1 + (u1 - 1n) * b3;

            // B
            b3 = b0;
            b0 = b0 + (u0 - 1n) * b3;

            // C
            b1 = b1 + (u1 * b3);

            // D
            u4++;
            b3 = b2;
            b2 = b2 + (u1 - 1n) * b3;
        }

        u8 = u3;

        b3 = b1;

        // u2 = ((b1 * (10n ** u3)) / b2) % 10n;
        while (true) {
            // higher level
            // const [q, r] = [b3 / b2, b3 % b2];
            // u2 = q;
            // b3 = r;
            // if (u8 === 0n) {
            //     break;
            // } else {
            //     u8--;
            //     u2 = 0n;
            //     b3 *= 10n;
            // }

            // APGsembly
            if (b2 <= b3) {
                b3 = b3 - b2;
                u2++;
            } else {
                if (u8 === 0n) {
                    break;
                } else {
                    u8--;
                    u2 = 0n;
                    b3 *= 10n;
                }
            }
        }

        res += `${u2}`;
        process.stdout.write(`${u2}`);
        u2 = 0n;

        if (u3 === 0n) {
            res += ".";
            process.stdout.write(`.`);
        }

        u3++;
    }
    console.log();
    // console.log(res);
}

calcPi(100);
