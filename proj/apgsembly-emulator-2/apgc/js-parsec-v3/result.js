// @ts-check

/**
 * @template A, E
 */
export class Result {
    /**
     * @param {A | E} value
     * @param {boolean} success
     * @private
     */
    constructor(value, success) {
        /**
         * @private
         * @readonly
         */
        this.value = value;

        /**
         * @private
         * @readonly
         */
        this.success = success;
    }

    /**
     * @template A, E
     * @param {A} x 
     * @returns {Result<A, E>}
     */
    static ok(x) {
        // @ts-ignore
        return new Result(x, true);
    }

    /**
     * @template A, E
     * @param {E} x 
     * @returns {Result<A, E>}
     */
    static err(x) {
        // @ts-ignore
        return new Result(x, false);
    }

    /**
     * @template B
     * @param {(_: A) => B} okFunc 
     * @param {(_: E) => B} errFunc 
     * @returns {B}
     */
    fold(okFunc, errFunc) {
        if (this.success) {
            // @ts-ignore
            return okFunc(this.value);
        } else {
            // @ts-ignore
            return errFunc(this.value);
        }
    }

    /**
     * @returns {A}
     */
    unsafeGetValue() {
        // @ts-ignore
        return this.value;
    }

    /**
     * 
     * @returns {boolean}
     */
    isOk() {
        return this.success;
    }

    /**
     * @template B
     * @param {(_: A) => B} f 
     * @returns {Result<B, E>}
     */
    mapOk(f) {
        return this.fold(x => Result.ok(f(x)), y => Result.err(y));
    }

    /**
     * @template E2
     * @param {(_: E) => E2} f 
     * @returns {Result<A, E2>}
     */
    mapErr(f) {
        return this.fold(x => Result.ok(x), y => Result.err(f(y)));
    }

    /**
     * @template B, E2
     * @param {(_: A) => B} okFunc
     * @param {(_: E) => E2} errFunc
     * @returns {Result<B, E2>}
     */
    map(okFunc, errFunc) {
        return this.fold(x => Result.ok(okFunc(x)), y => Result.err(errFunc(y)));
    }

    /**
     * @template A
     * @param {Result<A, never>} result 
     * @returns {A}
     */
    static eraseError(result) {
        return result.fold(x => x, _ => {
            throw Error('eraseError: unreachable');
        });
    }
}
