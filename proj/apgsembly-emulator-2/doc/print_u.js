// # 1. 桁数を算出してnとする
// # 2. 10^(n-1)を計算してmとする
// # 3. Unからmを引けるだけ引いて引いた回数をxとする
// # 4. xに応じて出力
// # 5. Unが0なら終了、0以外ならmを10で割って3へ戻る

// # 桁数算出
// # t = 1とする
// # t < Unの間tを10倍する

function print(n) {
    let [digit, step] = largestUnit(n);
    while (true) {
        let x = 0;
        while (true) {
            if (n >= step) {
                n -= step;
                x++;
            } else {
                console.log(x);
                if (step === 1) {
                    return;
                }
                step = Math.floor(step / 10);
                break;
            }
        }
    }
}

/**
 * @param {number} n
 * @returns {[number_of_digits: number, largestUnit: number]}
 */
function largestUnit(n) {
    let step = 1;
    let digit = 1;
    while (true) {
        for (let i = 0; i < 9; i++) {
            n -= step;
            if (n <= 0) {
                return [digit, step];
            }
        }
        digit++;
        step *= 10;
    }
}

// expand
function print2(n) {
    let step = largestUnit2(n);
    while (true) {
        let x = 0;
        while (true) {
            if (n >= step) {
                n -= step;
                x++;
            } else {
                console.log("digit:", x);
                if (step === 1) {
                    return;
                }
                step = Math.floor(step / 10);
                break;
            }
        }
    }
}

print2(123);

/**
 * @param {number} n
 * @returns {number}
 */
function largestUnit2(n) {
    let step = 1;
    while (true) {
        n -= step;
        if (n <= 0) {
            return step;
        }
        n -= step;
        if (n <= 0) {
            return step;
        }
        n -= step;
        if (n <= 0) {
            return step;
        }
        n -= step;
        if (n <= 0) {
            return step;
        }
        n -= step;
        if (n <= 0) {
            return step;
        }
        n -= step;
        if (n <= 0) {
            return step;
        }
        n -= step;
        if (n <= 0) {
            return step;
        }
        n -= step;
        if (n <= 0) {
            return step;
        }
        n -= step;
        if (n <= 0) {
            return step;
        }
        step *= 10;
    }
}

// console.log(largestUnit2(0))

// console.log(largestUnit2(1))

// console.log(largestUnit2(100))
// print2(123);

/**
 * @param {string} prefix
 * @param {string} start 最初の状態 prefixが前に付く
 * @param {string} end 最後の状態 prefixが前に付く
 * @param {string} innerStart for文の中の始まりの状態
 * @param {string} innerEnd for文の外の始まりの状態
 * @param {number} regNum 繰り返す回数（実行後も保たれる）
 * @param {number} tempRegNum 中で0にしてから使用する
 * @returns
 */
export function forEach(
    prefix,
    start,
    end,
    innerStart,
    innerEnd,
    regNum,
    tempRegNum,
) {
    /**
     * @type {string[]}
     */
    const array = [];
    array.push(`${prefix}${start}; *; ${prefix}FOR_ZERO_1; NOP`);

    // tempRegNum = 0
    array.push(
        `${prefix}FOR_ZERO_1; Z; ${prefix}FOR_COPY_1; TDEC U${tempRegNum}`,
    );
    array.push(`${prefix}FOR_ZERO_1; NZ; ${prefix}FOR_ZERO_1; NOP`);

    // move regNum to tempRegNum
    array.push(`${prefix}FOR_COPY_1; *; ${prefix}FOR_COPY_2; TDEC U${regNum}`);
    array.push(`${prefix}FOR_COPY_2; Z; ${prefix}FOR_BODY_1; NOP`);
    array.push(
        `${prefix}FOR_COPY_2; NZ; ${prefix}FOR_COPY_1; INC U${tempRegNum}, NOP`,
    );

    // for
    array.push(
        `${prefix}FOR_BODY_1; *; ${prefix}FOR_BODY_2; TDEC U${tempRegNum}`,
    );
    array.push(`${prefix}FOR_BODY_2; Z; ${prefix}${end}; NOP`);
    array.push(`${prefix}FOR_BODY_2; NZ; ${prefix}${innerStart}; NOP`);
    array.push(`${prefix}${innerEnd}; *; ${prefix}FOR_BODY_1; NOP`);
    return array;
}

/**
 * ```
 * `${prefix}PRINT_START`
 * `${prefix}PRINT_END`
 * ```
 * @param {number} regNum Un
 * @param {number} tempRegNum1 0
 * @param {number} tempRegNum2 0
 * @param {number} tempRegNum3 0
 * @param {number} tenRegNum 10が保存されているレジスタ
 * @param {string} [prefix]
 * @returns {string}
 */
export function makeAPG(
    regNum,
    tempRegNum1,
    tempRegNum2,
    tempRegNum3,
    tenRegNum,
    prefix = "",
) {
    /**
     * @type {string[]}
     */
    const array = [];

    array.push(
        `${prefix}PRINT_START; *; ${prefix}LARGEST_UNIT_1; INC U${tempRegNum2}, NOP`,
    );

    const tenRegNumTemp = tempRegNum1;

    {
        array.push(
            `${prefix}LARGEST_UNIT_1; *; ${prefix}LARGEST_UNIT_2; TDEC U${tenRegNum}, INC U${tenRegNumTemp}`,
        );
        array.push(
            `${prefix}LARGEST_UNIT_2; Z; ${prefix}LARGEST_UNIT_MUL_STEP_1; NOP`,
        );
        array.push(
            `${prefix}LARGEST_UNIT_2; NZ; ${prefix}LARGEST_UNIT_SUB_1; TDEC U${tenRegNum}, INC U${tempRegNum1}`,
        );
    }

    array.push(`${prefix}PRINT_END`);

    return array.join("\n");
}
